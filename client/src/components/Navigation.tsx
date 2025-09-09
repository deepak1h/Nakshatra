import { useState } from "react";
import { Star, ShoppingCart, User, Menu, X, LogIn, UserCircle, Settings } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

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
          <Link href="/checkout">
            <a className="relative" data-testid="button-cart">
              <ShoppingCart className="text-xl text-foreground hover:text-accent transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </a>
          </Link>
          {/* User Authentication */}
          {isLoading ? (
            <div className="w-8 h-8 animate-pulse bg-accent/20 rounded-full" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                  data-testid="button-user-menu"
                >
                  <UserCircle className="h-6 w-6 text-foreground hover:text-accent" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 cosmic-bg border-cosmic-purple/30" align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-cosmic-gold/70">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:text-red-300">
                  <LogIn className="mr-2 h-4 w-4 rotate-180" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthModal>
              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                data-testid="button-login"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </AuthModal>
          )}
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
          
          {/* Mobile User Authentication */}
          <div className="border-t border-border pt-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <p className="text-sm font-medium text-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <Link href="/dashboard">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left block text-foreground hover:text-accent transition-colors"
                  >
                    Dashboard
                  </button>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left block text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <AuthModal>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login / Register
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
