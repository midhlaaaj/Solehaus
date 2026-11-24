'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Banknote, Check, ChevronDown, ChevronRight, Minus, Package, Plus, Ruler, Share2, Truck, X } from 'lucide-react';
import { catInfo, colorSlug, pctOff, related, titleOf, type Product } from '@/lib/products';
import { SHIPPING, deliveryWindow, inr, waLink, type ShipId } from '@/lib/site';
import { useCart } from '../cart';
import { WhatsAppIcon } from '../icons';
import OrderSheet from '../OrderSheet';
import ProductRail from '../ProductRail';
import { SectionHead } from '../Reveal';

const EASE = [0.2, 0.7, 0.2, 1] as const;
const SIZE_CHART = [
  ['EU 40', 'UK 6', 'US 7', '25.0'],
  ['EU 41', 'UK 7', 'US 8', '26.0'],
  ['EU 42', 'UK 8', 'US 9', '26.5'],
  ['EU 43', 'UK 9', 'US 10', '27.5'],
  ['EU 44', 'UK 10', 'US 11', '28.0'],
  ['EU 45', 'UK 11', 'US 12', '29.0'],
];

/**
 * Shows ONLY the selected colourway's photos. Re-mounted (key) when the colour changes,
 * so it always starts on that colourway's first photo.
 */
