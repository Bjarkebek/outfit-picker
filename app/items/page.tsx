"use client";

/**
 * Items page
 * - Create, list, edit and delete wardrobe items
 * - Uploads optional images to Supabase Storage
 * - Stores base item data in table "item" and subtype details in tables:
 *   top, bottom, jacket, shoe, jewelry
 */

// imports
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

import { cardClass, pillMuted, inputClass, buttonPrimary } from "@/lib/ui"; // Generic UI class helpers

// Item imports
import type { Item } from "@/Models/item";
import { CATEGORIES, SEASONS, SHADES } from "@/Models/item";

// Subtype imports
import type {
  Top,
  Bottom,
  Jacket,
  Shoe,
  Jewelry,
  SleeveLength,
} from "@/Models/subtypes";
import {
  TOP_TYPES,
  BOTTOM_TYPES,
  JACKET_TYPES,
  SHOE_TYPES,
  JEWELRY_TYPES,
  SLEEVELENGTHS,
  JEWELRY_BUNDLES,
} from "@/Models/subtypes";

// Unified shape used to merge subtype data onto items for display/edit
type SubtypeView = {
  type?: string | null;
  sleevelength?: string | null;
  heel?: boolean | null;
  bundle_id?: string | null;
  season?: string | null;
  shade?: string | null;
};

// ---------- Create form state ----------
// Isolates all "create new item" form fields + a reset helper.
function useCreateState() {
  const [category, setCategory] = useState<Item["category"]>("top");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [season, setSeason] = useState<string | null>(null);
  const [shade, setShade] = useState<string | null>(null);
  const [statementPiece, setStatementPiece] = useState(false);

  // subtype inputs
  const [typeValue, setTypeValue] = useState(""); // top/bottom/jacket/shoes/jewelry
  const [sleevelength, setSleevelength] = useState<SleeveLength | null>(null); // top
  const [heel, setHeel] = useState<boolean>(false); // shoes

  const [file, setFile] = useState<File | null>(null);

  const [bundleValue, setBundleValue] = useState<string | null>(null);

  return {
    category,
    setCategory,
    description,
    setDescription,
    color,
    setColor,
    brand,
    setBrand,
    season,
    setSeason,
    shade,
    setShade,
    statementPiece,
    setStatementPiece,
    typeValue,
    setTypeValue,
    bundleValue,
    setBundleValue,
    sleevelength,
    setSleevelength,
    heel,
    setHeel,
    file,
    setFile,
    // Reset all create form fields back to defaults
    reset: () => {
      setCategory("top");
      setDescription("");
      setColor("");
      setBrand("");
      setSeason(null);
      setShade(null);
      setStatementPiece(false);
      setTypeValue("");
      setSleevelength(null);
      setHeel(false);
      setFile(null);
      setBundleValue(null);
    },
  };
}

