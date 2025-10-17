// app/(protected)/outfits/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Category } from "@/Models/item";
import { SEASONS, CATEGORIES } from "@/Models/item";
import { OUTFIT_TYPES } from "@/Models/outfit";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cardClass, inputClass, pillMuted, buttonPrimary, buttonSub } from "@/lib/ui"; // Generic UI class helpers

type ItemBase = {
  id: string;
  category: Category;
  description: string | null;
  image_url: string | null;
  statement_piece: boolean | null;
};

type Outfit = {
  id: string;
  description: string | null;
  type: string | null;
  season: string | null;
  created_at: string;
};

type OutfitItemView = {
  role: string;
  item_id: string;
  item: {
    description: string | null;
    image_url: string | null;
    category: ItemBase["category"];
  };
};

export default function OutfitsPage() {
  const supabase = supabaseBrowser();

  const [items, setItems] = useState<ItemBase[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [itemsByOutfit, setItemsByOutfit] = useState<
    Record<string, OutfitItemView[]>
  >({});
  const [loading, setLoading] = useState(false);

  type NewMode = "dress" | "separates";
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<string>("casual");
  const [newSeason, setNewSeason] = useState<string>("all-season");
  const [mode, setMode] = useState<NewMode>("separates");

  const [choTop, setChoTop] = useState<string>("");
  const [choDress, setChoDress] = useState<string>("");
  const [choBottom, setChoBottom] = useState<string>("");
  const [choShoes, setChoShoes] = useState<string>("");
  const [choJewelry, setChoJewelry] = useState<string>("");
  const [choHairclip, setChoHairclip] = useState<string>("");
  const [choJacket, setChoJacket] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);
  const editing = useMemo(
    () => outfits.find((o) => o.id === editId) ?? null,
    [outfits, editId]
  );

  const [eDesc, setEDesc] = useState("");
  const [eType, setEType] = useState<string>("casual");
  const [eSeason, setESeason] = useState<string>("all-season");

  const [addCat, setAddCat] = useState<ItemBase["category"]>("top");
  const pool = useMemo(
    () => items.filter((i) => i.category === addCat),
    [items, addCat]
  );
  const [addItem, setAddItem] = useState<string>("");
  const [addRole, setAddRole] = useState<string>(addCat);

  async function loadAll() {
    setLoading(true);
    try {
      const { data: outfits } = await supabase
        .from("outfit")
        .select("id, description, type, season, created_at")
        .order("created_at", { ascending: false });
      setOutfits(outfits ?? []);

      const { data: items } = await supabase
        .from("item")
        .select(
          "id, category, description, image_url, statement_piece"
        )
        .order("created_at", { ascending: false });
      setItems((items ?? []) as ItemBase[]);

      const outMap: Record<string, OutfitItemView[]> = {};
      for (const outfit of outfits ?? []) {
        const { data: rows, error: relErr } = await supabase
          .from("outfititem")
          // use the foreign table name (item), not the local FK column (item_id)
          // this returns a single nested object at r.item
          .select("role, item_id, item:item(description, image_url, category)")
          .eq("outfit_id", outfit.id);

        if (relErr) console.error(relErr);

        const normalized: OutfitItemView[] = (rows ?? []).map((r: any) => ({
          role: r.role,
          item_id: r.item_id,
          item: r.item ?? {
            description: null,
            image_url: null,
            category: "top",
          },
        }));

        outMap[outfit.id] = normalized;
      }
      setItemsByOutfit(outMap);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // CREATE OUTFIT (inkl. valgte items for dress/separates)
  async function createOutfit() {
    try {
      setLoading(true);

      // Hvis din RLS kræver owner_id, kan du hente user og sende owner_id med:
      // const { data: { user } } = await supabase.auth.getUser();

      const { data: o, error: oErr } = await supabase
        .from("outfit")
        .insert({
          description: newDesc || "Custom outfit",
          type: newType || "casual",
          season: newSeason || "all-season",
          // owner_id: user?.id, // slå til hvis din RLS kræver det
        })
        .select()
        .single();

      if (oErr) throw oErr;
      if (!o) throw new Error("Outfit blev ikke oprettet");

      // Forbered outfititems afhængigt af mode
      const toInsert: {
        outfit_id: string;
        item_id: string;
        role: string;
        position: number;
      }[] = [];

      if (mode === "dress") {
        if (!choDress) throw new Error("Vælg en kjole (dress)");
        toInsert.push({
          outfit_id: o.id,
          item_id: choDress,
          role: "dress",
          position: 1,
        });
        if (choShoes)
          toInsert.push({
            outfit_id: o.id,
            item_id: choShoes,
            role: "shoes",
            position: 2,
          });
        if (choJewelry)
          toInsert.push({
            outfit_id: o.id,
            item_id: choJewelry,
            role: "jewelry",
            position: 3,
          });
        if (choHairclip)
          toInsert.push({
            outfit_id: o.id,
            item_id: choHairclip,
            role: "hairclip",
            position: 4,
          });
        if (choJacket)
          toInsert.push({
            outfit_id: o.id,
            item_id: choJacket,
            role: "jacket",
            position: 5,
          });
      } else {
        // separates
        if (!choTop || !choBottom || !choShoes)
          throw new Error("Vælg top, bottom og shoes");
        toInsert.push({
          outfit_id: o.id,
          item_id: choTop,
          role: "top",
          position: 1,
        });
        toInsert.push({
          outfit_id: o.id,
          item_id: choBottom,
          role: "bottom",
          position: 2,
        });
        toInsert.push({
          outfit_id: o.id,
          item_id: choShoes,
          role: "shoes",
          position: 3,
        });
        if (choJewelry)
          toInsert.push({
            outfit_id: o.id,
            item_id: choJewelry,
            role: "jewelry",
            position: 4,
          });
        if (choHairclip)
          toInsert.push({
            outfit_id: o.id,
            item_id: choHairclip,
            role: "hairclip",
            position: 5,
          });
        if (choJacket)
          toInsert.push({
            outfit_id: o.id,
            item_id: choJacket,
            role: "jacket",
            position: 6,
          });
      }

      if (toInsert.length) {
        const { error: oiErr } = await supabase
          .from("outfititem")
          .insert(toInsert);
        if (oiErr) throw oiErr;
      }

      // Nulstil inputs
      setNewDesc("");
      setNewType("casual");
      setNewSeason("all-season");
      setChoTop("");
      setChoDress("");
      setChoBottom("");
      setChoShoes("");
      setChoJewelry("");
      setChoHairclip("");
      setChoJacket("");

      await loadAll();
    } catch (e: any) {
      console.error(e);
      alert("Kunne ikke oprette outfit: " + (e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(o: Outfit) {
    setEditId(o.id);
    setEDesc(o.description ?? "");
    setEType(o.type ?? "casual");
    setESeason(o.season ?? "all-season");
    setAddCat("top");
    setAddItem("");
    setAddRole("top");
  }

  function cancelEdit() {
    setEditId(null);
  }

  async function saveEdit() {
    if (!editId) return;
    await supabase
      .from("outfit")
      .update({ description: eDesc, type: eType, season: eSeason })
      .eq("id", editId);
    await loadAll();
    cancelEdit();
  }

  async function onDeleteOutfit(outfitId: string) {
    if (!confirm("Slet outfit?")) return;
    await supabase.from("outfit").delete().eq("id", outfitId);
    if (outfitId === editId) cancelEdit();
    await loadAll();
  }

  // Add/Replace item i EDIT-accordion:
  // - jewelry & jacket: altid tilføj (flere af samme rolle tilladt)
  // - top: erstat KUN hvis der findes en top med samme subtype (top.type)
  // - øvrige (bottom, shoes, hairclip, …): erstat eksisterende i samme rolle
  async function onAddItem(outfitId: string) {
    if (!addItem) return;

    const role = (addRole || addCat) as string;

    try {
      setLoading(true);

      // 1) Jewelry & Jacket -> altid bare tilføj (stacker)
      if (role === "jewelry" || role === "jacket") {
        const { error: insErr } = await supabase
          .from("outfititem")
          .insert({ outfit_id: outfitId, item_id: addItem, role, position: 1 });
        if (insErr) throw insErr;

        setAddItem("");
        await loadAll();
        return;
      }

      // 2) Top -> erstat kun hvis samme subtype
      if (role === "top") {
        const newType = await getTopType(addItem); // slår op i top via item_id
        // Find eksisterende tops i outfittet
        const { data: existingTopRows, error: exErr } = await supabase
          .from("outfititem")
          .select("item_id")
          .eq("outfit_id", outfitId)
          .eq("role", "top");
        if (exErr) throw exErr;

        if (existingTopRows?.length && newType) {
          const existingTopIds = existingTopRows.map(
            (r) => r.item_id as string
          );

          // Hent subtype for de eksisterende tops via item_id
          const { data: existingTopsMeta, error: topsErr } = await supabase
            .from("top")
            .select("item_id, type")
            .in("item_id", existingTopIds);
          if (topsErr) throw topsErr;

          const sameType = existingTopsMeta?.find((t) => t.type === newType);
          if (sameType) {
            // Erstat den der matcher subtype (brug item_id)
            const { error: delErr } = await supabase
              .from("outfititem")
              .delete()
              .eq("outfit_id", outfitId)
              .eq("role", "top")
              .eq("item_id", sameType.item_id);
            if (delErr) throw delErr;
          }
          // Hvis ingen sameType, tilføjer vi en ekstra top (ingen sletning)
        }

        const { error: insErr } = await supabase
          .from("outfititem")
          .insert({
            outfit_id: outfitId,
            item_id: addItem,
            role: "top",
            position: 1,
          });
        if (insErr) throw insErr;

        setAddItem("");
        await loadAll();
        return;
      }

      // 3) Øvrige kategorier (bottom, shoes, hairclip, ...)
      // -> erstat eksisterende i samme rolle
      const { error: delErr } = await supabase
        .from("outfititem")
        .delete()
        .eq("outfit_id", outfitId)
        .eq("role", role);
      if (delErr) throw delErr;

      const { error: insErr } = await supabase
        .from("outfititem")
        .insert({ outfit_id: outfitId, item_id: addItem, role, position: 1 });
      if (insErr) throw insErr;

      setAddItem("");
      await loadAll();
    } catch (e: any) {
      console.error(e);
      alert("Kunne ikke tilføje/erstatte item: " + (e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function onRemoveItem(outfitId: string, itemId: string, role: string) {
    await supabase
      .from("outfititem")
      .delete()
      .eq("outfit_id", outfitId)
      .eq("item_id", itemId)
      .eq("role", role);
    await loadAll();
  }

  async function getTopType(itemId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("top")
      .select("type")
      .eq("item_id", itemId)
      .maybeSingle(); // tåler 0 rækker

    if (error) return null;
    return data?.type ?? null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 relative">
      {/* Navbar: back button, centered logo, and link to generator */}
      <nav className="flex items-center justify-between px-2 py-4 mb-8 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 sticky top-0 z-10 rounded-xl">
        <Link href="/generate">
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
        Outfits
      </h1>

      {/* CREATE PANEL */}
      <section className={`${cardClass} mt-6`}>
        <h2 className="font-semibold mb-3">Opret outfit</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Beskrivelse</Label>
            <input
              className={inputClass}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Fx Fredag aften"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— select —" />
              </SelectTrigger>
              <SelectContent>
                {OUTFIT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Season</Label>
            <Select value={newSeason} onValueChange={(v) => setNewSeason(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— select —" />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            className={`${buttonSub} ${
              mode === "separates" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setMode("separates")}
          >
            Top + Bottom
          </button>
          <button
            className={`${buttonSub} ${
              mode === "dress" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setMode("dress")}
          >
            Dress
          </button>
        </div>
        {mode === "dress" ? (
          <div className="mt-4 grid md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Kjole</Label>
              <Select
                value={choDress || "none"}
                onValueChange={(v) => setChoDress(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "top")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Shoes</Label>
              <Select
                value={choShoes || "none"}
                onValueChange={(v) => setChoShoes(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "shoes")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Jewelry</Label>
              <Select
                value={choJewelry || "none"}
                onValueChange={(v) => setChoJewelry(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "jewelry")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={choHairclip || "none"}
                onValueChange={(v) => setChoHairclip(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Hairclip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {items
                    .filter((i) => i.category === "hairclip")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                value={choJacket || "none"}
                onValueChange={(v) => setChoJacket(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Jacket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {items
                    .filter((i) => i.category === "jacket")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Top</Label>
              <Select
                value={choTop || "none"}
                onValueChange={(v) => setChoTop(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "top")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Bottom</Label>
              <Select
                value={choBottom || "none"}
                onValueChange={(v) => setChoBottom(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "bottom")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Shoes</Label>
              <Select
                value={choShoes || "none"}
                onValueChange={(v) => setChoShoes(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "shoes")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* NEW: Jewelry */}
            <div className="flex flex-col gap-1.5">
              <Label>Jewelry</Label>
              <Select
                value={choJewelry || "none"}
                onValueChange={(v) => setChoJewelry(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "jewelry")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* NEW: Hairclip */}
            <div className="flex flex-col gap-1.5">
              <Label>Hairclip</Label>
              <Select
                value={choHairclip || "none"}
                onValueChange={(v) => setChoHairclip(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "hairclip")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* NEW: Jacket */}
            <div className="flex flex-col gap-1.5">
              <Label>Jacket</Label>
              <Select
                value={choJacket || "none"}
                onValueChange={(v) => setChoJacket(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— select —</SelectItem>
                  {items
                    .filter((i) => i.category === "jacket")
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.description ?? i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            className={buttonPrimary}
            onClick={createOutfit}
            disabled={loading}
          >
            Opret outfit
          </button>
        </div>
      </section>

      {/* LIST PANEL */}
      <section className="mt-8">
        <h2 className="font-semibold mb-3">Dine outfits</h2>
        <div className="space-y-4">
          {outfits.map((o) => (
            <div key={o.id} className={`${cardClass}`}>
              {/* Row */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-medium truncate"
                      title={o.description || o.type || "Outfit"}
                    >
                      {o.description || o.type || "Outfit"}
                    </span>
                    <span className={pillMuted}>
                      {new Date(o.created_at).toLocaleString(undefined, {
                        dateStyle: "short",
                        // timeStyle: "short", // hours:minutes
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-white/70 capitalize">
                    {o.type || "casual"} • {o.season || "all-season"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={buttonSub}
                    onClick={() =>
                      editId === o.id ? cancelEdit() : startEdit(o)
                    }
                  >
                    {editId === o.id ? "Close" : "Edit"}
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => onDeleteOutfit(o.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Inline EDIT (accordion-style) */}
              {editId === o.id && (
                <div className="mt-4 border-t pt-4">
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Beskrivelse</Label>
                      <input
                        className={inputClass}
                        value={eDesc}
                        onChange={(e) => setEDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Type</Label>
                      <Select value={eType} onValueChange={(v) => setEType(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OUTFIT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Season</Label>
                      <Select
                        value={eSeason}
                        onValueChange={(v) => setESeason(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEASONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button className={buttonPrimary} onClick={saveEdit}>
                      Gem ændringer
                    </button>
                    <button className={buttonSub} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>

                  {/* Add item */}
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Kategori</Label>
                      <Select
                        value={addCat}
                        onValueChange={(v) => {
                          const cv = v as ItemBase["category"];
                          setAddCat(cv);
                          setAddRole(cv);
                          setAddItem("");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
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
                    <div className="flex flex-col gap-1.5">
                      <Label>Item</Label>
                      <Select
                        value={addItem || "none"}
                        onValueChange={(v) => setAddItem(v === "none" ? "" : v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="— select —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— select —</SelectItem>
                          {pool.map((i) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.description ?? i.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        className={buttonSub}
                        onClick={() => onAddItem(o.id)}
                        disabled={!addItem}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Items in outfit */}
                  <ul className="mt-4 space-y-2">
                    {(itemsByOutfit[o.id] ?? []).map((it) => (
                      <li
                        key={`${it.item_id}_${it.role}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {it.item.image_url ? (
                            <img
                              src={it.item.image_url}
                              alt=""
                              className="h-10 w-10 rounded object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded grid place-items-center border border-dashed text-xs text-gray-500">
                              no img
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span>
                              <b>{it.role}</b> — {it.item.description}
                            </span>
                            <span className="text-xs text-gray-500">
                              {it.item.category}
                            </span>
                          </div>
                        </div>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() =>
                            onRemoveItem(o.id, it.item_id, it.role)
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
