// Shared Tailwind UI class helpers
// Centralize frequently used className strings to keep pages tidy and consistent.

export const cardClass =
  "rounded-xl border bg-white/90 backdrop-blur p-5 shadow-sm border-gray-200 dark:bg-white/5 dark:border-white/10";

export const pillMuted =
  "text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80";

export const inputClass =
  [
    "w-full rounded-lg px-3 py-2 border transition focus:outline-none focus:ring-2",
    "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500",
    "dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400",
  ].join(" ");

export const buttonPrimary =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed";

// Secondary/neutral button commonly used for subtle actions
export const buttonSub =
  "rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15";
