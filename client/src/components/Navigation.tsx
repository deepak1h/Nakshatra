import { useState } from "react";
import { Star, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems, setIsCartOpen } = useCart();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="floating-nav fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Star className="text-accent text-2xl" />
          <span className="text-2xl font-serif font-bold text-accent">Nakshatra</span>
          <span className="text-sm text-muted-foreground hidden sm:block">Your Celestial Blueprint</span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('home')}
            className="text-foreground hover:text-accent transition-colors"
            data-testid="nav-home"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('kundali')}
            className="text-foreground hover:text-accent transition-colors"
            data-testid="nav-kundali"
          >
            Order Kundali
          </button>
          <button 
            onClick={() => scrollToSection('store')}
            className="text-foreground hover:text-accent transition-colors"
            data-testid="nav-store"
          >
            Celestial Store
          </button>
          <button 
            onClick={() => scrollToSection('astroai')}
            className="text-foreground hover:text-accent transition-colors"
            data-testid="nav-astroai"
          >
            AstroAI Chat
          </button>
          <button 
            onClick={() => scrollToSection('journey')}
            className="text-foreground hover:text-accent transition-colors"
            data-testid="nav-journey"
          >
            My Journey
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="text-foreground hover:text-accent transition-colors"
            data-testid="nav-contact"
          >
            Contact
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="relative"
            onClick={() => setIsCartOpen(true)}
            data-testid="button-cart"
          >
            <ShoppingCart className="text-xl text-foreground hover:text-accent transition-colors" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          <button className="text-foreground hover:text-accent transition-colors" data-testid="button-user">
            <User className="text-xl" />
          </button>
          <button 
            className="lg:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-card border border-border rounded-b-lg mt-2 mx-6 p-6 space-y-4">
          <button 
            onClick={() => scrollToSection('home')}
            className="block text-foreground hover:text-accent transition-colors"
            data-testid="mobile-nav-home"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('kundali')}
            className="block text-foreground hover:text-accent transition-colors"
            data-testid="mobile-nav-kundali"
          >
            Order Kundali
          </button>
          <button 
            onClick={() => scrollToSection('store')}
            className="block text-foreground hover:text-accent transition-colors"
            data-testid="mobile-nav-store"
          >
            Celestial Store
          </button>
          <button 
            onClick={() => scrollToSection('astroai')}
            className="block text-foreground hover:text-accent transition-colors"
            data-testid="mobile-nav-astroai"
          >
            AstroAI Chat
          </button>
          <button 
            onClick={() => scrollToSection('journey')}
            className="block text-foreground hover:text-accent transition-colors"
            data-testid="mobile-nav-journey"
          >
            My Journey
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="block text-foreground hover:text-accent transition-colors"
            data-testid="mobile-nav-contact"
          >
            Contact
          </button>
        </div>
      )}
    </nav>
  );
}
