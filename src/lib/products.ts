/**
 * CATEGORIES — the ONLY place to add, remove, rename or reorder a category.
 * The header menu, mobile menu, homepage category grid (layout adapts automatically),
 * "Shop the collection" tabs (only categories with products) and footer all read this list.
 * Add a tile photo to /public/cats and you're done.
 */
type CategoryInfo = { slug: string; name: string; image: string; position?: string; soon?: boolean };
const CATS = [
  { slug: 'sneakers', name: 'Sneakers', image: '/cats/sneakers.jpg' },
  { slug: 'boots', name: 'Boots', image: '/cats/boots.jpg', position: '50% 40%' },
  { slug: 'sandals', name: 'Sandals', image: '/cats/sandals.jpg' },
  { slug: 'crocs', name: 'Crocs', image: '/cats/crocs.jpg' },
  { slug: 'watches', name: 'Watches', image: '/cats/watches.jpg', soon: true },
] as const satisfies readonly CategoryInfo[];

export type Category = (typeof CATS)[number]['slug'];
export const CATEGORIES: (CategoryInfo & { slug: Category })[] = [...CATS];
/** A colourway. `image` is its main photo (used on cards); `images` is its own gallery. */
export type Color = { name: string; hex: string; image: string; images: string[] };
export type Product = {
  handle: string;
  brand: string;
  name: string;
  cat: Category;
  price: number;
  was?: number;
  colors: Color[];
  sizes: string[];
  soldOut?: string[]; // sizes out of stock
  best?: boolean;
  isNew?: boolean;
};

const EU = ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'];
const UK = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];
/**
 * c('Panda', '#151515', 'dunk-panda', 2) -> main photo /products/dunk-panda.jpg
 * plus extra shots dunk-panda-2.jpg ... (the last number = total photos for this colourway).
 */
const c = (name: string, hex: string, file: string, photos = 1): Color => {
  const images = Array.from({ length: photos }, (_, i) => `/products/${file}${i ? `-${i + 1}` : ''}.jpg`);
  return { name, hex, image: images[0], images };
};

export const PRODUCTS: Product[] = [
  {
    handle: 'nike-dunk-low', brand: 'Nike', name: 'Dunk Low', cat: 'sneakers', price: 2599, was: 3200, best: true,
    sizes: EU, soldOut: ['EU 45'],
    colors: [c('Panda', '#151515', 'dunk-panda', 2), c('Grey Fog', '#c8c8c6', 'dunk-grey-fog'), c('Medium Olive', '#6b6a3c', 'dunk-olive'), c('Midnight Navy', '#1f2a44', 'dunk-navy'), c('Pink Foam', '#f1c7cf', 'dunk-pink'), c('Cacao Wow', '#6b3e26', 'dunk-brown')],
  },
  {
    handle: 'air-jordan-1-retro-high', brand: 'Jordan', name: 'Air Jordan 1 Retro High', cat: 'sneakers', price: 3499, best: true,
    sizes: EU,
    colors: [c('Obsidian', '#1f2a44', 'jordan-1-obsidian'), c('Black Gum', '#1a1a1a', 'jordan-1-black-gum'), c('University Blue', '#7bafd4', 'jordan-1-unc')],
  },
  {
    handle: 'new-balance-9060', brand: 'New Balance', name: '9060', cat: 'sneakers', price: 3650, best: true, isNew: true,
    sizes: EU, soldOut: ['EU 40'],
    colors: [c('Triple Black', '#111111', 'nb9060-black'), c('Sea Salt', '#e8e1d3', 'nb9060-seasalt', 3)],
  },
  {
    handle: 'new-balance-530', brand: 'New Balance', name: '530', cat: 'sneakers', price: 2949, best: true,
    sizes: EU,
    colors: [c('White Silver', '#d9d9d9', 'nb530-silver', 3), c('Black', '#151515', 'nb530-black')],
  },
  {
    handle: 'onitsuka-tiger-mexico-66', brand: 'Onitsuka Tiger', name: 'Mexico 66', cat: 'sneakers', price: 2799, isNew: true, best: true,
    sizes: EU,
    colors: [c('Birch / Navy', '#e6dcc6', 'mexico-66-beige'), c('Classic Red', '#c8202a', 'mexico-66-red')],
  },
  {
    handle: 'nike-p-6000', brand: 'Nike', name: 'P-6000', cat: 'sneakers', price: 2999, was: 3999, best: true,
    sizes: EU, soldOut: ['EU 41'],
    colors: [c('Metallic Silver', '#c0c4c9', 'p6000-silver', 3), c('Silver / Blue', '#4a6fb5', 'p6000-blue')],
  },
  {
    handle: 'new-balance-2002r', brand: 'New Balance', name: '2002R', cat: 'sneakers', price: 3450,
    sizes: EU,
    colors: [c('Black', '#151515', 'nb2002r-black'), c('Rain Cloud', '#9a9a9a', 'nb2002r-grey', 2)],
  },
  {
    handle: 'new-balance-1906r', brand: 'New Balance', name: '1906R', cat: 'sneakers', price: 3550, isNew: true,
    sizes: EU,
    colors: [c('Silver Metallic', '#c9cbd0', 'nb1906r-silver', 3), c('Navy / Silver', '#3d4f8a', 'nb1906r-blue')],
  },
  {
    handle: 'converse-chuck-70', brand: 'Converse', name: 'Chuck 70', cat: 'sneakers', price: 2199,
    sizes: EU,
    colors: [c('Black', '#151515', 'chuck-70-black', 3), c('Dark Root', '#5a3825', 'chuck-70-brown')],
  },
  {
    handle: 'leather-chelsea-boots', brand: 'SOLEHAUS', name: 'Leather Chelsea Boots', cat: 'boots', price: 1949,
    sizes: EU,
    colors: [c('Black', '#111111', 'chelsea-black', 2), c('Brown', '#5c3a21', 'chelsea-brown', 3)],
  },
  {
    handle: 'two-strap-buckle-slides', brand: 'SOLEHAUS', name: 'Two-Strap Buckle Slides', cat: 'sandals', price: 1649,
    sizes: EU,
    colors: [c('Black', '#151515', 'slide-black'), c('Olive Grey', '#6f6a5c', 'slide-olive')],
  },
  {
    handle: 'leather-fisherman-sandals', brand: 'SOLEHAUS', name: 'Leather Fisherman Sandals', cat: 'sandals', price: 1799, isNew: true,
    sizes: EU,
    colors: [c('Brown', '#6b3e26', 'fisherman-brown')],
  },
  {
    handle: 'crocs-classic-clog', brand: 'Crocs', name: 'Classic Clog', cat: 'crocs', price: 1899,
    sizes: UK,
    colors: [c('Black', '#151515', 'clog-black', 2), c('Bone', '#e8dfcc', 'clog-bone', 2), c('Navy', '#1f2a44', 'clog-navy')],
  },
];


