// Single source of truth for store taxonomy.
// Every component (Navbar, Products, AdminDashboard, Footer, MensCollection,
// FragrancesCollection) imports from here — category strings can NEVER drift
// out of sync between the frontend and what is saved in PocketBase.
//
// To add a new category:
//   1. Add a key to CATEGORIES below.
//   2. Add it to the correct WOMEN_CATEGORIES / MEN_CATEGORIES / FRAGRANCE_CATEGORIES array.
//   3. Add it to ALL_CATEGORIES (used by the Admin product form dropdown).
//   Everything else (Navbar dropdown, Products filter pills, Admin form) updates automatically.

export const GENDERS = {
  WOMEN: 'women',
  MEN:   'men',
};

// IMPORTANT: these strings must match the "category" value saved on each
// product record in PocketBase EXACTLY (case-sensitive).
export const CATEGORIES = {
  // ── Women ────────────────────────────────────────────────
  TWO_PIECE:    'Two Piece',
  BOUBOUS:      'Boubou',
  LUNA_DRESS:   'Luna Dress',
  SUMMER_DRESS: 'Summer Dress',
  AYA_DRESS:    'Aya Dress',
  WOMEN_MORE:   'And More',     // catch-all for future women's products

  // ── Men ──────────────────────────────────────────────────
  LINEN_SHIRTS:    'Linen Shirts',
  MOROCCAN_JILBAB: 'Moroccan Jilbab',
  MENS_FABRICS:    "Men's Fabrics",

  // ── Fragrance ────────────────────────────────────────────
  PERFUMES: 'Perfumes',
  INCENSE:  'Incense',
};

// ── Section category lists (used for filter pills and Navbar dropdowns) ──────
// "All" is the first item — it means no sub-category filter is active.
export const WOMEN_CATEGORIES = [
  'All',
  CATEGORIES.TWO_PIECE,
  CATEGORIES.BOUBOUS,
  CATEGORIES.LUNA_DRESS,
  CATEGORIES.SUMMER_DRESS,
  CATEGORIES.AYA_DRESS,
  CATEGORIES.WOMEN_MORE,
];

export const MEN_CATEGORIES = [
  'All',
  CATEGORIES.LINEN_SHIRTS,
  CATEGORIES.MOROCCAN_JILBAB,
  CATEGORIES.MENS_FABRICS,
];

export const FRAGRANCE_CATEGORIES = [
  'All',
  CATEGORIES.PERFUMES,
  CATEGORIES.INCENSE,
];

// ── Fragrance detection ───────────────────────────────────────────────────────
// These are the ONLY category values that place a product in the Fragrance section.
const FRAGRANCE_CATEGORY_VALUES = [CATEGORIES.PERFUMES, CATEGORIES.INCENSE];

// ── Admin product form dropdown ───────────────────────────────────────────────
// Grouped order: Women first, then Men, then Fragrance.
// "And More" appears at the bottom of the Women group.
export const ALL_CATEGORIES = [
  // Women
  CATEGORIES.TWO_PIECE,
  CATEGORIES.BOUBOUS,
  CATEGORIES.LUNA_DRESS,
  CATEGORIES.SUMMER_DRESS,
  CATEGORIES.AYA_DRESS,
  CATEGORIES.WOMEN_MORE,
  // Men
  CATEGORIES.LINEN_SHIRTS,
  CATEGORIES.MOROCCAN_JILBAB,
  CATEGORIES.MENS_FABRICS,
  // Fragrance
  CATEGORIES.PERFUMES,
  CATEGORIES.INCENSE,
];

// ── Grouped categories for the Admin form (optgroup rendering) ────────────────
export const CATEGORIES_GROUPED = [
  {
    group: 'Women',
    items: [
      CATEGORIES.TWO_PIECE,
      CATEGORIES.BOUBOUS,
      CATEGORIES.LUNA_DRESS,
      CATEGORIES.SUMMER_DRESS,
      CATEGORIES.AYA_DRESS,
      CATEGORIES.WOMEN_MORE,
    ],
  },
  {
    group: 'Men',
    items: [
      CATEGORIES.LINEN_SHIRTS,
      CATEGORIES.MOROCCAN_JILBAB,
      CATEGORIES.MENS_FABRICS,
    ],
  },
  {
    group: 'Fragrance',
    items: [CATEGORIES.PERFUMES, CATEGORIES.INCENSE],
  },
];

// ── Navigation sections (drives Navbar dropdowns and Products page tabs) ──────
export const NAV_SECTIONS = [
  {
    key:        'women',
    label:      'Women',
    type:       'gender',
    value:      GENDERS.WOMEN,
    categories: WOMEN_CATEGORIES,
  },
  {
    key:        'men',
    label:      'Men',
    type:       'gender',
    value:      GENDERS.MEN,
    categories: MEN_CATEGORIES,
  },
  {
    key:        'fragrance',
    label:      'Fragrance',
    type:       'fragrance',
    value:      null,
    categories: FRAGRANCE_CATEGORIES,
  },
];

// ── Utility functions ─────────────────────────────────────────────────────────

// Normalize any free-text string for safe comparison (trims, lowercases)
export function normalize(str) {
  return (str || '').toString().trim().toLowerCase();
}

// Returns true if the product belongs to the Fragrance section
export function isFragrance(product) {
  return FRAGRANCE_CATEGORY_VALUES.some(
    cat => normalize(product?.category) === normalize(cat)
  );
}

// Same check but for a raw category STRING (used in Admin product form)
export function isFragranceCategory(categoryString) {
  return FRAGRANCE_CATEGORY_VALUES.some(
    cat => normalize(categoryString) === normalize(cat)
  );
}

// Use this instead of p.gender === 'women' / p.gender === 'men'
// Fragrance products are never gender-scoped, so they never match.
export function matchesGender(product, gender) {
  if (isFragrance(product)) return false;
  return normalize(product?.gender) === normalize(gender);
}