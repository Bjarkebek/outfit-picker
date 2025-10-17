export const CATEGORIES = [
  "top",
  "bottom",
  "jacket",
  "shoes",
  "hairclip",
  "jewelry",
] as const;
export type Category = typeof CATEGORIES[number];

export const SEASONS = [
  "spring",
  "summer",
  "autumn",
  "winter",
  "all-season",
] as const;
export type Season = typeof SEASONS[number];

export const SHADES = ["light", "medium", "dark"] as const;
export type Shade = typeof SHADES[number] | null;


export type Item = {
  id: string;
  category: Category;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
  color: string | null;
  brand: string | null;
  statement_piece: boolean | null;
  owner_id?: string | null;
};

