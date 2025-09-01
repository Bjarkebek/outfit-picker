// Client-side page: generates a random outfit with constraints and can save it
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from "next/image";
import Link from "next/link";

// Item coming from the database.
// - category: which role the item can fill (top/bottom/jacket/...)
// - tone: coarse color tone used to avoid identical tones between top & bottom
// - type: free text used for simple style heuristics (e.g., tshirt, dress, jeans, sneakers)
// - statement_piece: whether the item is a "statement" (we try to keep max 1 per outfit)
// - season: not used in the logic right now
type Item = {
  id: string;
  category: 'top'|'bottom'|'jacket'|'shoes'|'hairclip'|'jewelry';
  description: string | null;
  tone: 'light'|'medium'|'dark'|null;
  type: string | null;            // e.g., tshirt, dress, jeans, sneakers, ...
  statement_piece?: boolean | null;
  season?: string | null;         // not used in the logic right now
};

// Result we render/save (role + item id + readable description)
type Chosen = { role: 'dress'|'top'|'bottom'|'jacket'|'shoes'|'hairclip'|'jewelry', id: string, desc: string };

// ------- STYLE HEURISTICS (no new column; based on "type") -------
// Heuristics mapping an item's "type" to a coarse style bucket (casual/smart/formal).
const TOP_CASUAL   = new Set(['tshirt','tanktop','croptop','hoodie','sweater','cardigan']);
const TOP_SMART    = new Set(['blouse','shirt','vest','cardigan']); // cardigan can be both — listed in casual and smart
const TOP_FORMAL   = new Set(['dress']); // dress handled separately

const BOTTOM_CASUAL = new Set(['jeans','shorts','leggings']);
const BOTTOM_SMART  = new Set(['pants','chinos','skirt']); // simple heuristic

const SHOES_CASUAL  = new Set(['sneakers','sandals','flats','slippers']);
const SHOES_SMART   = new Set(['boots','loafers']);
const SHOES_FORMAL  = new Set(['heels']);

// Compute style bucket (casual/smart/formal) for an item based on its type and category.
function styleOf(item: Item): 'casual'|'smart'|'formal' {
  const t = (item.type ?? '').toLowerCase();

  if (item.category === 'top') {
    if (TOP_FORMAL.has(t)) return 'formal';
    if (TOP_SMART.has(t))  return 'smart';
    if (TOP_CASUAL.has(t)) return 'casual';
    return 'smart'; // fallback
  }
  if (item.category === 'bottom') {
    if (BOTTOM_SMART.has(t))  return 'smart';
    if (BOTTOM_CASUAL.has(t)) return 'casual';
    return 'smart'; // fallback
  }
  if (item.category === 'shoes') {
    if (SHOES_FORMAL.has(t)) return 'formal';
    if (SHOES_SMART.has(t))  return 'smart';
    if (SHOES_CASUAL.has(t)) return 'casual';
    return 'smart'; // fallback
  }
  // jewelry/hairclip/jacket: let them follow the rest
  return 'smart';
}

// Two styles are compatible if they match, or if smart/formal are mixed.
// Casual is not mixed with smart/formal.
function compatible(a: 'casual'|'smart'|'formal', b: 'casual'|'smart'|'formal') {
  if (a === b) return true;
  // allow smart <-> formal (but not casual mixed with them)
  if ((a === 'smart' && b === 'formal') || (a === 'formal' && b === 'smart')) return true;
  return false;
}

// ------- HELPERS -------

// Return a random element from an array (or null if empty).
function rand<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random()*arr.length)];
}

// Try to pick a random item in a given category subject to:
// - optional filter (e.g., non-statement)
// - avoidIds: items we must not reuse in the same outfit
// - limited number of random attempts for performance
function pickIn(
  items: Item[],
  category: Item['category'],
  filter?: (x: Item) => boolean,
  avoidIds: Set<string> = new Set(),
  tries = 8
): Item | null {
  const pool = items.filter(i => i.category === category && !avoidIds.has(i.id) && (!filter || filter(i)));
  if (!pool.length) return null;
  // try up to N times in random order
  for (let k = 0; k < tries; k++) {
    const candidate = rand(pool);
    if (candidate) return candidate;
  }
  return null;
}

