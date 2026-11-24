const BRANDS = ['Nike', 'Jordan', 'New Balance', 'Onitsuka Tiger', 'Converse', 'Crocs'];

/** Slow marquee of the brands the store carries. */
export default function BrandStrip() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-9 pr-9 sm:gap-14 sm:pr-14">
      {BRANDS.map((b) => (
        <li key={b} className="font-wide text-[17px] font-extrabold whitespace-nowrap text-white/30 uppercase sm:text-[28px]">
          {b}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Brands we carry" className="overflow-hidden border-y border-white/10 py-4 sm:py-6">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
        {row(true)}
      </div>
    </section>
  );
}
