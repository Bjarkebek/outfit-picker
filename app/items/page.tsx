// app/items/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';

// Base Item (uden subtype-felter)
type Item = {
  id: string;
  category: 'top' | 'bottom' | 'jacket' | 'shoes' | 'hairclip' | 'jewelry';
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  shade: 'light' | 'medium' | 'dark' | null;
  statement_piece: boolean | null;
  owner_id?: string | null;
};

// Subtype “views” vi henter ved siden af
type TopRow     = { item_id: string; type: string | null; sleevelength: 'short'|'long'|null };
type BottomRow  = { item_id: string; type: string | null };
type JacketRow  = { item_id: string; type: string | null };
type ShoeRow    = { item_id: string; type: string | null; heel: boolean | null };
type JewelryRow = { item_id: string; type: string | null };

// UI constants
const CATEGORIES: Item['category'][] = ['top', 'bottom', 'jacket', 'shoes', 'hairclip', 'jewelry'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter', 'all-season'] as const;
const SHADES = ['light', 'medium', 'dark'] as const;
const TOP_TYPES_FIXED = ['t-shirt','shirt','blouse','cardigan','sweater','hoodie','dress','vest'] as const;
const BOTTOM_TYPES_FIXED = ['pants','jeans','shorts','sweatpants','skirt','leggins'] as const;
const SHOES_TYPES_FIXED = ['sneakers','sandals','boots','heels','flats','slippers'] as const;
const JACKET_TYPES_FIXED = ['blazer','denim','puffer','parka','overcoat','trenchcoat','raincoat','windbreaker'] as const;
const JEWLERY_TYPES_FIXED = ['earrings','necklace','bracelet','rings','watch'] as const;
const SLEEVELENGTHS = ['short', 'medium', 'long'] as const;

const cardClass =
  'rounded-xl border bg-white/90 backdrop-blur p-5 shadow-sm border-gray-200 dark:bg-white/5 dark:border-white/10';
const pillMuted =
  'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80';
const inputClass =
  'w-full rounded-lg px-3 py-2 border transition focus:outline-none focus:ring-2 ' +
  'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 ' +
  'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400';
const buttonPrimary =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed';

// Hjælpestruktur til at vise subtype felter i listen
type SubtypeView = {
  type?: string | null;
  sleevelength?: 'short'|'long'|null;
  heel?: boolean | null;
};

// ---------- Create form state ----------
function useCreateState() {
  const [category, setCategory] = useState<Item['category']>('top');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [season, setSeason] = useState<string | null>(null);
  const [shade, setShade] = useState<string | null>(null);
  const [statementPiece, setStatementPiece] = useState(false);

  // subtype inputs
  const [typeValue, setTypeValue] = useState(''); // top/bottom/jacket/shoes/jewelry
  const [sleevelength, setSleevelength] = useState<'short'|'long'|null>(null); // top
  const [heel, setHeel] = useState<boolean>(false); // shoes

  const [file, setFile] = useState<File | null>(null);

  return {
    category, setCategory,
    description, setDescription,
    color, setColor,
    brand, setBrand,
    season, setSeason,
    shade, setShade,
    statementPiece, setStatementPiece,
    typeValue, setTypeValue,
    sleevelength, setSleevelength,
    heel, setHeel,
    file, setFile,
    reset: () => {
      setCategory('top'); setDescription(''); setColor(''); setBrand('');
      setSeason(null); setShade(null); setStatementPiece(false);
      setTypeValue(''); setSleevelength(null); setHeel(false);
      setFile(null);
    },
  };
}

export default function ItemsPage() {
  const supabase = supabaseBrowser();

  // base items + merged subtype fields for visning
  const [items, setItems] = useState<Item[]>([]);
  const [subtypes, setSubtypes] = useState<Record<string, SubtypeView>>({}); // key = item_id
  const [loading, setLoading] = useState(false);

  const c = useCreateState();

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const editingItem = useMemo(() => items.find((i) => i.id === editId) ?? null, [items, editId]);
  const [eCategory, setECategory] = useState<Item['category']>('top');
  const [eDescription, setEDescription] = useState('');
  const [eColor, setEColor] = useState('');
  const [eBrand, setEBrand] = useState('');
  const [eSeason, setESeason] = useState<string | null>(null);
  const [eShade, setEShade] = useState<string | null>(null);
  const [eStatement, setEStatement] = useState(false);
  const [eType, setEType] = useState(''); // subtype.type
  const [eSleevelength, setESleevelength] = useState<'short'|'long'|null>(null); // top
  const [eHeel, setEHeel] = useState<boolean>(false); // shoes
  const [eFile, setEFile] = useState<File | null>(null);

  // Hent alt: items + subtype-data i batch
  async function loadItems() {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('item')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const base = (rows ?? []) as Item[];
      setItems(base);

      // Batch alle ids pr. kategori
      const idsTop     = base.filter(i => i.category==='top').map(i => i.id);
      const idsBottom  = base.filter(i => i.category==='bottom').map(i => i.id);
      const idsJacket  = base.filter(i => i.category==='jacket').map(i => i.id);
      const idsShoes   = base.filter(i => i.category==='shoes').map(i => i.id);
      const idsJewelry = base.filter(i => i.category==='jewelry').map(i => i.id);

      const [tops, bottoms, jackets, shoes, jewelry] = await Promise.all([
        idsTop.length     ? supabase.from('top').select('item_id,type,sleevelength').in('item_id', idsTop) : { data: [] },
        idsBottom.length  ? supabase.from('bottom').select('item_id,type').in('item_id', idsBottom)       : { data: [] },
        idsJacket.length  ? supabase.from('jacket').select('item_id,type').in('item_id', idsJacket)       : { data: [] },
        idsShoes.length   ? supabase.from('shoe').select('item_id,type,heel').in('item_id', idsShoes)     : { data: [] },
        idsJewelry.length ? supabase.from('jewelry').select('item_id,type').in('item_id', idsJewelry)     : { data: [] },
      ] as any);

      const map: Record<string, SubtypeView> = {};
      (tops.data ?? []).forEach((r: TopRow)       => { map[r.item_id] = { ...(map[r.item_id]||{}), type:r.type, sleevelength:r.sleevelength }; });
      (bottoms.data ?? []).forEach((r: BottomRow) => { map[r.item_id] = { ...(map[r.item_id]||{}), type:r.type }; });
      (jackets.data ?? []).forEach((r: JacketRow) => { map[r.item_id] = { ...(map[r.item_id]||{}), type:r.type }; });
      (shoes.data ?? []).forEach((r: ShoeRow)     => { map[r.item_id] = { ...(map[r.item_id]||{}), type:r.type, heel:r.heel }; });
      (jewelry.data ?? []).forEach((r: JewelryRow)=> { map[r.item_id] = { ...(map[r.item_id]||{}), type:r.type }; });

      setSubtypes(map);
    } catch (e:any) {
      console.error('loadItems error:', e);
      alert('Kunne ikke hente items: ' + (e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  /* ---------------- CREATE ---------------- */
  async function onCreate() {
    setLoading(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Ingen bruger-session. Log ind og prøv igen.');

      // upload image (optional)
      let image_url: string | null = null;
      let storagePath: string | null = null;
      if (c.file) {
        const safeName = c.file.name.replace(/\s+/g, '_');
        const path = `items/${crypto.randomUUID()}_${safeName}`;
        const { data: upData, error: upErr } = await supabase.storage.from('outfit-images').upload(path, c.file);
        if (upErr) throw upErr;
        storagePath = upData?.path ?? path;
        const { data: pub } = supabase.storage.from('outfit-images').getPublicUrl(storagePath);
        image_url = pub.publicUrl;
      }

      // 1) Insert i item
      const { data: newItem, error: insErr } = await supabase
        .from('item')
        .insert({
          category: c.category,
          description: c.description || null,
          color: c.color || null,
          brand: c.brand || null,
          season: c.season ?? null,
          shade: c.shade ?? null,
          statement_piece: c.statementPiece,
          image_url, image_path: storagePath,
          owner_id: user.id,
        })
        .select('id,category')
        .single();
      if (insErr) throw insErr;
      const itemId = newItem!.id as string;

      // 2) Insert i relevant under-tabel
      switch (c.category) {
        case 'top': {
          const { error } = await supabase.from('top').insert({
            item_id: itemId,
            type: c.typeValue || null,
            sleevelength: c.sleevelength ?? null,
          });
          if (error) throw error;
          break;
        }
        case 'bottom': {
          const { error } = await supabase.from('bottom').insert({
            item_id: itemId,
            type: c.typeValue || null,
          });
          if (error) throw error;
          break;
        }
        case 'jacket': {
          const { error } = await supabase.from('jacket').insert({
            item_id: itemId,
            type: c.typeValue || null,
          });
          if (error) throw error;
          break;
        }
        case 'shoes': {
          const { error } = await supabase.from('shoe').insert({
            item_id: itemId,
            type: c.typeValue || null,
            heel: c.heel,
          });
          if (error) throw error;
          break;
        }
        case 'jewelry': {
          const { error } = await supabase.from('jewelry').insert({
            item_id: itemId,
            type: c.typeValue || null,
          });
          if (error) throw error;
          break;
        }
        case 'hairclip': {
          // ingen type-tabel for hairclip
          break;
        }
      }

      c.reset();
      await loadItems();
    } catch (e:any) {
      alert('Error on creation: ' + (e?.message ?? e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- EDIT ---------------- */
  function startEdit(item: Item) {
    setEditId(item.id);
    setECategory(item.category);
    setEDescription(item.description ?? '');
    setEColor(item.color ?? '');
    setEBrand(item.brand ?? '');
    setESeason(item.season ?? null);
    setEShade(item.shade ?? null);
    setEStatement(!!item.statement_piece);

    // preload subtype fra cache
    const s = subtypes[item.id] || {};
    setEType(s.type ?? '');
    setESleevelength((s.sleevelength as ('short'|'long'|null)) ?? null);
    setEHeel(!!s.heel);

    setEFile(null);
  }
  function cancelEdit() {
    setEditId(null);
    setEFile(null);
  }

  async function saveEdit() {
    if (!editId) return;
    setLoading(true);
    try {
      let newImageUrl: string | null | undefined = undefined;
      let newImagePath: string | null | undefined = undefined;

      if (eFile) {
        const { data: one } = await supabase.from('item').select('image_path').eq('id', editId).single();
        if (one?.image_path) await supabase.storage.from('outfit-images').remove([one.image_path]);
        const safeName = eFile.name.replace(/\s+/g, '_');
        const path = `items/${crypto.randomUUID()}_${safeName}`;
        const { data: upData, error: upErr } = await supabase.storage.from('outfit-images').upload(path, eFile);
        if (upErr) throw upErr;
        newImagePath = upData?.path ?? path;
        const { data: pub } = supabase.storage.from('outfit-images').getPublicUrl(newImagePath);
        newImageUrl = pub.publicUrl;
      }

      // 1) Update item
      const updateItem: any = {
        category: eCategory,
        description: eDescription || null,
        color: eColor || null,
        brand: eBrand || null,
        season: eSeason ?? null,
        shade: eShade ?? null,
        statement_piece: eStatement,
      };
      if (newImageUrl !== undefined) updateItem.image_url = newImageUrl;
      if (newImagePath !== undefined) updateItem.image_path = newImagePath;

      const { error: upErr } = await supabase.from('item').update(updateItem).eq('id', editId);
      if (upErr) throw upErr;

      // 2) Update subtype (UPSERT hvis række måske ikke findes)
      switch (eCategory) {
        case 'top': {
          const { error } = await supabase
            .from('top')
            .upsert({ item_id: editId, type: eType || null, sleevelength: eSleevelength ?? null }, { onConflict: 'item_id' });
          if (error) throw error;
          break;
        }
        case 'bottom': {
          const { error } = await supabase
            .from('bottom')
            .upsert({ item_id: editId, type: eType || null }, { onConflict: 'item_id' });
          if (error) throw error;
          break;
        }
        case 'jacket': {
          const { error } = await supabase
            .from('jacket')
            .upsert({ item_id: editId, type: eType || null }, { onConflict: 'item_id' });
          if (error) throw error;
          break;
        }
        case 'shoes': {
          const { error } = await supabase
            .from('shoe')
            .upsert({ item_id: editId, type: eType || null, heel: eHeel }, { onConflict: 'item_id' });
          if (error) throw error;
          break;
        }
        case 'jewelry': {
          const { error } = await supabase
            .from('jewelry')
            .upsert({ item_id: editId, type: eType || null }, { onConflict: 'item_id' });
          if (error) throw error;
          break;
        }
        case 'hairclip': {
          // intet
          break;
        }
      }

      await loadItems();
      cancelEdit();
    } catch (e:any) {
      alert('Error on update: ' + (e?.message ?? e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- DELETE ---------------- */
  async function onDelete(id: string) {
    if (!confirm('Delete item?')) return;
    setLoading(true);
    try {
      const { data: one } = await supabase.from('item').select('image_path').eq('id', id).single();
      const { error: delErr } = await supabase.from('item').delete().eq('id', id);
      if (delErr) throw delErr;
      if (one?.image_path) await supabase.storage.from('outfit-images').remove([one.image_path]);
      await loadItems();
    } catch (e:any) {
      alert('Error at deletion: ' + (e?.message ?? e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Type options: top er fast, resten kan du evt. hente fra tabellerne senere
  const currentTypeOptions =
    c.category === 'top' ? [...TOP_TYPES_FIXED] :
    c.category === 'bottom' ? [...BOTTOM_TYPES_FIXED] :
    c.category === 'jacket' ? [...JACKET_TYPES_FIXED] :
    c.category === 'shoes' ? [...SHOES_TYPES_FIXED] :
    c.category === 'jewelry' ? [...JEWLERY_TYPES_FIXED] : [];

  const editTypeOptions =
    eCategory === 'top' ? [...TOP_TYPES_FIXED] :
    eCategory === 'bottom' ? [...BOTTOM_TYPES_FIXED] :
    eCategory === 'jacket' ? [...JACKET_TYPES_FIXED] :
    eCategory === 'shoes' ? [...SHOES_TYPES_FIXED] :
    eCategory === 'jewelry' ? [...JEWLERY_TYPES_FIXED] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 relative">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-2 py-4 mb-8 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 sticky top-0 z-10 rounded-xl">
        <Link href="/">
          <button className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition">
            ← Back
          </button>
        </Link>
        <Image src="/OutfitPickerLogo.png" alt="Outfit Picker Logo" width={50} height={50} priority />
        <Link href="/generate">
          <button className="rounded-lg px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition">
            Generate outfit
          </button>
        </Link>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Items</h1>

      {/* CREATE */}
      <section className={`${cardClass} mt-6`}>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Category</Label>
            <Select
              value={c.category}
              onValueChange={(v) => {
                c.setCategory(v as Item['category']);
                c.setTypeValue('');
                c.setSleevelength(null);
                c.setHeel(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cg) => (
                  <SelectItem key={cg} value={cg}>{cg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <Label className="text-sm">Description</Label>
            <input className={inputClass} placeholder="e.g. Blue blouse"
                   value={c.description} onChange={(e) => c.setDescription(e.target.value)} />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Color</Label>
            <input className={inputClass} placeholder="e.g. blue"
                   value={c.color} onChange={(e) => c.setColor(e.target.value)} />
          </div>

          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Brand</Label>
            <input className={inputClass} placeholder="e.g. Nike, Zara"
                   value={c.brand} onChange={(e) => c.setBrand(e.target.value)} />
          </div>

          {/* Type (ikke for hairclip) */}
          {c.category !== 'hairclip' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Type</Label>
              <Select value={c.typeValue || 'none'} onValueChange={(v) => c.setTypeValue(v === 'none' ? '' : v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {currentTypeOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Season */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Season</Label>
            <Select value={c.season ?? 'none'} onValueChange={(v) => c.setSeason(v === 'none' ? null : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— select —</SelectItem>
                {SEASONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Shade */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Shade</Label>
            <Select value={c.shade ?? 'none'} onValueChange={(v) => c.setShade(v === 'none' ? null : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— select —</SelectItem>
                {SHADES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Statement piece */}
          <div className="flex items-center gap-2">
            <input id="statement-piece" type="checkbox"
                   checked={c.statementPiece}
                   onChange={(e) => c.setStatementPiece(e.target.checked)} />
            <Label htmlFor="statement-piece" className="text-sm">Statement piece</Label>
          </div>

          {/* Sleevelength (kun top) */}
          {c.category === 'top' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Sleeve length</Label>
              <Select value={c.sleevelength ?? 'none'}
                      onValueChange={(v) => c.setSleevelength(v === 'none' ? null : (v as 'short'|'long'))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {SLEEVELENGTHS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Heel (kun shoes) */}
          {c.category === 'shoes' && (
            <div className="flex items-center gap-2">
              <input id="heel" type="checkbox" checked={c.heel}
                     onChange={(e) => c.setHeel(e.target.checked)} />
              <Label htmlFor="heel" className="text-sm">Heel</Label>
            </div>
          )}

          {/* Image + Save */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <Label className="text-sm">Image (optional)</Label>
            <input type="file" accept="image/*" className={inputClass}
                   onChange={(e) => c.setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex items-end">
            <button className={`${buttonPrimary} w-full`} onClick={onCreate} disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </section>

      {/* LIST + EDIT */}
      <section className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-sm text-gray-600 dark:text-white/70">No items yet. Add the first one above.</p>}

        {items.map((i) => {
          const s = subtypes[i.id] || {};
          return (
            <div key={i.id} className={`${cardClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {i.image_url ? (
                    <img src={i.image_url} alt="" className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-white/10" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg grid place-items-center border border-dashed border-gray-300 dark:border-white/20 text-xs text-gray-500 dark:text-white/60">
                      no img
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium capitalize text-gray-900 dark:text-white">{i.category}</span>
                      {i.brand && <span className={pillMuted}>{i.brand}</span>}
                      {i.color && <span className={pillMuted}>{i.color}</span>}
                      {s.type && <span className={pillMuted}>{s.type}</span>}
                      {i.season && <span className={pillMuted}>{i.season}</span>}
                      {i.shade && <span className={pillMuted}>{i.shade}</span>}
                      {i.statement_piece ? <span className={pillMuted}>statement</span> : null}
                      {i.category === 'top' && s.sleevelength && <span className={pillMuted}>{s.sleevelength}</span>}
                      {i.category === 'shoes' && (s.heel !== undefined) && <span className={pillMuted}>{s.heel ? 'heel' : 'flat'}</span>}
                    </div>
                    {i.description && <span className="text-sm text-gray-700 dark:text-white/75">{i.description}</span>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15"
                          onClick={() => startEdit(i)} disabled={loading}>Edit</button>
                  <button className="text-red-600 dark:text-red-400 hover:underline"
                          onClick={() => onDelete(i.id)} disabled={loading}>Delete</button>
                </div>
              </div>

              {/* EDIT FORM */}
              {editId === i.id && (
                <div className="mt-5 grid gap-4 md:grid-cols-3 border-t pt-5 border-gray-200 dark:border-white/10">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Category</Label>
                    <Select
                      value={eCategory}
                      onValueChange={(v) => {
                        const val = v as Item['category'];
                        setECategory(val);
                        setEType('');
                        setESleevelength(null);
                        setEHeel(false);
                      }}
                    >
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cg) => <SelectItem key={cg} value={cg}>{cg}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <Label className="text-sm">Description</Label>
                    <input className={inputClass} value={eDescription} onChange={(e) => setEDescription(e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Color</Label>
                    <input className={inputClass} value={eColor} onChange={(e) => setEColor(e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Brand</Label>
                    <input className={inputClass} value={eBrand} onChange={(e) => setEBrand(e.target.value)} />
                  </div>

                  {/* Type (edit) */}
                  {eCategory !== 'hairclip' && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm">Type</Label>
                      <Select value={eType || 'none'} onValueChange={(v) => setEType(v === 'none' ? '' : v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— select —</SelectItem>
                          {(eCategory==='top' ? [...TOP_TYPES_FIXED] : []).map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Season */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Season</Label>
                    <Select value={eSeason ?? 'none'} onValueChange={(v) => setESeason(v === 'none' ? null : v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— select —</SelectItem>
                        {SEASONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Shade */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Shade</Label>
                    <Select value={eShade ?? 'none'} onValueChange={(v) => setEShade(v === 'none' ? null : v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— select —</SelectItem>
                        {SHADES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Statement */}
                  <div className="flex items-center gap-2">
                    <input id="edit-statement" type="checkbox" checked={eStatement}
                           onChange={(e) => setEStatement(e.target.checked)} />
                    <Label htmlFor="edit-statement" className="text-sm">Statement piece</Label>
                  </div>

                  {/* Sleevelength (top) */}
                  {eCategory === 'top' && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm">Sleeve length</Label>
                      <Select value={eSleevelength ?? 'none'} onValueChange={(v) => setESleevelength(v === 'none' ? null : (v as 'short'|'long'))}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="— select —" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— select —</SelectItem>
                          {SLEEVELENGTHS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Heel (shoes) */}
                  {eCategory === 'shoes' && (
                    <div className="flex items-center gap-2">
                      <input id="edit-heel" type="checkbox" checked={eHeel}
                             onChange={(e) => setEHeel(e.target.checked)} />
                      <Label htmlFor="edit-heel" className="text-sm">Heel</Label>
                    </div>
                  )}

                  {/* New Image */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <Label className="text-sm">New image (optional)</Label>
                    <input type="file" accept="image/*" className={inputClass}
                           onChange={(e) => setEFile(e.target.files?.[0] ?? null)} />
                  </div>

                  <div className="flex items-end gap-3">
                    <button className={`${buttonPrimary}`} onClick={saveEdit} disabled={loading}>Save changes</button>
                    <button className="rounded-lg px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15"
                            onClick={cancelEdit} disabled={loading}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
