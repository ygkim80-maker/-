import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { StatsBento } from "@/components/landing/StatsBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CategoryBento } from "@/components/landing/CategoryBento";
import { UrgentJobsCarousel } from "@/components/landing/UrgentJobsCarousel";
import { AudienceSplit } from "@/components/landing/AudienceSplit";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCta } from "@/components/landing/FinalCta";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <StatsBento />
        <HowItWorks />
        <CategoryBento />
        <UrgentJobsCarousel />
        <AudienceSplit />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
