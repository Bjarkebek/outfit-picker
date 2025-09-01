import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Logo fixed near the top, centered */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Image
          src="/OutfitPicker.png"
          alt="outfit picker logo"
          width={500}
          height={500}
          priority
        />
      </div>

      {/* Center text and buttons; add top padding to avoid overlap with the logo */}
      <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-12 pt-32 md:pt-40">
        <header className="flex flex-col items-center gap-2">
          <p className="text-2xl text-gray-700 dark:text-gray-300 text-center max-w-md mt-2">
            Pick a random outfit from your wardrobe or manage your items.
          </p>
        </header>
        <main className="flex flex-col sm:flex-row gap-6 mt-6">
          <Link href="/items">
            <button className="rounded-lg px-6 py-3 bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition w-full sm:w-auto">
              Manage Wardrobe
            </button>
          </Link>
          <Link href="/generate">
            <button className="rounded-lg px-10 py-3 bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition w-full sm:w-auto">
              Generate Outfit
            </button>
          </Link>
        </main>
        <footer className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Outfit Picker
        </footer>
      </div>
    </div>
  );
}