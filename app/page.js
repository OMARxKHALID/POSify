"use client";
import { HeroSection } from "@/components/home/hero-section";
import { FeatureSection } from "@/components/home/feature-section";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { FaqSection } from "@/components/home/faq-section";
import { PricingSection } from "@/components/home/pricing-section";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000",
        }}
      />
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
      <div id="faq">
        <FaqSection />
      </div>
      <Footer />
    </div>
  );
}
