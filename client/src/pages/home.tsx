import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import KundaliSection from "@/components/KundaliSection";
import CelestialStore from "@/components/CelestialStore";
import AstroAIChat from "@/components/AstroAIChat";
import JourneySection from "@/components/JourneySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <KundaliSection />
      <CelestialStore />
      <AstroAIChat />
      <JourneySection />
      <ContactSection />
      <Footer />
    </div>
  );
}
