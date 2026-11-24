import Hero from '@/components/Hero';
import BrandStrip from '@/components/BrandStrip';
import Categories from '@/components/Categories';
import { Bestsellers, ShopByCollection } from '@/components/Collections';
import Reviews from '@/components/Reviews';
import { Newsletter, ShopAllBanner } from '@/components/Closing';

export default function Home() {
  return (
    <>
      <Hero />
      <BrandStrip />
      <Categories />
      <Bestsellers />
      <ShopByCollection />
      <Reviews />
      <ShopAllBanner />
      <Newsletter />
    </>
  );
}
