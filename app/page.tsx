"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/OutfitPicker.png";

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear browser session
    await supabase.auth.signOut();

    // Tell the server to clear Supabase cookies (so middleware sees you as logged out)
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "SIGNED_OUT", session: null }),
    });

    // New navigation (server request) → middleware runs and sends you to /login
    window.location.replace("/login");
  };

  return (
    <div className="relative font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 shadow"
      >
        Log ud
      </button>

      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Image src={Logo} alt="outfit picker logo" priority />
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-12 pt-32 md:pt-40">
        <header className="flex flex-col items-center gap-2">
          <p className="text-2xl text-gray-700 dark:text-gray-300 text-center max-w-md mt-2">
            Pick a random outfit from your wardrobe or manage your items.
          </p>
        </header>
        <main className="flex flex-col sm:flex-row gap-6 mt-6">
          <Link href="/generate">
            <button className="rounded-lg px-10 py-3 bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition w-full sm:w-auto">
              Generate Outfit
            </button>
          </Link>
          <Link href="/items">
            <button className="rounded-lg px-6 py-3 bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition w-full sm:w-auto">
              Manage Wardrobe
            </button>
          </Link>
        </main>
        
      </div>
    </div>
  );
}
