'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Item = { id: string; category: string; description: string | null; image_url: string | null };

export default function ItemsPage() {
  const [category, setCategory] = useState('top');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<Item[]>([]);

  const load = async () => {
    const { data, error } = await supabase.from('Item').select('*').order('created_at', { ascending:false });
    if (!error && data) setItems(data as Item[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const { error } = await supabase.from('Item').insert({ category, description });
    if (error) return alert(error.message);
    setDescription(''); await load();
  };

  return (
    <div className="max-w-xl mx-auto p-6 grid gap-3">
      <h1 className="text-2xl font-bold">Items</h1>
      <div className="grid grid-cols-3 gap-2">
        <select className="border p-2 rounded" value={category} onChange={e=>setCategory(e.target.value)}>
          <option>top</option><option>bottom</option><option>jacket</option>
          <option>shoes</option><option>hairclip</option><option>jewelry</option>
        </select>
        <input className="border p-2 rounded col-span-2" placeholder="Beskrivelse"
               value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
      <button className="bg-blue-600 text-white py-2 rounded" onClick={add}>Gem</button>

      <ul className="mt-4 space-y-2">
        {items.map(i => (
          <li key={i.id} className="border p-3 rounded flex gap-2">
            <span className="font-medium">{i.category}</span> — {i.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
