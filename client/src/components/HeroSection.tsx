import { ChartPie, Gem, Bot } from "lucide-react";

export default function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20">
      {/* Cosmic background */}
      <div className="absolute inset-0 hero-cosmic"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200')"
        }}
      ></div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
          Nakshatra
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light">Your Celestial Blueprint</p>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
          Unlock the mysteries of your cosmic destiny through personalized astrology, curated celestial treasures, and AI-powered guidance from the stars.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={() => scrollToSection('kundali')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 cosmic-glow"
            data-testid="button-order-kundali"
          >
            Order Your Kundali
          </button>
          <button 
            onClick={() => scrollToSection('store')}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
            data-testid="button-shop-treasures"
          >
            Shop Celestial Treasures
          </button>
          <button 
            onClick={() => scrollToSection('astroai')}
            className="border border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            data-testid="button-chat-astroai"
          >
            Chat with AstroAI
          </button>
        </div>

        {/* Featured Services Preview */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-accent/50 transition-all">
            <ChartPie className="text-3xl text-accent mb-4 mx-auto" />
            <h3 className="text-xl font-serif font-semibold mb-2">Personalized Kundali</h3>
            <p className="text-muted-foreground">Detailed birth chart analysis revealing your cosmic blueprint and life path.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-accent/50 transition-all">
            <Gem className="text-3xl text-secondary mb-4 mx-auto" />
            <h3 className="text-xl font-serif font-semibold mb-2">Sacred Artifacts</h3>
            <p className="text-muted-foreground">Authentic gemstones, yantras, and mystical tools for spiritual enhancement.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-accent/50 transition-all">
            <Bot className="text-3xl text-accent mb-4 mx-auto" />
            <h3 className="text-xl font-serif font-semibold mb-2">AI Cosmic Guide</h3>
            <p className="text-muted-foreground">24/7 astrological insights powered by advanced AI and ancient wisdom.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