export default function Generate() {
  // roles: current generated selection shown in the UI
  // saved: whether the last generated outfit has been persisted
  const [roles, setRoles] = useState<Chosen[]>([]);
  const [saved, setSaved] = useState(false);

  // Generate a new outfit using the rules:
  // - optional "dress" branch (exclusive with top/bottom)
  // - otherwise choose top + bottom + shoes
  // - attempt tone and style compatibility
  // - optional accessories (jewelry/hairclip)
  // - then enforce max 1 statement piece
  const generate = async () => {
    setSaved(false); // clear "saved" flag on new generation

    // Fetch all active items from Supabase
    const { data: items } = await supabase.from('item').select('*').eq('active', true);
    if (!items) return;

    const avoid = new Set<string>(); // track used item ids to avoid duplicates
    let chosen: Chosen[] = [];

    // --- 1) DRESS BRANCH (exclusive core: no top/bottom) ---
    // Identify dresses (type === 'dress') among tops.
    const dresses = items.filter(i => i.category === 'top' && (i.type ?? '').toLowerCase() === 'dress');
    const pickDress = () => rand(dresses);

    // 10% chance to choose a dress if any exist.
    const useDress = dresses.length > 0 && Math.random() < 0.1;

    if (useDress) {
      const dress = pickDress();
      if (dress) {
        // Add dress as a single core piece (no separate top/bottom)
        chosen.push({ role: 'dress', id: dress.id, desc: dress.description ?? 'Kjole' });
        avoid.add(dress.id);

        // Pick shoes that match the dress style
        const dressStyle = styleOf(dress);
        const shoesFilter = (x: Item) => x.category === 'shoes' && compatible(styleOf(x), dressStyle);
        // Try style-matching shoes, fall back to any shoes if none found
        const shoes = pickIn(items, 'shoes', shoesFilter, avoid) ?? pickIn(items, 'shoes', undefined, avoid);
        if (shoes) {
          chosen.push({ role: 'shoes', id: shoes.id, desc: shoes.description ?? 'Shoes' });
          avoid.add(shoes.id);
        }

        // Pick jewelry (prefer non-statement to keep max 1 statement)
        const jewelryFilter = (x: Item) => !x.statement_piece;
        const jewelry = pickIn(items, 'jewelry', jewelryFilter, avoid) ?? pickIn(items, 'jewelry', undefined, avoid);
        if (jewelry) {
          chosen.push({ role: 'jewelry', id: jewelry.id, desc: jewelry.description ?? 'Jewelry' });
          avoid.add(jewelry.id);
        }

        // Optional hairclip — small probability
        if (Math.random() < 0.35) {
          const clip = pickIn(items, 'hairclip', undefined, avoid);
          if (clip) { chosen.push({ role: 'hairclip', id: clip.id, desc: clip.description ?? 'Hairclip' }); }
        }
      }
    } else {
      // --- 2) TOP/BOTTOM/SHOES BRANCH ---
      // Pick top (avoid picking a dress as a top here)
      const top = pickIn(items, 'top', (x) => (x.type ?? '').toLowerCase() !== 'dress', avoid);
      if (top) {
        chosen.push({ role: 'top', id: top.id, desc: top.description ?? 'Top' });
        avoid.add(top.id);
      }

      // Pick bottom that matches both tone and style
      // Enforce:
      // - different tone than top (if both have tone)
      // - compatible style bucket
      let bottom: Item | null = null;
      if (top) {
        const topStyle = styleOf(top);
        const bottomTry = () =>
          pickIn(items, 'bottom', (b) => {
            if (top.tone && b.tone && top.tone === b.tone) return false; // avoid same tone
            return compatible(topStyle, styleOf(b));
          }, avoid);

        // Attempt a matching bottom, otherwise fall back to any available bottom
        bottom = bottomTry() ?? pickIn(items, 'bottom', undefined, avoid);
      } else {
        bottom = pickIn(items, 'bottom', undefined, avoid);
      }
      if (bottom) {
        chosen.push({ role: 'bottom', id: bottom.id, desc: bottom.description ?? 'Bottom' });
        avoid.add(bottom.id);
      }

      // Pick shoes matching style with (top || bottom)
      // Use whichever of top/bottom exists as the style anchor.
      const styleAnchor = top ?? bottom;
      let shoes: Item | null = null;
      if (styleAnchor) {
        const anchorStyle = styleOf(styleAnchor);
        shoes = pickIn(items, 'shoes', (s) => compatible(anchorStyle, styleOf(s)), avoid)
            ?? pickIn(items, 'shoes', undefined, avoid);
      } else {
        shoes = pickIn(items, 'shoes', undefined, avoid);
      }
      if (shoes) {
        chosen.push({ role: 'shoes', id: shoes.id, desc: shoes.description ?? 'Shoes' });
        avoid.add(shoes.id);
      }

      // Optional jewelry — try to keep max 1 statement (handled later)
      const jewelry = pickIn(items, 'jewelry', undefined, avoid);
      if (jewelry) {
        chosen.push({ role: 'jewelry', id: jewelry.id, desc: jewelry.description ?? 'Jewelry' });
        avoid.add(jewelry.id);
      }

      // Optional hairclip — small probability
      if (Math.random() < 0.25) {
        const clip = pickIn(items, 'hairclip', undefined, avoid);
        if (clip) chosen.push({ role: 'hairclip', id: clip.id, desc: clip.description ?? 'Hairclip' });
      }
    }

    // --- 3) MAX 1 STATEMENT PIECE ---
    // If multiple chosen items are marked as statement, try to replace accessories
    // with non-statement alternatives first; if that fails, remove extras.
    const chosenIds = new Set(chosen.map(c => c.id));
    const withItems: (Chosen & { item?: Item })[] = chosen.map(c => ({ ...c, item: items.find(i => i.id === c.id) || undefined }));
    const statementCount = withItems.reduce((acc, c) => acc + ((c.item?.statement_piece) ? 1 : 0), 0);

    if (statementCount > 1) {
      // Try to swap out statement jewelry/hairclip with non-statement alternatives.
      for (const targetRole of ['jewelry','hairclip'] as const) {
        if (withItems.filter(c => c.item?.statement_piece).length <= 1) break;
        const idx = withItems.findIndex(c => c.role === targetRole && c.item?.statement_piece);
        if (idx >= 0) {
          const replacement = pickIn(
            items,
            targetRole,
            (x) => !x.statement_piece && !chosenIds.has(x.id),
            new Set(), 6
          );
          if (replacement) {
            chosenIds.delete(withItems[idx].id);
            withItems[idx] = { role: targetRole, id: replacement.id, desc: replacement.description ?? targetRole, item: replacement };
            chosenIds.add(replacement.id);
          } else {
            // If no non-statement replacement exists, remove that accessory entirely.
            withItems.splice(idx, 1);
          }
        }
      }
      // If still > 1 statement (e.g., both top and shoes are statement),
      // remove the last statement to keep only one.
      let still = withItems.filter(c => c.item?.statement_piece);
      while (still.length > 1) {
        const removeIdx = withItems.findLastIndex(c => c.item?.statement_piece);
        if (removeIdx >= 0) withItems.splice(removeIdx, 1);
        still = withItems.filter(c => c.item?.statement_piece);
      }
    }

    // Persist the selection to local state (strip the attached full item copies)
    setRoles(withItems.map(({item, ...rest}) => rest));
  };

  // Persist the generated outfit (+ relations) into the DB.
  // 1) Insert into 'outfit' and get the created row
  // 2) Insert one row per chosen item into 'outfititem' with role and a fixed position
  const saveOutfit = async () => {
    if (roles.length === 0) return;

    const { data: outfit, error: oErr } = await supabase
      .from('outfit')
      .insert({
        description: 'Auto-genereret outfit',
        type: 'casual',        // can be chosen later in the UI
        season: 'all-season',  // can be derived later
      })
      .select()
      .single();

    if (oErr || !outfit) {
      console.error(oErr);
      return;
    }

    const outfitItems = roles.map(r => ({
      outfit_id: outfit.id,
      item_id: r.id,
      role: r.role,
      position: 1,
    }));

    const { error: oiErr } = await supabase.from('outfititem').insert(outfitItems);
    if (oiErr) {
      console.error(oiErr);
      return;
    }

    setSaved(true); // show confirmation in the UI
  };

  return (
    // Narrow, centered layout container for the generator UI
    <div className="max-w-xl mx-auto p-6 grid gap-3">
      {/* Sticky navbar with back button, centered logo, and link to Items page */}
      <nav className="flex items-center justify-between px-2 py-4 mb-8 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 sticky top-0 z-10 rounded-xl">
        <Link href="#"><button className="hidden" aria-hidden /></Link>{/* placeholder to keep Link import valid if needed */}
        <Link href="/"><button className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition">← Back</button></Link>
        <Image src="/OutfitPickerLogo.png" alt="Outfit Picker Logo" width={50} height={50} priority />
        <Link href="/items"><button className="rounded-lg px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition">Manage items</button></Link>
      </nav>

      {/* Page title (UI text kept as-is) */}
      <h1 className="text-2xl font-bold">Foreslå outfit</h1>

      {/* Navigate to a page listing saved outfits */}
      <Link href="/outfits">
        <button className="bg-blue-600 text-white py-2 rounded w-full">Se gemte outfits</button>
      </Link>

      {/* Trigger generation with the current rules */}
      <button className="bg-green-600 text-white py-2 rounded" onClick={generate}>Generate</button>

      {/* Render the chosen roles (role label + item description) */}
      <ul className="mt-4 space-y-2">
        {roles.map(r => (
          <li key={r.role} className="border p-3 rounded">
            <b>{r.role}</b> — {r.desc}
          </li>
        ))}
      </ul>

      {/* Only show the save button when an outfit has been generated */}
      {roles.length > 0 && (
        <button className="bg-blue-600 text-white py-2 rounded" onClick={saveOutfit}>
          Gem outfit
        </button>
      )}

      {/* Confirmation after saving */}
      {saved && <p className="text-green-700 font-semibold">Outfit gemt ✅</p>}
    </div>
  );
}