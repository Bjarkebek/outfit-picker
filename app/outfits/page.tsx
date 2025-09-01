'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1) hent alle outfits
        const { data: outfitsData, error: oErr } = await supabase
          .from('outfit')
          .select('*')
          .order('created_at', { ascending: false });
        if (oErr || !outfitsData) return;

        // 2) hent outfititems for hvert outfit, og map item = item[0]
        const full: Outfit[] = [];
        for (const o of outfitsData) {
          const { data: itemsData, error: iErr } = await supabase
            .from('outfititem')
            .select('role, item: item_id (description, image_url)')
            .eq('outfit_id', o.id);

          if (iErr) continue;

          const mapped =
            (itemsData || []).map((it: any) => ({
              role: it.role as string,
              item: (Array.isArray(it.item) && it.item.length > 0)
                ? { description: it.item[0].description as string | null, image_url: it.item[0].image_url as string | null }
                : { description: null, image_url: null },
            })) ?? [];

          full.push({
            id: o.id,
            description: o.description,
            created_at: o.created_at,
            items: mapped,
          });
        }
        setOutfits(full);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Gemte outfits</h1>

      {loading && <p className="text-sm text-gray-600">Henter…</p>}

      {!loading && outfits.length === 0 && (
        <p className="text-sm text-gray-600">Ingen outfits endnu.</p>
      )}

      {outfits.map((o) => (
        <div key={o.id} className="rounded-xl border bg-white p-4 shadow-sm dark:bg-white/5 dark:border-white/10">
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
  );
}
