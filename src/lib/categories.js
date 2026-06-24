// Single source of truth for store taxonomy.
// Every component (Navbar, Products, AdminDashboard, Footer) imports from here
// so category/gender strings can NEVER drift out of sync again.

export const GENDERS = {
  WOMEN: 'women',
  MEN:   'men',
};

// IMPORTANT: these strings must match the "category" value saved on each
// product record in PocketBase EXACTLY (case-sensitive).
export const CATEGORIES = {
  // Women
  BOUBOUS:  'Boubous',
  GOWNS:    'Gowns',
  ANKARA:   'Ankara',
  // Men
  AGBADA:   'Agbada',
  KAFTAN:   'Kaftan',
  BABARIGA: 'Babariga',
  SENATOR:  'Senator',
  // Fragrance — plural forms to match PocketBase records
  PERFUMES: 'Perfumes',
  INCENSE:  'Incense',
};

export const WOMEN_CATEGORIES     = ['All', CATEGORIES.BOUBOUS, CATEGORIES.GOWNS, CATEGORIES.ANKARA];
export const MEN_CATEGORIES       = ['All', CATEGORIES.AGBADA, CATEGORIES.KAFTAN, CATEGORIES.BABARIGA, CATEGORIES.SENATOR];
export const FRAGRANCE_CATEGORIES = ['All', CATEGORIES.PERFUMES, CATEGORIES.INCENSE];

// The actual category values that belong under the Fragrance section
const FRAGRANCE_CATEGORY_VALUES = [CATEGORIES.PERFUMES, CATEGORIES.INCENSE];

// All categories used by the Admin product form dropdown
export const ALL_CATEGORIES = [
  CATEGORIES.BOUBOUS, CATEGORIES.GOWNS, CATEGORIES.ANKARA,
  CATEGORIES.AGBADA, CATEGORIES.KAFTAN, CATEGORIES.BABARIGA, CATEGORIES.SENATOR,
  CATEGORIES.PERFUMES, CATEGORIES.INCENSE,
];

export const NAV_SECTIONS = [
  { key: 'women',     label: 'Women',     type: 'gender',    value: GENDERS.WOMEN, categories: WOMEN_CATEGORIES },
  { key: 'men',       label: 'Men',       type: 'gender',    value: GENDERS.MEN,   categories: MEN_CATEGORIES },
  { key: 'fragrance', label: 'Fragrance', type: 'fragrance', value: null,          categories: FRAGRANCE_CATEGORIES },
];

// Normalize any free-text string for safe comparison
export function normalize(str) {
  return (str || '').toString().trim().toLowerCase();
}

// Returns true if the product belongs to the Fragrance section
export function isFragrance(product) {
  return FRAGRANCE_CATEGORY_VALUES.some(
    cat => normalize(product?.category) === normalize(cat)
  );
}

// Same check but for a raw category STRING (used in Admin form)
export function isFragranceCategory(categoryString) {
  return FRAGRANCE_CATEGORY_VALUES.some(
    cat => normalize(categoryString) === normalize(cat)
  );
}

// Use this instead of p.gender === 'women' / p.gender === 'men'
export function matchesGender(product, gender) {
  if (isFragrance(product)) return false; // never gender-scoped
  return normalize(product?.gender) === normalize(gender);
}