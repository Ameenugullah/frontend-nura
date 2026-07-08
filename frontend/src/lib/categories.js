export const GENDERS = {
  WOMEN: 'women',
  MEN:   'men',
};

export const CATEGORIES = {
  TWO_PIECE:    'Two Piece',
  BOUBOUS:      'Boubou',
  LUNA_DRESS:   'Luna Dress',
  SUMMER_DRESS: 'Summer Dress',
  AYA_DRESS:    'Aya Dress',
  WOMEN_MORE:   'And More',

  LINEN_SHIRTS:    'Linen Shirts',
  MOROCCAN_JILBAB: 'Moroccan Jilbab',
  MENS_FABRICS:    "Men's Fabrics",

  PERFUMES: 'Perfumes',
  INCENSE:  'Incense',
};

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

const FRAGRANCE_CATEGORY_VALUES = [CATEGORIES.PERFUMES, CATEGORIES.INCENSE];

export const ALL_CATEGORIES = [
  CATEGORIES.TWO_PIECE,
  CATEGORIES.BOUBOUS,
  CATEGORIES.LUNA_DRESS,
  CATEGORIES.SUMMER_DRESS,
  CATEGORIES.AYA_DRESS,
  CATEGORIES.WOMEN_MORE,
  CATEGORIES.LINEN_SHIRTS,
  CATEGORIES.MOROCCAN_JILBAB,
  CATEGORIES.MENS_FABRICS,
  CATEGORIES.PERFUMES,
  CATEGORIES.INCENSE,
];

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

export function normalize(str) {
  return (str || '').toString().trim().toLowerCase();
}

export function isFragrance(product) {
  return FRAGRANCE_CATEGORY_VALUES.some(
    cat => normalize(product?.category) === normalize(cat)
  );
}

export function isFragranceCategory(categoryString) {
  return FRAGRANCE_CATEGORY_VALUES.some(
    cat => normalize(categoryString) === normalize(cat)
  );
}

export function matchesGender(product, gender) {
  if (isFragrance(product)) return false;
  return normalize(product?.gender) === normalize(gender);
}
