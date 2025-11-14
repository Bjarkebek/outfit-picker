// app/generate/page.tsx
// Client-side page: generates a random outfit with constraints and can save it
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser"; // ✅ browser client
import Image from "next/image";
import Link from "next/link";
import type { Item as ItemBase } from "@/Models/item";

export const dynamic = "force-dynamic";


// Extend the base Item with fields this page reads from joins/queries
type Item = ItemBase & {
  type: string | null;
  active: boolean | null;
};

type Chosen = {
  role:
    | "dress"
    | "top"
    | "bottom"
    | "jacket"
    | "shoes"
    | "hairclip"
    | "jewelry";
  id: string;
  desc: string;
  brand?: string;
};

// ------- STYLE HEURISTICS -------
const TOP_CASUAL = new Set([
  "tshirt",
  "tanktop",
  "croptop",
  "hoodie",
  "sweater",
  "cardigan",
]);
const TOP_SMART = new Set(["blouse", "shirt", "vest", "cardigan"]);
const TOP_FORMAL = new Set(["dress"]);

const BOTTOM_CASUAL = new Set(["jeans", "shorts", "leggings"]);
const BOTTOM_SMART = new Set(["pants", "chinos", "skirt"]);

const SHOES_CASUAL = new Set(["sneakers", "sandals", "flats", "slippers"]);
const SHOES_SMART = new Set(["boots", "loafers"]);
const SHOES_FORMAL = new Set(["heels"]);

function styleOf(item: Item): "casual" | "smart" | "formal" {
  const t = (item.type ?? "").toLowerCase();

  if (item.category === "top") {
    if (TOP_FORMAL.has(t)) return "formal";
    if (TOP_SMART.has(t)) return "smart";
    if (TOP_CASUAL.has(t)) return "casual";
    return "casual"; // default for unknown tops
  }
  if (item.category === "bottom") {
    if (BOTTOM_SMART.has(t)) return "smart";
    if (BOTTOM_CASUAL.has(t)) return "casual";
    return "casual"; // default for unknown bottoms
  }
  if (item.category === "shoes") {
    if (SHOES_FORMAL.has(t)) return "formal";
    if (SHOES_SMART.has(t)) return "smart";
    if (SHOES_CASUAL.has(t)) return "casual";
    return "casual"; // default for unknown shoes
  }
  return "casual"; // default fallback
}

function compatible(
  a: "casual" | "smart" | "formal",
  b: "casual" | "smart" | "formal"
) {
  if (a === b) return true;
  if ((a === "smart" && b === "formal") || (a === "formal" && b === "smart"))
    return true;
  return false;
}

// ------- HELPERS -------
function rand<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickIn(
  items: Item[],
  category: Item["category"],
  filter?: (x: Item) => boolean,
  avoidIds: Set<string> = new Set(),
  tries = 8
): Item | null {
  const pool = items.filter(
    (i) =>
      i.category === category && !avoidIds.has(i.id) && (!filter || filter(i))
  );
  if (!pool.length) return null;
  for (let k = 0; k < tries; k++) {
    const candidate = rand(pool);
    if (candidate) return candidate;
  }
  return null;
}

