'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SectionHead } from './Reveal';

/**
 * Customer screenshots. Drop real screenshots into /public/reviews and set `screenshot`.
 * Until then each card renders a PLACEHOLDER chat mock-up from `chat` (not real customers).
 */
type Msg = { from: 'them' | 'us'; text?: string; image?: string; time: string };
type Review = { name: string; city: string; product: string; screenshot?: string; chat: Msg[] };

const REVIEWS: Review[] = [
  {
    name: 'Arjun', city: 'Kochi', product: 'Dunk Low Panda',
    chat: [
      { from: 'them', text: 'Got the parcel today', time: '7:12 pm' },
      { from: 'them', image: '/products/dunk-panda.jpg', time: '7:12 pm' },
      { from: 'them', text: 'Fits perfect. Box was packed really well 👌', time: '7:13 pm' },
      { from: 'us', text: 'Glad you like them! Enjoy 🙌', time: '7:20 pm' },
    ],
  },
  {
    name: 'Neha', city: 'Bengaluru', product: 'New Balance 530',
    chat: [
      { from: 'them', text: 'Hii received my 530s', time: '11:04 am' },
      { from: 'them', image: '/products/nb530-silver.jpg', time: '11:05 am' },
      { from: 'them', text: 'Came in 3 days. Super comfortable', time: '11:05 am' },
    ],
  },
  {
    name: 'Rahul', city: 'Pune', product: 'Air Jordan 1 High',
    chat: [
      { from: 'them', text: 'Bro the quality is top 🔥', time: '9:41 pm' },
      { from: 'them', image: '/products/jordan-1-obsidian.jpg', time: '9:41 pm' },
      { from: 'us', text: 'Thanks Rahul! Tag us when you wear them', time: '9:50 pm' },
      { from: 'them', text: 'Will do 💯', time: '9:51 pm' },
    ],
  },
  {
    name: 'Sana', city: 'Hyderabad', product: 'Classic Clog',
    chat: [
      { from: 'them', image: '/products/clog-bone.jpg', time: '4:18 pm' },
      { from: 'them', text: 'Ordering one more pair for my sister', time: '4:19 pm' },
      { from: 'us', text: 'Sure! Which size?', time: '4:22 pm' },
    ],
  },
  {
    name: 'Vishnu', city: 'Chennai', product: 'Nike P-6000',
    chat: [
      { from: 'them', text: 'Delivered ✅', time: '1:30 pm' },
      { from: 'them', image: '/products/p6000-silver.jpg', time: '1:30 pm' },
      { from: 'them', text: 'Exactly like the pics. Thanks', time: '1:31 pm' },
    ],
  },
  {
    name: 'Meera', city: 'Mumbai', product: 'Onitsuka Mexico 66',
    chat: [
      { from: 'them', text: 'Love love love these', time: '6:02 pm' },
      { from: 'them', image: '/products/mexico-66-beige.jpg', time: '6:02 pm' },
      { from: 'us', text: 'They look great on you!', time: '6:10 pm' },
    ],
  },
];

function ChatShot({ r }: { r: Review }) {
  return (
    <div className="flex h-full flex-col bg-[#0b141a] text-left">
      <div className="flex items-center gap-2.5 bg-[#1f2c34] px-3 pt-6 pb-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-[#6b7c85] text-[13px] font-bold text-white">{r.name[0]}</span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-white">{r.name}</p>
          <p className="text-[10px] text-white/55">online</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 overflow-hidden px-2.5 py-3">
        {r.chat.map((m, i) => (
          <div
            key={i}
            className={`max-w-[82%] rounded-lg px-2 py-1.5 text-[12px] leading-snug text-white ${
              m.from === 'them' ? 'self-start rounded-tl-none bg-[#202c33]' : 'self-end rounded-tr-none bg-[#005c4b]'
            }`}
          >
            {m.image && (
              <div className="relative mb-1 aspect-square w-40 overflow-hidden rounded-md">
                <Image src={m.image} alt="" fill sizes="160px" className="object-cover" />
              </div>
            )}
            {m.text && <span>{m.text}</span>}
            <span className="ml-2 inline-flex items-center gap-0.5 align-bottom text-[9px] text-white/50">
              {m.time}
              {m.from === 'us' && <CheckCheck className="size-3 text-[#53bdeb]" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Shot({ r }: { r: Review }) {
  return r.screenshot ? (
    <Image src={r.screenshot} alt={`Message from ${r.name}`} fill sizes="300px" className="object-cover object-top" />
  ) : (
    <ChatShot r={r} />
  );
}

export default function Reviews() {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const step = (d: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('figure');
    const w = card ? card.clientWidth + 16 : 300;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (d > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: d * w, behavior: 'smooth' });
  };

  useEffect(() => {
    if (paused || open !== null) return;
    const t = setInterval(() => step(1), 3500);
    return () => clearInterval(t);
  }, [paused, open]);

  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % REVIEWS.length));
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + REVIEWS.length) % REVIEWS.length));
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  return (
    <section className="overflow-hidden py-9 sm:py-11 lg:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <SectionHead
          title="Customer love"
          sub="Real messages from customers after their pair arrived."
          action={
            <div className="hidden gap-2 sm:flex">
              <button onClick={() => step(-1)} aria-label="Previous" className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white hover:text-ink">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => step(1)} aria-label="Next" className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white hover:text-ink">
                <ChevronRight className="size-5" />
              </button>
            </div>
          }
        />
      </div>

      <div
        ref={track}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:scroll-px-6 [scrollbar-width:none] sm:px-6 lg:px-[max(24px,calc((100vw-1400px)/2+24px))] [&::-webkit-scrollbar]:hidden"
      >
        {REVIEWS.map((r, i) => (
          <figure key={r.name} className="w-[58%] shrink-0 snap-start sm:w-[290px]">
            <button
              onClick={() => setOpen(i)}
              aria-label={`Open message from ${r.name}`}
              className="relative block aspect-[9/16] w-full overflow-hidden rounded-[18px] border-[5px] border-[#1c1c1c] bg-black shadow-2xl shadow-black/50 transition duration-500 hover:-translate-y-1.5"
            >
              <Shot r={r} />
            </button>
            <figcaption className="mt-3 flex flex-col gap-0.5 px-1 text-[12px] sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:text-[13px]">
              <span className="font-semibold text-white">
                {r.name} <span className="font-normal text-white/45">· {r.city}</span>
              </span>
              <span className="text-white/45">{r.product}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[75] grid place-items-center bg-black/85 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-label={`Message from ${REVIEWS[open].name}`}
          >
            <motion.div
              key={open}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-[9/16] h-[min(80vh,720px)] overflow-hidden rounded-[20px] border-[6px] border-[#1c1c1c] bg-black"
            >
              <Shot r={REVIEWS[open]} />
            </motion.div>
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="size-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