export default function ItemsPage() {
  const supabase = supabaseBrowser();

  // Base items + merged subtype fields for display
  const [items, setItems] = useState<Item[]>([]);
  const [subtypes, setSubtypes] = useState<Record<string, SubtypeView>>({});
  const [loading, setLoading] = useState(false);

  // Create form state hook
  const c = useCreateState();

  // Edit state (track item being edited + edit form fields)
  const [editId, setEditId] = useState<string | null>(null);

  // Active item object for the current edit (derived)
  const editingItem = useMemo(
    () => items.find((i) => i.id === editId) ?? null,
    [items, editId]
  );

  // Individual edit controls for the selected item
  const [eCategory, setECategory] = useState<Item["category"]>("top");
  const [eDescription, setEDescription] = useState("");
  const [eColor, setEColor] = useState("");
  const [eBrand, setEBrand] = useState("");
  const [eSeason, setESeason] = useState<string | null>(null);
  const [eShade, setEShade] = useState<string | null>(null);
  const [eStatement, setEStatement] = useState(false);
  const [eType, setEType] = useState("");
  const [eSleevelength, setESleevelength] = useState<SleeveLength | null>(null);
  const [eHeel, setEHeel] = useState<boolean>(false);
  const [eFile, setEFile] = useState<File | null>(null);
  const [eBundle, setEBundle] = useState<string | null>(null);

  /* -------------- LOAD ITEMS -------------- */
  /**
   * Fetches all items from the "item" table, sorted by created_at (desc).
   * Then loads subtype rows for each category and merges them into a lookup map.
   * Populates both items[] and subtypes{} state.
   */
  async function loadItems() {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from("item")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const base = (rows ?? []) as Item[];
      setItems(base);

      // Collect IDs per category to batch-query subtype tables
      const idsTop = base.filter((i) => i.category === "top").map((i) => i.id);
      const idsBottom = base
        .filter((i) => i.category === "bottom")
        .map((i) => i.id);
      const idsJacket = base
        .filter((i) => i.category === "jacket")
        .map((i) => i.id);
      const idsShoes = base
        .filter((i) => i.category === "shoes")
        .map((i) => i.id);
      const idsJewelry = base
        .filter((i) => i.category === "jewelry")
        .map((i) => i.id);
      const idsHairclip = base
        .filter((i) => i.category === "hairclip")
        .map((i) => i.id);

      // Batch-load subtypes for present IDs (skip empty sets)
      const [tops, bottoms, jackets, shoes, jewelry, hairclips] =
        await Promise.all([
          idsTop.length
            ? supabase
                .from("top")
                .select("item_id,type,sleevelength,season,shade")
                .in("item_id", idsTop)
            : { data: [] },
          idsBottom.length
            ? supabase
                .from("bottom")
                .select("item_id,type,season,shade")
                .in("item_id", idsBottom)
            : { data: [] },
          idsJacket.length
            ? supabase
                .from("jacket")
                .select("item_id,type,season,shade")
                .in("item_id", idsJacket)
            : { data: [] },
          idsShoes.length
            ? supabase
                .from("shoe")
                .select("item_id,type,heel,season,shade")
                .in("item_id", idsShoes)
            : { data: [] },
          idsJewelry.length
            ? supabase
                .from("jewelry")
                .select("id,type,bundle_id,item_id")
                .in("id", idsJewelry)
            : { data: [] },
          idsHairclip.length
            ? supabase
                .from("hairclip")
                .select("item_id,shade")
                .in("item_id", idsHairclip)
            : { data: [] },
        ] as any);

      // Build a merged subtype lookup by item_id
      const map: Record<string, SubtypeView> = {};
      (tops.data ?? []).forEach((r: Top) => {
        map[r.item_id] = {
          ...(map[r.item_id] || {}),
          type: r.type,
          sleevelength: r.sleevelength,
          season: (r as any).season ?? null,
          shade: (r as any).shade ?? null,
        };
      });
      (bottoms.data ?? []).forEach((r: Bottom) => {
        map[r.item_id] = {
          ...(map[r.item_id] || {}),
          type: r.type,
          season: (r as any).season ?? null,
          shade: (r as any).shade ?? null,
        };
      });
      (jackets.data ?? []).forEach((r: Jacket) => {
        map[r.item_id] = {
          ...(map[r.item_id] || {}),
          type: r.type,
          season: (r as any).season ?? null,
          shade: (r as any).shade ?? null,
        };
      });
      (shoes.data ?? []).forEach((r: Shoe) => {
        map[r.item_id] = {
          ...(map[r.item_id] || {}),
          type: r.type,
          heel: r.heel,
          season: (r as any).season ?? null,
          shade: (r as any).shade ?? null,
        };
      });
      (jewelry.data ?? []).forEach((r: Jewelry) => {
        map[r.item_id] = { ...(map[r.item_id] || {}), type: r.type };
      });
      (hairclips.data ?? []).forEach((r: any) => {
        map[r.item_id] = { ...(map[r.item_id] || {}), shade: r.shade ?? null };
      });

      setSubtypes(map);
    } catch (e: any) {
      console.error("loadItems error:", e);
      alert("Kunne ikke hente items: " + (e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  // Initial load on mount
  useEffect(() => {
    loadItems();
  }, []);

  /* ---------------- CREATE ---------------- */
  /**
   * Creates a new Item:
   * 1) Optionally uploads an image to Supabase Storage and stores the public URL.
   * 2) Inserts a base row into "item" (owner_id taken from current user).
   * 3) Inserts into the matching subtype table (except hairclip).
   * 4) Resets the form and refreshes the list.
   */
  async function onCreate() {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Ingen bruger-session. Log ind og prøv igen.");

      // upload image (optional)
      let image_url: string | null = null;
      let storagePath: string | null = null;
      if (c.file) {
        const safeName = c.file.name.replace(/\s+/g, "_");
        const path = `items/${crypto.randomUUID()}_${safeName}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from("outfit-images")
          .upload(path, c.file);
        if (upErr) throw upErr;
        storagePath = upData?.path ?? path;
        const { data: pub } = supabase.storage
          .from("outfit-images")
          .getPublicUrl(storagePath);
        image_url = pub.publicUrl;
      }

      // 1) Insert into item
      const { data: newItem, error: insErr } = await supabase
        .from("item")
        .insert({
          category: c.category,
          description: c.description || null,
          color: c.color || null,
          brand: c.brand || null,
          statement_piece: c.statementPiece,
          image_url,
          image_path: storagePath,
          owner_id: user.id,
        })
        .select("id,category")
        .single();
      if (insErr) throw insErr;
      const itemId = newItem!.id as string;

      // 2) Insert into relevant subtype table
      switch (c.category) {
        case "top": {
          const { error } = await supabase.from("top").insert({
            item_id: itemId,
            type: c.typeValue || null,
            sleevelength: c.sleevelength ?? null,
            season: c.season ?? null,
            shade: c.shade ?? null,
          });
          if (error) throw error;
          break;
        }
        case "bottom": {
          const { error } = await supabase.from("bottom").insert({
            item_id: itemId,
            type: c.typeValue || null,
            season: c.season ?? null,
            shade: c.shade ?? null,
          });
          if (error) throw error;
          break;
        }
        case "jacket": {
          const { error } = await supabase.from("jacket").insert({
            item_id: itemId,
            type: c.typeValue || null,
            season: c.season ?? null,
            shade: c.shade ?? null,
          });
          if (error) throw error;
          break;
        }
        case "shoes": {
          const { error } = await supabase.from("shoe").insert({
            item_id: itemId,
            type: c.typeValue || null,
            heel: c.heel,
            season: c.season ?? null,
            shade: c.shade ?? null,
          });
          if (error) throw error;
          break;
        }
        case "jewelry": {
          const { error } = await supabase.from("jewelry").insert({
            type: c.typeValue || null,
            bundle_id: null, //set bundle_id later
            item_id: itemId,
          });
          if (error) throw error;
          break;
        }
        case "hairclip": {
          const { error } = await supabase.from("hairclip").insert({
            item_id: itemId,
            shade: c.shade ?? null,
          });
          if (error) throw error;
          break;
        }
      }

      // Reset form and reload list
      c.reset();
      await loadItems();
    } catch (e: any) {
      alert("Error on creation: " + (e?.message ?? e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- EDIT ---------------- */
  /**  startEdit
   * - Loads the selected item and its cached subtype fields into edit state.
   */
  function startEdit(item: Item) {
    setEditId(item.id);
    setECategory(item.category);
    setEDescription(item.description ?? "");
    setEColor(item.color ?? "");
    setEBrand(item.brand ?? "");
    const s = subtypes[item.id] || {};
    setESeason(s.season ?? null);
    setEShade(s.shade ?? null);
    setEStatement(!!item.statement_piece);

    // preload subtype from cache (remaining fields)
    setEType(s.type ?? "");
    setESleevelength((s.sleevelength as SleeveLength | null) ?? null);
    setEHeel(!!s.heel);

    setEFile(null);
  }

  /**  cancelEdit
   * - Clears edit state and discards any pending image selection.
   */
  function cancelEdit() {
    setEditId(null);
    setEFile(null);
  }

  /**  saveEdit
   * - Optionally replaces the image (removes old storage file if present).
   * - Updates base item fields in "item".
   * - Upserts the subtype record in the appropriate table.
   * - Reloads the list and exits edit mode.
   */
  async function saveEdit() {
    if (!editId) return;
    setLoading(true);
    try {
      let newImageUrl: string | null | undefined = undefined;
      let newImagePath: string | null | undefined = undefined;

      // If a new image was picked, delete old file and upload the new one
      if (eFile) {
        const { data: one } = await supabase
          .from("item")
          .select("image_path")
          .eq("id", editId)
          .single();
        if (one?.image_path)
          await supabase.storage.from("outfit-images").remove([one.image_path]);
        const safeName = eFile.name.replace(/\s+/g, "_");
        const path = `items/${crypto.randomUUID()}_${safeName}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from("outfit-images")
          .upload(path, eFile);
        if (upErr) throw upErr;
        newImagePath = upData?.path ?? path;
        const { data: pub } = supabase.storage
          .from("outfit-images")
          .getPublicUrl(newImagePath);
        newImageUrl = pub.publicUrl;
      }

      // 1) Update the base item row
      const updateItem: any = {
        category: eCategory,
        description: eDescription || null,
        color: eColor || null,
        brand: eBrand || null,
        statement_piece: eStatement,
      };
      if (newImageUrl !== undefined) updateItem.image_url = newImageUrl;
      if (newImagePath !== undefined) updateItem.image_path = newImagePath;

      const { error: upErr } = await supabase
        .from("item")
        .update(updateItem)
        .eq("id", editId);
      if (upErr) throw upErr;

      // 2) Upsert subtype record for the selected category
      switch (eCategory) {
        case "top": {
          const { error } = await supabase.from("top").upsert(
            {
              item_id: editId,
              type: eType || null,
              sleevelength: eSleevelength ?? null,
              season: eSeason ?? null,
              shade: eShade ?? null,
            },
            { onConflict: "item_id" }
          );
          if (error) throw error;
          break;
        }
        case "bottom": {
          const { error } = await supabase
            .from("bottom")
            .upsert(
              {
                item_id: editId,
                type: eType || null,
                season: eSeason ?? null,
                shade: eShade ?? null,
              },
              { onConflict: "item_id" }
            );
          if (error) throw error;
          break;
        }
        case "jacket": {
          const { error } = await supabase
            .from("jacket")
            .upsert(
              {
                item_id: editId,
                type: eType || null,
                season: eSeason ?? null,
                shade: eShade ?? null,
              },
              { onConflict: "item_id" }
            );
          if (error) throw error;
          break;
        }
        case "shoes": {
          const { error } = await supabase
            .from("shoe")
            .upsert(
              {
                item_id: editId,
                type: eType || null,
                heel: eHeel,
                season: eSeason ?? null,
                shade: eShade ?? null,
              },
              { onConflict: "item_id" }
            );
          if (error) throw error;
          break;
        }
        case "jewelry": {
          const { error } = await supabase
            .from("jewelry")
            .upsert(
              {
                item_id: editId,
                type: eType || null,
                bundle_id: eBundle || null,
              },
              { onConflict: "item_id" }
            );
          if (error) throw error;
          break;
        }
        case "hairclip": {
          const { error } = await supabase
            .from("hairclip")
            .upsert(
              { item_id: editId, shade: eShade ?? null },
              { onConflict: "item_id" }
            );
          if (error) throw error;
          break;
        }
      }

      await loadItems();
      cancelEdit();
    } catch (e: any) {
      alert("Error on update: " + (e?.message ?? e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- DELETE ---------------- */
  /**  onDelete
   * - Confirms with the user, removes the item row, deletes the stored image file (if any),
   *   then refreshes the list.
   */
  async function onDelete(id: string) {
    if (!confirm("Delete item?")) return;
    setLoading(true);
    try {
      const { data: one } = await supabase
        .from("item")
        .select("image_path")
        .eq("id", id)
        .single();
      const { error: delErr } = await supabase
        .from("item")
        .delete()
        .eq("id", id);
      if (delErr) throw delErr;
      if (one?.image_path)
        await supabase.storage.from("outfit-images").remove([one.image_path]);
      await loadItems();
    } catch (e: any) {
      alert("Error at deletion: " + (e?.message ?? e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Type options derived for current category (create form)
  const currentTypeOptions =
    c.category === "top"
      ? [...TOP_TYPES]
      : c.category === "bottom"
      ? [...BOTTOM_TYPES]
      : c.category === "jacket"
      ? [...JACKET_TYPES]
      : c.category === "shoes"
      ? [...SHOE_TYPES]
      : c.category === "jewelry"
      ? [...JEWELRY_TYPES]
      : [];

  // Type options derived for edit form based on selected edit category
  const editTypeOptions =
    eCategory === "top"
      ? [...TOP_TYPES]
      : eCategory === "bottom"
      ? [...BOTTOM_TYPES]
      : eCategory === "jacket"
      ? [...JACKET_TYPES]
      : eCategory === "shoes"
      ? [...SHOE_TYPES]
      : eCategory === "jewelry"
      ? [...JEWELRY_TYPES]
      : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 relative">
      {/* NAVBAR: back button, centered logo, and link to generator */}
      <nav className="flex items-center justify-between px-2 py-4 mb-8 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 sticky top-0 z-10 rounded-xl">
        <Link href="/">
          <button className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition">
            ← Back
          </button>
        </Link>
        <Image
          src="/OutfitPickerLogo.png"
          alt="Outfit Picker Logo"
          width={50}
          height={50}
          priority
        />
        <Link href="/generate">
          <button className="rounded-lg px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition">
            Generate outfit
          </button>
        </Link>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Create item
      </h1>

      {/* CREATE FORM: Form for adding a new item and optional image */}
      <section className={`${cardClass} mt-6`}>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Category</Label>
            <Select
              value={c.category}
              onValueChange={(v) => {
                c.setCategory(v as Item["category"]);
                c.setTypeValue("");
                c.setSleevelength(null);
                c.setHeel(false);
              }}
            >
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

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Color</Label>
            <input
              className={inputClass}
              placeholder="e.g. blue"
              value={c.color}
              onChange={(e) => c.setColor(e.target.value)}
            />
          </div>

          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Brand</Label>
            <input
              className={inputClass}
              placeholder="e.g. Nike, Zara"
              value={c.brand}
              onChange={(e) => c.setBrand(e.target.value)}
            />
          </div>

          {/* Type */}
          {c.category !== "hairclip" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Type</Label>
              <Select
                value={c.typeValue || "none"}
                onValueChange={(v) => c.setTypeValue(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {currentTypeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Season */}
          {(c.category === "top" ||
            c.category === "bottom" ||
            c.category === "jacket" ||
            c.category === "shoes") && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Season</Label>
              <Select
                value={c.season ?? "none"}
                onValueChange={(v) => c.setSeason(v === "none" ? null : v)}
              >
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
          )}

          {/* Shade */}
          {(c.category === "top" ||
            c.category === "bottom" ||
            c.category === "jacket" ||
            c.category === "shoes" ||
            c.category === "hairclip") && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Shade</Label>
              <Select
                value={c.shade ?? "none"}
                onValueChange={(v) => c.setShade(v === "none" ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {SHADES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Statement piece flag */}
          <div className="flex items-center gap-2">
            <input
              id="statement-piece"
              type="checkbox"
              checked={c.statementPiece}
              onChange={(e) => c.setStatementPiece(e.target.checked)}
            />
            <Label htmlFor="statement-piece" className="text-sm">
              Statement piece
            </Label>
          </div>

          {/* Sleevelength (top only) */}
          {c.category === "top" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Sleeve length</Label>
              <Select
                value={c.sleevelength ?? "none"}
                onValueChange={(v) =>
                  c.setSleevelength(v === "none" ? null : (v as SleeveLength))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {SLEEVELENGTHS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Heel (shoes only) */}
          {c.category === "shoes" && (
            <div className="flex items-center gap-2">
              <input
                id="heel"
                type="checkbox"
                checked={c.heel}
                onChange={(e) => c.setHeel(e.target.checked)}
              />
              <Label htmlFor="heel" className="text-sm">
                Heel
              </Label>
            </div>
          )}

          {/* Bundle (jewelry only) */}
          {c.category === "jewelry" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Bundle</Label>
              <Select
                value={c.bundleValue ?? "none"}
                onValueChange={(v) => c.setBundleValue(v === "none" ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">not applied</SelectItem>
                  {JEWELRY_BUNDLES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Image picker + Save */}
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
            <button
              className={`${buttonPrimary} w-full`}
              onClick={onCreate}
              disabled={loading}
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </section>

      {/* BUNDLES: To add or manage existing jewlry bundles */}
      <h1 className="text-3xl mt-10 font-semibold tracking-tight text-gray-900 dark:text-white">
        Bundles
      </h1>
      <section className={`${cardClass} mt-6`}>
        
      </section>



      {/* ITEM LIST + EDIT FORM: renders each item card with inline edit form */}
      <h1 className="text-3xl mt-10 font-semibold tracking-tight text-gray-900 dark:text-white">
        All items
      </h1>

      <section className={`${cardClass} mt-6`}>
        {items.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-white/70">
            No items yet. Add the first one above.
          </p>
        )}

        {items.map((item) => {
          const s = subtypes[item.id] || {};
          return (
            <div key={item.id} className=" mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-white/10"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg grid place-items-center border border-dashed border-gray-300 dark:border-white/20 text-xs text-gray-500 dark:text-white/60">
                      no img
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium capitalize text-gray-900 dark:text-white">
                        {item.category}
                      </span>
                      {item.brand && <span className={pillMuted}>{item.brand}</span>}
                      {item.color && <span className={pillMuted}>{item.color}</span>}
                      {s.type && <span className={pillMuted}>{s.type}</span>}
                      {s.season && (
                        <span className={pillMuted}>{s.season}</span>
                      )}
                      {s.shade && <span className={pillMuted}>{s.shade}</span>}
                      {item.statement_piece ? (
                        <span className={pillMuted}>statement</span>
                      ) : null}
                      {item.category === "top" && s.sleevelength && (
                        <span className={pillMuted}>{s.sleevelength}</span>
                      )}
                      {item.category === "jewelry" && s.bundle_id && (
                        <span className={pillMuted}>bundle: {s.bundle_id}</span>
                      )}
                      {item.category === "shoes" && s.heel !== undefined && (
                        <span className={pillMuted}>
                          {s.heel ? "heel" : "flat"}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-sm text-gray-700 dark:text-white/75">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  {item.category === "jewelry" && (
                    <button
                    className="rounded-lg px-3 py-2 text-sm bg-blue-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15"
                    disabled={loading}
                  >
                    Bundle
                  </button>
                  )}
                  <button
                    className="rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15"
                    onClick={() => startEdit(item)}
                    disabled={loading}
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-600 dark:text-red-400 hover:underline"
                    onClick={() => onDelete(item.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* EDIT FORM for the selected item */}
              {editId === item.id && (
                <div className="mt-5 grid gap-4 md:grid-cols-3 border-t pt-5 border-gray-200 dark:border-white/10">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Category</Label>
                    <Select
                      value={eCategory}
                      onValueChange={(v) => {
                        const val = v as Item["category"];
                        setECategory(val);
                        setEType("");
                        setESleevelength(null);
                        setEHeel(false);
                      }}
                    >
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
                    <input
                      className={inputClass}
                      value={eDescription}
                      onChange={(e) => setEDescription(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Color</Label>
                    <input
                      className={inputClass}
                      value={eColor}
                      onChange={(e) => setEColor(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Brand</Label>
                    <input
                      className={inputClass}
                      value={eBrand}
                      onChange={(e) => setEBrand(e.target.value)}
                    />
                  </div>

                  {/* Type (edit) */}
                  {eCategory !== "hairclip" && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm">Type</Label>
                      <Select
                        value={eType || "none"}
                        onValueChange={(v) => setEType(v === "none" ? "" : v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="— select —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— select —</SelectItem>
                          {editTypeOptions.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Season */}
                  {(eCategory === "top" ||
                    eCategory === "bottom" ||
                    eCategory === "jacket" ||
                    eCategory === "shoes") && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm">Season</Label>
                      <Select
                        value={eSeason ?? "none"}
                        onValueChange={(v) =>
                          setESeason(v === "none" ? null : v)
                        }
                      >
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
                  )}

                  {/* Shade */}
                  {(eCategory === "top" ||
                    eCategory === "bottom" ||
                    eCategory === "jacket" ||
                    eCategory === "shoes" ||
                    eCategory === "hairclip") && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm">Shade</Label>
                      <Select
                        value={eShade ?? "none"}
                        onValueChange={(v) =>
                          setEShade(v === "none" ? null : v)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="— select —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— select —</SelectItem>
                          {SHADES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Statement */}
                  <div className="flex items-center gap-2">
                    <input
                      id="edit-statement"
                      type="checkbox"
                      checked={eStatement}
                      onChange={(e) => setEStatement(e.target.checked)}
                    />
                    <Label htmlFor="edit-statement" className="text-sm">
                      Statement piece
                    </Label>
                  </div>

                  {/* Sleevelength (top) */}
                  {eCategory === "top" && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm">Sleeve length</Label>
                      <Select
                        value={eSleevelength ?? "none"}
                        onValueChange={(v) =>
                          setESleevelength(
                            v === "none" ? null : (v as SleeveLength)
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="— select —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— select —</SelectItem>
                          {SLEEVELENGTHS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Heel (shoes) */}
                  {eCategory === "shoes" && (
                    <div className="flex items-center gap-2">
                      <input
                        id="edit-heel"
                        type="checkbox"
                        checked={eHeel}
                        onChange={(e) => setEHeel(e.target.checked)}
                      />
                      <Label htmlFor="edit-heel" className="text-sm">
                        Heel
                      </Label>
                    </div>
                  )}

                  {/* Bundle (jewelry only) */}
                  {eCategory === "jewelry" && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm">Bundle</Label>
                      <Select
                        value={c.bundleValue ?? "none"}
                        onValueChange={(v) =>
                          c.setBundleValue(v === "none" ? null : v)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="— select —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">not applied</SelectItem>
                          {JEWELRY_BUNDLES.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* New Image */}
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
                    <button
                      className={`${buttonPrimary}`}
                      onClick={saveEdit}
                      disabled={loading}
                    >
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
              <div className="mt-5 border-b-1"/>
            </div>
            
          );
        })}
      </section>
    </div>
  );
}
