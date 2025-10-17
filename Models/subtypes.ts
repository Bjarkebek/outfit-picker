// Subtype table models
// Define arrays first and derive types from them to avoid drift.
import type { Season, Shade } from "@/Models/item";
export const SLEEVELENGTHS = ["short", "long"] as const;
export type SleeveLength = (typeof SLEEVELENGTHS)[number] | null;

export type Top = {
  item_id: string;
  type: TopType | null;
  sleevelength: SleeveLength;
  season: Season | null;
  shade: Shade;
};

export type Bottom = {
  item_id: string;
  type: BottomType | null;
  season: Season | null;
  shade: Shade;
};

export type Jacket = {
  item_id: string;
  type: JacketType | null;
  season: Season | null;
  shade: Shade;
};

export type Shoe = {
  item_id: string;
  type: ShoeType | null;
  heel: boolean | null;
  season: Season | null;
  shade: Shade;
};

export type Jewelry = {
  item_id: string;
  type: JewelryType | null;
  bundle_id?: string | null;
};

export type Hairclip = {
  item_id: string;
  shade: Shade;
};

// Dropdown sources for subtype-specific options
export const TOP_TYPES = [
  "t-shirt",
  "shirt",
  "blouse",
  "cardigan",
  "sweater",
  "hoodie",
  "dress",
  "vest",
] as const;
export type TopType = typeof TOP_TYPES[number];

export const BOTTOM_TYPES = [
  "pants",
  "jeans",
  "shorts",
  "sweatpants",
  "skirt",
  "leggins",
] as const;
export type BottomType = typeof BOTTOM_TYPES[number];

export const SHOE_TYPES = [
  "sneakers",
  "sandals",
  "boots",
  "heels",
  "flats",
  "slippers",
] as const;
export type ShoeType = typeof SHOE_TYPES[number];

export const JACKET_TYPES = [
  "blazer",
  "denim",
  "puffer",
  "parka",
  "overcoat",
  "trenchcoat",
  "raincoat",
  "windbreaker",
] as const;
export type JacketType = typeof JACKET_TYPES[number];

export const JEWELRY_TYPES = [
  "earrings",
  "necklace",
  "bracelet",
  "rings",
  "watch",
] as const;
export type JewelryType = typeof JEWELRY_TYPES[number];


// Central place to list jewelry bundles used in UI until moved to DB table
export const JEWELRY_BUNDLES = [
  { id: "bundle1", name: "Jewelry Set 1", occasion: "casual" },
  { id: "bundle2", name: "Jewelry Set 2", occasion: "formal" },
  { id: "bundle3", name: "Jewelry Set 3", occasion: "party" },
];
