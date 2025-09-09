import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import KundaliSection from "@/components/KundaliSection";
import CelestialStore from "@/components/CelestialStore";
import AstroAIChat from "@/components/AstroAIChat";
import JourneySection from "@/components/JourneySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { PromotionalBanners, SeedPromotionalBanners } from "@/components/PromotionalBanners";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Top promotional banners */}
      <div className="container mx-auto px-6 pt-20">
        <PromotionalBanners position="top" />
      </div>
      
      <HeroSection />
      
      {/* Main banner promotions */}
      <div className="container mx-auto px-6 py-8">
        <PromotionalBanners position="banner" />
      </div>
      
      <KundaliSection />
      <CelestialStore />
      <AstroAIChat />
      
      {/* Sidebar/bottom promotions */}
      <div className="container mx-auto px-6 py-8">
        <PromotionalBanners position="sidebar" />
      </div>
      
      <JourneySection />
      
      {/* Demo seed button for promotional banners */}
      <div className="container mx-auto px-6 py-8 text-center">
        <div className="cosmic-bg border border-cosmic-purple/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-cosmic-gold mb-4">
            🎯 Admin Demo: Load Sample Promotions
          </h3>
          <p className="text-cosmic-gold/80 mb-4">
            Click below to populate the promotional banners with sample offers and deals
          </p>
          <SeedPromotionalBanners />
        </div>
      </div>
      
      <ContactSection />
      <Footer />
    </div>
  );
}
