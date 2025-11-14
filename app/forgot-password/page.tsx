// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage(null);
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        'Hvis e-mailadressen findes i systemet, har vi sendt et link til at nulstille password.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white">
        <h1 className="text-xl font-semibold mb-2">Glemt password</h1>
        <p className="text-sm text-gray-600 mb-4">
          Indtast din e-mail for at nulstille dit password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="dig@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            {loading ? 'Sender...' : 'Send reset-link'}
          </button>

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="mt-4 text-sm">
          <Link href="/login" className="underline text-gray-600">
            Tilbage til login
          </Link>
        </div>
      </div>
    </div>
  );
}
