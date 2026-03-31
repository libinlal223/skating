import HeroSection from '@/components/home/HeroSection';
import WhySmartWheels from '@/components/home/WhySmartWheels';
import BranchesSection from '@/components/home/BranchesSection';
import AchievementsCounter from '@/components/home/AchievementsCounter';
import GuinnessRecord from '@/components/home/GuinnessRecord';
import SkatingBanner from '@/components/home/SkatingBanner';
import MedalShowcase from '@/components/home/MedalShowcase';
import GalleryPreview from '@/components/home/GalleryPreview';
import Timeline from '@/components/home/Timeline';
import SkatingBanner2 from '@/components/home/SkatingBanner2';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhySmartWheels />
      <BranchesSection />
      <AchievementsCounter />
      <SkatingBanner />
      <GuinnessRecord />
      <MedalShowcase />
      <GalleryPreview />
      <SkatingBanner2 />
      <Timeline />
      <CTASection />
    </>
  );
}
