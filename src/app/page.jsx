import { HeroSection } from "@/features/home/components/hero-section";
import { FeatureSection } from "@/features/home/components/feature-section";
import { TestimonialSection } from "@/features/home/components/testimonial-section";
import { FaqSection } from "@/features/home/components/faq-section";
import { PricingSection } from "@/features/home/components/pricing-section";
import { Footer } from "@/features/home/components/footer";
import { Header } from "@/features/home/components/header";
import { GeometricBackground } from "@/components/ui/geometric-background";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative bg-background">
      <GeometricBackground />
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />
      <Header />
      <HeroSection />
      <div id="features">
        <FeatureSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="testimonials">
        <TestimonialSection />
      </div>
      <div id="faq" className="relative z-10">
        <FaqSection />
      </div>
      <Footer />
    </div>
  );
}