export const byCat = (cat: Category) => PRODUCTS.filter((p) => p.cat === cat);
/** New arrivals first, bestsellers last, so this row doesn't repeat the Bestsellers row. */
export const byCatFresh = (cat: Category) =>
  byCat(cat).sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || Number(!!a.best) - Number(!!b.best));
export const bestsellers = () => PRODUCTS.filter((p) => p.best);
export const pctOff = (p: Product) => (p.was ? Math.round((1 - p.price / p.was) * 100) : 0);

export const getProduct = (handle: string) => PRODUCTS.find((p) => p.handle === handle);

/** URL-safe colour name: 'Grey Fog' -> 'grey-fog'. */
export const colorSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
/** Product URL, with ?color= for any colourway other than the first. */
export const productHref = (p: Product, colorName?: string) =>
  !colorName || colorName === p.colors[0].name ? `/products/${p.handle}` : `/products/${p.handle}?color=${colorSlug(colorName)}`;
/** Display title; skips the brand when it's the store's own or the name already contains it ("Air Jordan 1"). */
export const titleOf = (p: Product) =>
  p.brand === 'SOLEHAUS' || p.name.toLowerCase().includes(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`;
export const catInfo = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))];

/** Same category first, then bestsellers; excludes the product itself. */
export const related = (p: Product, n = 4) =>
  [...PRODUCTS.filter((x) => x.handle !== p.handle && x.cat === p.cat), ...PRODUCTS.filter((x) => x.handle !== p.handle && x.cat !== p.cat && x.best)].slice(0, n);

/** Simple ranked search over brand, name, colours and category. */
export function searchProducts(q: string) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return PRODUCTS.map((p) => {
    const hay = `${p.brand} ${p.name} ${p.colors.map((c) => c.name).join(' ')} ${p.cat}`.toLowerCase();
    const title = titleOf(p).toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (!hay.includes(t)) return { p, score: 0 };
      score += title.startsWith(t) ? 6 : title.includes(t) ? 4 : 1;
    }
    return { p, score: score + (p.best ? 0.5 : 0) };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}
