'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser'; // ✅ brug browser-klient
import Image from 'next/image';
import Link from 'next/link';

type OutfitRow = {
  id: string;
  description: string | null;
  created_at: string;
};

type OutfitItemRow = {
  role: string;
  item:
    | { description: string | null; image_url: string | null } // typisk objekt
    | { description: string | null; image_url: string | null }[] // fallback hvis lib returnerer array
    | null;
};

type Outfit = {
  id: string;
  description: string | null;
  created_at: string;
  items: {
    role: string;
    item: { description: string | null; image_url: string | null };
  }[];
};

export default function OutfitsPage() {
  const supabase = supabaseBrowser(); // ✅
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Sikr at vi HAR en session (ellers filtrerer RLS alt væk)
        const { data: { user }, error: uErr } = await supabase.auth.getUser();
        if (uErr || !user) {
          setErr('Ingen aktiv session. Log ind og prøv igen.');
          setLoading(false);
          return;
        }

        // 1) Hent alle outfits for brugeren (RLS sørger for ejer-filter)
        const { data: outfitsData, error: oErr } = await supabase
          .from('outfit')
          .select('*')
          .order('created_at', { ascending: false });

        if (oErr) {
          console.error(oErr);
          setErr(oErr.message);
          setLoading(false);
          return;
        }
        const rows = (outfitsData ?? []) as OutfitRow[];
        if (!rows.length) {
          setOutfits([]);
          setLoading(false);
          return;
        }

        // 2) Hent alle outfititems for ALLE outfits i ét kald (mindre chatter)
        const ids = rows.map((o) => o.id);
        const { data: itemsData, error: iErr } = await supabase
          .from('outfititem')
          .select('outfit_id, role, item:item_id (description, image_url)')
          .in('outfit_id', ids);

        if (iErr) {
          console.error(iErr);
          setErr(iErr.message);
          setLoading(false);
          return;
        }

        // Gruppér items per outfit_id
        const byOutfit = new Map<string, OutfitItemRow[]>();
        (itemsData ?? []).forEach((row: any) => {
          const arr = byOutfit.get(row.outfit_id) ?? [];
          arr.push(row as OutfitItemRow);
          byOutfit.set(row.outfit_id, arr);
        });

        // 3) Byg den endelige struktur
        const full: Outfit[] = rows.map((o) => {
          const list = byOutfit.get(o.id) ?? [];
          const mapped = list.map((it) => {
            // Normalisér item til ét objekt (håndtér både objekt/array/null)
            let itemObj: { description: string | null; image_url: string | null } = {
              description: null,
              image_url: null,
            };
            if (Array.isArray(it.item)) {
              const first = it.item[0];
              if (first) itemObj = { description: first.description, image_url: first.image_url };
            } else if (it.item && typeof it.item === 'object') {
              itemObj = { description: it.item.description, image_url: it.item.image_url };
            }
            return { role: it.role, item: itemObj };
          });

          return {
            id: o.id,
            description: o.description,
            created_at: o.created_at,
            items: mapped,
          };
        });

        setOutfits(full);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? 'Ukendt fejl');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

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

          <div className="flex gap-2">
            <Link href="/generate">
              <button className="rounded-lg px-4 py-2 bg-green-600 text-white hover:bg-green-700">
                Generate outfit
              </button>
            </Link>
          </div>
        </nav>
      </div>

      {/* main content */}
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Gemte outfits</h1>

        {loading && <p className="text-sm text-gray-600">Henter…</p>}
        {err && <p className="text-sm text-red-600">Fejl: {err}</p>}

        {!loading && !err && outfits.length === 0 && (
          <p className="text-sm text-gray-600">Ingen outfits endnu.</p>
        )}

        {outfits.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border bg-white p-4 shadow-sm dark:bg-white/5 dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {o.description || 'Outfit'}
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </h2>
            </div>

            <ul className="mt-3 space-y-2">
              {o.items.map((it, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  {it.item.image_url ? (
                    <img
                      src={it.item.image_url}
                      alt={it.item.description ?? ''}
                      className="h-12 w-12 rounded object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded grid place-items-center border border-dashed text-xs text-gray-500">
                      no img
                    </div>
                  )}
                  <span>
                    <b>{it.role}</b> — {it.item.description ?? '(ingen beskrivelse)'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
