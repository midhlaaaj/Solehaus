export const SITE = {
  name: 'SOLEHAUS',
  // placeholder WhatsApp number: country code + number, no "+"
  whatsapp: '910000000000',
  instagram: 'https://www.instagram.com/',
};

export const waLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export const ANNOUNCEMENTS = [
  'Cash on delivery available across India',
  'Delivered in 3–4 days, with tracking',
  'Branded box + safety box on every pair',
];

export const SHIPPING = {
  fast: { id: 'fast', label: 'Fast delivery', days: [3, 4], fee: 199 },
  standard: { id: 'standard', label: 'Standard delivery', days: [6, 8], fee: 0 },
} as const;
export type ShipId = keyof typeof SHIPPING;

const fmt = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
/** "Thu, 28 Nov – Fri, 29 Nov" from today. */
export function deliveryWindow(id: ShipId, from = new Date()) {
  const [a, b] = SHIPPING[id].days;
  const add = (n: number) => new Date(from.getTime() + n * 86400000);
  return `${fmt(add(a))} – ${fmt(add(b))}`;
}