export default function Generate() {
  const supabase = supabaseBrowser(); // use browser client with session
  const [roles, setRoles] = useState<Chosen[]>([]);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Main generation logic
  const generate = async () => {
    setBusy(true);
    setSaved(false);

    // sanity: user must be logged in (so RLS works)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      console.error("auth error", userErr);
      alert("Du er ikke logget ind (session mangler). Log ind og prøv igen.");
      setBusy(false);
      return;
    }

    // fetch items
    const { data, error } = await supabase
      .from("item")
      .select("*")
      .eq("active", true);

    if (error) {
      console.error("load items error", error);
      alert(`Kunne ikke hente items: ${error.message}`);
      setBusy(false);
      return;
    }
    const items = (data ?? []) as Item[];
    if (items.length === 0) {
      alert("Ingen aktive items fundet. Tilføj items og prøv igen.");
      setRoles([]);
      setBusy(false);
      return;
    }

    const avoid = new Set<string>();
    const chosen: Chosen[] = [];

    // DRESS branch (10% chance if present)
    const dresses = items.filter(
      (i) => i.category === "top" && (i.type ?? "").toLowerCase() === "dress"
    );
    const useDress = dresses.length > 0 && Math.random() < 0.1;

    if (useDress) {
      const dress = rand(dresses);
      if (dress) {
        chosen.push({
          role: "dress",
          id: dress.id,
          desc: dress.description ?? "Dress",
          brand: dress.brand ?? "No brand",
        });
        avoid.add(dress.id);

        const dressStyle = styleOf(dress);
        const shoes =
          pickIn(
            items,
            "shoes",
            (x) => compatible(styleOf(x), dressStyle),
            avoid
          ) ?? pickIn(items, "shoes", undefined, avoid);
        if (shoes) {
          chosen.push({
            role: "shoes",
            id: shoes.id,
            desc: shoes.description ?? "Shoes",
            brand: shoes.brand ?? "No brand",
          });
          avoid.add(shoes.id);
        }

        const jewelry =
          pickIn(items, "jewelry", (x) => !x.statement_piece, avoid) ??
          pickIn(items, "jewelry", undefined, avoid);
        if (jewelry) {
          chosen.push({
            role: "jewelry",
            id: jewelry.id,
            desc: jewelry.description ?? "Jewelry",
            brand: jewelry.brand ?? "No brand",
          });
          avoid.add(jewelry.id);
        }

        if (Math.random() < 0.35) {
          const clip = pickIn(items, "hairclip", undefined, avoid);
          if (clip) {
            chosen.push({
              role: "hairclip",
              id: clip.id,
              desc: clip.description ?? "Hairclip",
              brand: clip.brand ?? "No brand",
            });
            avoid.add(clip.id);
          }
        }
      }
    } else {
      // TOP/BOTTOM/SHOES branch
      const top = pickIn(
        items,
        "top",
        (x) => (x.type ?? "").toLowerCase() !== "dress",
        avoid
      );
      if (top) {
        chosen.push({
          role: "top",
          id: top.id,
          desc: top.description ?? "Top",
          brand: top.brand ?? "No brand",
        });
        avoid.add(top.id);
      }

      let bottom: Item | null = null;
      if (top) {
        const topStyle = styleOf(top);
        bottom =
          pickIn(
            items,
            "bottom",
            (b) => {
              return compatible(topStyle, styleOf(b));
            },
            avoid
          ) ?? pickIn(items, "bottom", undefined, avoid);
      } else {
        bottom = pickIn(items, "bottom", undefined, avoid);
      }
      if (bottom) {
        chosen.push({
          role: "bottom",
          id: bottom.id,
          desc: bottom.description ?? "Bottom",
          brand: bottom.brand ?? "No brand",
        });
        avoid.add(bottom.id);
      }

      const anchor = top ?? bottom;
      let shoes: Item | null = null;
      if (anchor) {
        const aStyle = styleOf(anchor);
        shoes =
          pickIn(
            items,
            "shoes",
            (s) => compatible(aStyle, styleOf(s)),
            avoid
          ) ?? pickIn(items, "shoes", undefined, avoid);
      } else {
        shoes = pickIn(items, "shoes", undefined, avoid);
      }
      if (shoes) {
        chosen.push({
          role: "shoes",
          id: shoes.id,
          desc: shoes.description ?? "Shoes",
          brand: shoes.brand ?? "No brand",
        });
        avoid.add(shoes.id);
      }

      const jewelry = pickIn(items, "jewelry", undefined, avoid);
      if (jewelry) {
        chosen.push({
          role: "jewelry",
          id: jewelry.id,
          desc: jewelry.description ?? "Jewelry",
          brand: jewelry.brand ?? "No brand",
        });
        avoid.add(jewelry.id);
      }

      if (Math.random() < 0.25) {
        const clip = pickIn(items, "hairclip", undefined, avoid);
        if (clip) {
          chosen.push({
            role: "hairclip",
            id: clip.id,
            desc: clip.description ?? "Hairclip",
            brand: clip.brand ?? "No brand",
          });
          avoid.add(clip.id);
        }
      }
    }

    // Enforce max 1 statement piece
    const chosenIds = new Set(chosen.map((c) => c.id));
    const withItems: (Chosen & { item?: Item })[] = chosen.map((c) => ({
      ...c,
      item: items.find((i) => i.id === c.id) || undefined,
    }));
    const countStatements = () =>
      withItems.reduce((acc, c) => acc + (c.item?.statement_piece ? 1 : 0), 0);

    if (countStatements() > 1) {
      for (const targetRole of ["jewelry", "hairclip"] as const) {
        if (countStatements() <= 1) break;
        const idx = withItems.findIndex(
          (c) => c.role === targetRole && c.item?.statement_piece
        );
        if (idx >= 0) {
          const replacement =
            pickIn(
              items,
              targetRole,
              (x) => !x.statement_piece && !chosenIds.has(x.id),
              new Set(),
              6
            ) ?? null;
          if (replacement) {
            chosenIds.delete(withItems[idx].id);
            withItems[idx] = {
              role: targetRole,
              id: replacement.id,
              desc: replacement.description ?? targetRole,
              item: replacement,
            };
            chosenIds.add(replacement.id);
          } else {
            withItems.splice(idx, 1);
          }
        }
      }
      while (countStatements() > 1) {
        const removeIdx = withItems.findLastIndex(
          (c) => c.item?.statement_piece
        );
        if (removeIdx >= 0) withItems.splice(removeIdx, 1);
        else break;
      }
    }

    const finalChosen = withItems.map(({ item, ...rest }) => rest);
    if (finalChosen.length === 0) {
      alert(
        "Kunne ikke sammensætte et outfit ud fra dine items. Tilføj flere items."
      );
    }
    setRoles(finalChosen);
    setBusy(false);
  };

  // Save generated outfit to DB
  const saveOutfit = async () => {
    if (roles.length === 0) return;

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      alert("Ingen aktiv session. Log ind og prøv igen.");
      return;
    }

    const { data: outfit, error: oErr } = await supabase
      .from("outfit")
      .insert({
        description: "Auto-genereret outfit",
        type: "casual",
        season: "all-season",
        owner_id: user.id,
      })
      .select()
      .single();

    if (oErr || !outfit) {
      console.error(oErr);
      alert(`Kunne ikke gemme outfit: ${oErr?.message ?? "ukendt fejl"}`);
      return;
    }

    const outfitItems = roles.map((r) => ({
      outfit_id: outfit.id,
      item_id: r.id,
      role: r.role,
      position: 1,
    }));

    const { error: oiErr } = await supabase
      .from("outfititem")
      .insert(outfitItems);
    if (oiErr) {
      console.error(oiErr);
      alert(`Kunne ikke gemme items: ${oiErr.message}`);
      return;
    }

    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 relative">
      {/* navbar */}
      <div className="mx-auto max-w-5xl px-4">
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
          <Link href="/items">
            <button className="rounded-lg px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition">
              Manage items
            </button>
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-xl mx-auto p-6 grid gap-3">
        <h1 className="text-2xl font-bold">Foreslå outfit</h1>

        <Link href="/outfits">
          <button className="bg-blue-600 text-white py-2 rounded w-full">
            Se gemte outfits
          </button>
        </Link>

        <button
          className="bg-green-600 text-white py-2 rounded disabled:opacity-60"
          onClick={generate}
          disabled={busy}
        >
          {busy ? "Genererer…" : "Generate"}
        </button>

        <ul className="mt-4 space-y-2">
          {roles.map((r) => (
            <li key={r.role} className="border p-3 rounded">
              <ul>
                <b>{r.role}:</b>
              </ul>
              <ul>
                {r.desc} — {r.brand}
              </ul>
            </li>
          ))}
        </ul>

        {roles.length > 0 && (
          <button
            className="bg-blue-600 text-white py-2 rounded"
            onClick={saveOutfit}
          >
            Gem outfit
          </button>
        )}

        {saved && (
          <p className="text-green-700 font-semibold">Outfit gemt ✅</p>
        )}
      </div>
    </div>
  );
}
