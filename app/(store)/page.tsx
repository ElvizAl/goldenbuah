import ContactSection from "@/shared/components/sections/contact-section";
import { FeaturedProductSection } from "@/shared/components/sections/featured-product-section";
import { HeroSection } from "@/shared/components/sections/hero-section";
import TestimonialSection from "@/shared/components/sections/testimonial-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedProductSection />
      <TestimonialSection />
      <ContactSection />
    </div>
  );
}
  