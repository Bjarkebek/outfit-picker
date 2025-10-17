export const OUTFIT_TYPES = ["casual", "smart", "formal"] as const;
export type OutfitType = typeof OUTFIT_TYPES[number];
