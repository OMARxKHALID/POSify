import { HeroSection } from "@/components/home/hero-section";
import { FeatureSection } from "@/components/home/feature-section";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { FaqSection } from "@/components/home/faq-section";
import { PricingSection } from "@/components/home/pricing-section";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { GeometricBackground } from "@/components/ui/geometric-background";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative bg-background">
      {/* Geometric background */}
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

      {/* Footer spacer - ensures footer never overlaps content */}
      <div className="h-80 relative z-10" />

      <Footer />
    </div>
  );
}