function Gallery({ p, ci }: { p: Product; ci: number }) {
  const c = p.colors[ci];
  const imgs = c.images;
  const [gi, setGi] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const many = imgs.length > 1;
  const go = (d: number) => setGi((g) => (g + d + imgs.length) % imgs.length);

  return (
    <div className="lg:sticky lg:top-24">
      <div
        className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-surface sm:rounded-xl"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <motion.div
          className="absolute inset-0 touch-pan-y"
          drag={many ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div key={imgs[gi]} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Image
                src={imgs[gi]}
                alt={`${titleOf(p)} in ${c.name}, photo ${gi + 1} of ${imgs.length}`}
                fill
                priority={gi === 0}
                sizes="(min-width: 1024px) 55vw, 100vw"
                draggable={false}
                className="pointer-events-none object-cover transition-transform duration-200 ease-out select-none"
                style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {pctOff(p) > 0 && <span className="absolute top-4 left-4 rounded-md bg-white px-2.5 py-1 text-[12px] font-bold text-ink">−{pctOff(p)}%</span>}

        {many && (
          <>
            <span className="absolute top-4 right-4 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-semibold text-white tabular-nums backdrop-blur">
              {gi + 1} / {imgs.length}
            </span>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow transition group-hover:opacity-100 lg:grid">
              <ChevronRight className="size-5 rotate-180" />
            </button>
            <button onClick={() => go(1)} aria-label="Next photo" className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow transition group-hover:opacity-100 lg:grid">
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
              {imgs.map((src, i) => (
                <button key={src} onClick={() => setGi(i)} aria-label={`Photo ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === gi ? 'w-5 bg-white' : 'w-1.5 bg-white/45'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {many && (
        <div className="mt-3 hidden gap-3 lg:flex">
          {imgs.map((src, i) => (
            <button
              key={src}
              onClick={() => setGi(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative aspect-square w-20 overflow-hidden rounded-lg transition ${i === gi ? 'ring-2 ring-white' : 'opacity-60 ring-1 ring-white/10 hover:opacity-100'}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Accordion({ title, children, open: init = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(init);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold text-white">
        {title}
        <ChevronDown className={`size-5 text-white/60 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
            <div className="pb-5 text-[14px] leading-relaxed text-white/65">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SizeGuide({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[85] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <motion.div role="dialog" aria-label="Size guide" initial={{ y: 20 }} animate={{ y: 0 }} className="relative w-full max-w-md rounded-xl border border-white/10 bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[16px] font-bold text-white">Size guide</p>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-white/10"><X className="size-5 text-white" /></button>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="text-white/45"><tr>{['EU', 'UK', 'US', 'Foot (cm)'].map((h) => <th key={h} className="pb-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="text-white">
            {SIZE_CHART.map((r) => (
              <tr key={r[0]} className="border-t border-white/10">{r.map((c, i) => <td key={i} className="py-2.5 tabular-nums">{c.replace(/^(EU|UK|US) /, '')}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[12px] text-white/50">Between sizes? Go half a size up for chunky runners. Not sure — ask us on WhatsApp.</p>
      </motion.div>
    </motion.div>
  );
}

export default function ProductDetail({ p }: { p: Product }) {
  const params = useSearchParams();
  // start on the colourway named in ?color= (shared links, refresh), else the first one
  const [ci, setColorIndex] = useState(() => {
    const want = params.get('color');
    const i = want ? p.colors.findIndex((c) => colorSlug(c.name) === want) : -1;
    return i < 0 ? 0 : i;
  });
  /** Select a colourway and reflect it in the URL straight away (replace: Back still leaves the page). */
  const setCi = (i: number) => {
    setColorIndex(i);
    const url = new URL(window.location.href);
    if (i === 0) url.searchParams.delete('color');
    else url.searchParams.set('color', colorSlug(p.colors[i].name));
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  };
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [ship, setShip] = useState<ShipId>('fast');
  const [err, setErr] = useState(false);
  const [guide, setGuide] = useState(false);
  const [order, setOrder] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [copied, setCopied] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { add } = useCart();
  const c = p.colors[ci];
  const title = titleOf(p);
  const cat = catInfo(p.cat);
  const off = pctOff(p);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const needSize = () => {
    if (size) return false;
    setErr(true);
    document.getElementById('size-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  };
  const addToBag = () => {
    if (needSize()) return;
    add({ handle: p.handle, name: title, color: c.name, size: size!, price: p.price, image: c.image }, qty);
  };
  const orderNow = () => {
    if (needSize()) return;
    setOrder(true);
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-[1400px] sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-4 py-4 text-[12px] text-white/50 sm:px-0 sm:text-[13px]">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="size-3.5" />
          {cat && <><Link href={`/shop/${cat.slug}`} className="hover:text-white">{cat.name}</Link><ChevronRight className="size-3.5" /></>}
          <span className="truncate text-white/80">{p.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Gallery key={p.colors[ci].name} p={p} ci={ci} />
          </div>

          <div className="px-4 sm:px-0 lg:col-span-5">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-white/50 uppercase">{p.brand}</p>
            <h1 className="mt-2 font-semiwide text-[26px] leading-tight font-extrabold text-white sm:text-[34px]">{p.name}</h1>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-[22px] font-semibold text-white tabular-nums">{inr(p.price)}</p>
              {p.was && <s className="text-[15px] text-white/40 tabular-nums">{inr(p.was)}</s>}
              {off > 0 && <span className="rounded-md bg-white px-2 py-0.5 text-[12px] font-bold text-ink">Save {off}%</span>}
            </div>
            <p className="mt-1 text-[12px] text-white/45">Inclusive of all taxes · Cash on delivery available</p>

            {/* colour */}
            <div className="mt-7">
              <p className="mb-3 text-[13px] text-white/60">Colour: <span className="font-semibold text-white">{c.name}</span></p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
                {p.colors.map((cl, i) => (
                  <button
                    key={cl.name}
                    role="radio"
                    aria-checked={i === ci}
                    aria-label={cl.name}
                    title={cl.name}
                    onClick={() => setCi(i)}
                    className={`relative size-14 overflow-hidden rounded-xl transition sm:size-16 ${i === ci ? 'ring-2 ring-white ring-offset-2 ring-offset-ink' : 'ring-1 ring-white/15 hover:ring-white/40'}`}
                  >
                    <Image src={cl.image} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* size */}
            <motion.div id="size-picker" className="mt-7" animate={err && !size ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] text-white/60">Size: <span className="font-semibold text-white">{size ?? 'Select'}</span></p>
                <button onClick={() => setGuide(true)} className="flex items-center gap-1.5 text-[13px] text-white/70 underline-offset-4 hover:text-white hover:underline">
                  <Ruler className="size-4" /> Size guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Size">
                {p.sizes.map((s) => {
                  const out = p.soldOut?.includes(s);
                  const on = size === s;
                  return (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={on}
                      disabled={out}
                      onClick={() => { setSize(s); setErr(false); }}
                      className={`h-12 rounded-xl border text-[14px] font-semibold tabular-nums transition ${
                        on ? 'border-white bg-white text-ink' : 'border-white/15 text-white hover:border-white/50'
                      } disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/20 disabled:line-through`}
                    >
                      {s.replace(/^(EU|UK) /, '')}
                    </button>
                  );
                })}
              </div>
              {err && !size && <p className="mt-2 text-[13px] text-red-300">Please select a size</p>}
              <p className="mt-2 text-[12px] text-white/45">Sizes in {p.sizes[0].split(' ')[0]}. Crossed-out sizes are sold out.</p>
            </motion.div>

            {/* qty */}
            <div className="mt-7 flex items-center gap-4">
              <p className="text-[13px] text-white/60">Quantity</p>
              <div className="flex h-11 items-center rounded-full border border-white/15">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="grid size-11 place-items-center text-white disabled:opacity-30" disabled={qty <= 1}><Minus className="size-4" /></button>
                <span className="w-8 text-center text-[14px] font-semibold text-white tabular-nums" aria-live="polite">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase quantity" className="grid size-11 place-items-center text-white"><Plus className="size-4" /></button>
              </div>
            </div>

            {/* delivery */}
            <fieldset className="mt-7">
              <legend className="mb-3 text-[13px] text-white/60">Delivery</legend>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SHIPPING) as ShipId[]).map((id) => {
                  const s = SHIPPING[id];
                  const on = ship === id;
                  return (
                    <label key={id} className={`relative cursor-pointer rounded-xl border p-3.5 transition ${on ? 'border-white bg-white/[0.05]' : 'border-white/15 hover:border-white/35'}`}>
                      <input type="radio" name="pdp-ship" className="sr-only" checked={on} onChange={() => setShip(id)} />
                      {id === 'fast' && <span className="absolute -top-2 left-3 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold tracking-wider text-ink uppercase">Recommended</span>}
                      <p className="text-[13px] font-semibold text-white">{s.label}</p>
                      <p className="mt-0.5 text-[12px] text-white/55">{s.days.join('–')} days · {s.fee ? `${inr(s.fee)} extra` : 'Free'}</p>
                      {on && <Check className="absolute top-3.5 right-3 size-4 text-white" />}
                    </label>
                  );
                })}
              </div>
              <p className="mt-2.5 flex items-center gap-2 text-[13px] text-white/70"><Truck className="size-4" /> Arrives {deliveryWindow(ship)}</p>
            </fieldset>

            {/* CTAs */}
            <div ref={ctaRef} className="mt-7 space-y-2.5">
              <button onClick={addToBag} className="flex h-14 w-full items-center justify-center rounded-full bg-white text-[15px] font-bold text-ink transition hover:bg-white/90">
                Add to bag · {inr(p.price * qty)}
              </button>
              <button onClick={orderNow} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-wa text-[15px] font-bold text-white transition hover:brightness-110">
                <WhatsAppIcon /> Order on WhatsApp
              </button>
              <div className="flex items-center justify-between pt-1 text-[13px]">
                <a href={waLink(`Hi! I have a question about the ${title} (${c.name}).`)} target="_blank" rel="noopener" className="text-white/70 underline-offset-4 hover:text-white hover:underline">
                  Need help? Chat with us
                </a>
                <button onClick={share} className="flex items-center gap-1.5 text-white/70 hover:text-white">
                  <Share2 className="size-4" /> {copied ? 'Link copied' : 'Share'}
                </button>
              </div>
            </div>

            <ul className="mt-7 grid grid-cols-3 gap-2 rounded-lg border border-white/10 p-4 text-center text-[12px] text-white/70">
              <li className="flex flex-col items-center gap-1.5"><Banknote className="size-5 text-white" strokeWidth={1.6} />Cash on delivery</li>
              <li className="flex flex-col items-center gap-1.5"><Truck className="size-5 text-white" strokeWidth={1.6} />Tracking on dispatch</li>
              <li className="flex flex-col items-center gap-1.5"><Package className="size-5 text-white" strokeWidth={1.6} />Branded + safety box</li>
            </ul>

            <div className="mt-6 border-t border-white/10">
              <Accordion title="Product details" open>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li>Premium quality build</li>
                  <li>Colourway: {c.name}</li>
                  <li>Available in {p.sizes[0].replace(/ \d+$/, '')} {p.sizes[0].split(' ')[1]}–{p.sizes[p.sizes.length - 1].split(' ')[1]}</li>
                  <li>Ships in a branded box with an extra safety box</li>
                </ul>
              </Accordion>
              <Accordion title="Shipping & delivery">
                Fast delivery reaches you in {SHIPPING.fast.days.join('–')} days for {inr(SHIPPING.fast.fee)}. Standard delivery takes {SHIPPING.standard.days.join('–')} days and is free. You get tracking updates as soon as your pair is dispatched.
              </Accordion>
              <Accordion title="Payment">
                Pay in cash when your order arrives, or pay by UPI. Orders are confirmed on WhatsApp before dispatch.
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-14">
        <SectionHead title="You may also like" />
        <ProductRail items={related(p, 8)} />
      </section>

      {/* mobile sticky buy bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-white/10 bg-ink/95 px-4 py-3 backdrop-blur lg:hidden"
          >
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg"><Image src={c.image} alt="" fill sizes="44px" className="object-cover" /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{p.name}</p>
              <p className="text-[12px] text-white/55">{size ?? 'Select size'} · {inr(p.price)}</p>
            </div>
            <button onClick={addToBag} className="h-11 shrink-0 rounded-full bg-white px-5 text-[14px] font-bold text-ink">Add to bag</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{guide && <SizeGuide onClose={() => setGuide(false)} />}</AnimatePresence>
      <OrderSheet
        open={order}
        onClose={() => setOrder(false)}
        items={size ? [{ name: title, color: c.name, size, qty, price: p.price, image: c.image }] : []}
        ship={ship}
        onShip={setShip}
      />
    </>
  );
}
