// app/items/page.tsx
// This page displays and handles CRUD for items in the wardrobe
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

// Type for an item in the wardrobe
type Item = {
  id: string;
  category: 'top' | 'bottom' | 'jacket' | 'shoes' | 'hairclip' | 'jewelry';
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
  color: string | null;
  brand: string | null;
  type: string | null;
  season: string | null;
};

// Possible categories and seasons
const CATEGORIES: Item['category'][] = ['top', 'bottom', 'jacket', 'shoes', 'hairclip', 'jewelry'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter', 'all-season'] as const;

// UI helpers for styling
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

/* --- Create form state --- */
function useCreateState() {
  const [category, setCategory] = useState<Item['category']>('top');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [typeValue, setTypeValue] = useState('');
  const [season, setSeason] = useState<string | null>(null); // ✅ null, ikke ''
  const [file, setFile] = useState<File | null>(null);
  return {
    category,
    setCategory,
    description,
    setDescription,
    color,
    setColor,
    brand,
    setBrand,
    typeValue,
    setTypeValue,
    season,
    setSeason,
    file,
    setFile,
    reset: () => {
      setCategory('top');
      setDescription('');
      setColor('');
      setBrand('');
      setTypeValue('');
      setSeason(null); // ✅
      setFile(null);
    },
  };
}

export default function ItemsPage() {
  const supabase = supabaseBrowser(); // ✅ brug browser-klienten
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // Create state
  const c = useCreateState();

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const editingItem = useMemo(() => items.find((i) => i.id === editId) ?? null, [items, editId]);
  const [eCategory, setECategory] = useState<Item['category']>('top');
  const [eDescription, setEDescription] = useState('');
  const [eColor, setEColor] = useState('');
  const [eBrand, setEBrand] = useState('');
  const [eType, setEType] = useState('');
  const [eSeason, setESeason] = useState<string | null>(null); // ✅ null, ikke ''
  const [eFile, setEFile] = useState<File | null>(null);

  // Fetch all items
  async function loadItems() {
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('loadItems error:', error);
      alert('Kunne ikke hente items: ' + error.message);
      return;
    }
    setItems((data ?? []) as Item[]);
  }

  useEffect(() => {
    loadItems();
  }, []);

  /* ---------------- CREATE ---------------- */
  async function onCreate() {
    setLoading(true);
    try {
      // Find current user for owner_id (RLS)
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Ingen bruger-session. Log ind og prøv igen.');

      let image_url: string | null = null;
      let storagePath: string | null = null;

      // Upload billede (valgfrit)
      if (c.file) {
        const safeName = c.file.name.replace(/\s+/g, '_');
        const path = `items/${crypto.randomUUID()}_${safeName}`;
        const { data: upData, error: upErr } = await supabase.storage.from('outfit-images').upload(path, c.file);
        if (upErr) throw upErr;
        storagePath = upData?.path ?? path;
        const { data: pub } = supabase.storage.from('outfit-images').getPublicUrl(storagePath);
        image_url = pub.publicUrl;
      }

      // Insert (med owner_id)
      const { error: insErr } = await supabase.from('item').insert({
        category: c.category,
        description: c.description || null,
        color: c.color || null,
        brand: c.brand || null,
        type: c.typeValue || null,
        season: c.season ?? null, // ✅ null hvis ikke valgt
        image_url,
        image_path: storagePath,
        owner_id: user.id, // ✅ vigtigt m. RLS
      });
      if (insErr) throw insErr;

      c.reset();
      await loadItems();
    } catch (e: any) {
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
    setEType(item.type ?? '');
    setESeason(item.season ?? null); // ✅
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
      let newImageUrl: string | null | undefined = undefined; // undefined = keep, null = remove, string = new
      let newImagePath: string | null | undefined = undefined;

      // Upload nyt billede?
      if (eFile) {
        const { data: one } = await supabase.from('item').select('image_path').eq('id', editId).single();
        if (one?.image_path) {
          await supabase.storage.from('outfit-images').remove([one.image_path]);
        }
        const safeName = eFile.name.replace(/\s+/g, '_');
        const path = `items/${crypto.randomUUID()}_${safeName}`;
        const { data: upData, error: upErr } = await supabase.storage.from('outfit-images').upload(path, eFile);
        if (upErr) throw upErr;
        newImagePath = upData?.path ?? path;
        const { data: pub } = supabase.storage.from('outfit-images').getPublicUrl(newImagePath);
        newImageUrl = pub.publicUrl;
      }

      const updatePayload: Record<string, any> = {
        category: eCategory,
        description: eDescription || null,
        color: eColor || null,
        brand: eBrand || null,
        type: eType || null,
        season: eSeason ?? null, // ✅
      };
      if (newImageUrl !== undefined) updatePayload.image_url = newImageUrl;
      if (newImagePath !== undefined) updatePayload.image_path = newImagePath;

      const { error: upErr } = await supabase.from('item').update(updatePayload).eq('id', editId);
      if (upErr) throw upErr;

      await loadItems();
      cancelEdit();
    } catch (e: any) {
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
      if (one?.image_path) {
        await supabase.storage.from('outfit-images').remove([one.image_path]);
      }
      await loadItems();
    } catch (e: any) {
      alert('Error at deletion: ' + (e?.message ?? e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

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
            <Select value={c.category} onValueChange={(v) => c.setCategory(v as Item['category'])}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cg) => (
                  <SelectItem key={cg} value={cg}>
                    {cg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Description */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <Label className="text-sm">Description</Label>
            <input
              className={inputClass}
              placeholder="e.g. Blue blouse"
              value={c.description}
              onChange={(e) => c.setDescription(e.target.value)}
            />
          </div>
          {/* Color / Brand / Type / Season */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Color</Label>
            <input
              className={inputClass}
              placeholder="e.g. blue"
              value={c.color}
              onChange={(e) => c.setColor(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Brand</Label>
            <input
              className={inputClass}
              placeholder="e.g. Nike, Zara"
              value={c.brand}
              onChange={(e) => c.setBrand(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Type</Label>
            <input
              className={inputClass}
              placeholder="e.g. jeans, skirt, sneakers…"
              value={c.typeValue}
              onChange={(e) => c.setTypeValue(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Season</Label>
            <Select value={c.season ?? 'none'} onValueChange={(v) => c.setSeason(v === 'none' ? null : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— select —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— select —</SelectItem>
                {SEASONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Image + Save */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <Label className="text-sm">Image (optional)</Label>
            <input
              type="file"
              accept="image/*"
              className={inputClass}
              onChange={(e) => c.setFile(e.target.files?.[0] ?? null)}
            />
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
        {items.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-white/70">No items yet. Add the first one above.</p>
        )}

        {items.map((i) => (
          <div key={i.id} className={`${cardClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {i.image_url ? (
                  <img
                    src={i.image_url}
                    alt=""
                    className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-white/10"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg grid place-items-center border border-dashed border-gray-300 dark:border-white/20 text-xs text-gray-500 dark:text-white/60">
                    no img
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize text-gray-900 dark:text-white">{i.category}</span>
                    {i.brand && <span className={pillMuted}>{i.brand}</span>}
                    {i.color && <span className={pillMuted}>{i.color}</span>}
                    {i.type && <span className={pillMuted}>{i.type}</span>}
                    {i.season && <span className={pillMuted}>{i.season}</span>}
                  </div>
                  {i.description && <span className="text-sm text-gray-700 dark:text-white/75">{i.description}</span>}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg:white/10 dark:hover:bg-white/15"
                  onClick={() => startEdit(i)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => onDelete(i.id)} disabled={loading}>
                  Delete
                </button>
              </div>
            </div>

            {/* EDIT FORM (inline) */}
            {editId === i.id && (
              <div className="mt-5 grid gap-4 md:grid-cols-3 border-t pt-5 border-gray-200 dark:border-white/10">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm">Category</Label>
                  <Select value={eCategory} onValueChange={(v) => setECategory(v as Item['category'])}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cg) => (
                        <SelectItem key={cg} value={cg}>
                          {cg}
                        </SelectItem>
                      ))}
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
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm">Type</Label>
                  <input className={inputClass} value={eType} onChange={(e) => setEType(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm">Season</Label>
                  <Select value={eSeason ?? 'none'} onValueChange={(v) => setESeason(v === 'none' ? null : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="— select —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— select —</SelectItem>
                      {SEASONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <Label className="text-sm">New image (optional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    className={inputClass}
                    onChange={(e) => setEFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div className="flex items-end gap-3">
                  <button className={`${buttonPrimary}`} onClick={saveEdit} disabled={loading}>
                    Save changes
                  </button>
                  <button
                    className="rounded-lg px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
