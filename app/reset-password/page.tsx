// app/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setError('Password skal mindst være 6 tegn.');
      return;
    }

    if (newPassword !== confirm) {
      setError('De to passwords matcher ikke.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Dit password er opdateret. Du kan nu logge ind.');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white">
        <h1 className="text-xl font-semibold mb-2">Nyt password</h1>
        <p className="text-sm text-gray-600 mb-4">
          Indtast et nyt password til din konto.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Nyt password
            </label>
            <input
              id="password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="confirm">
              Gentag password
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-3 py-2 text-sm font-medium border disabled:opacity-60"
          >
            {loading ? 'Opdaterer...' : 'Opdater password'}
          </button>

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}
