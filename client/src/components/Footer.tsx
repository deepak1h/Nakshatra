import { Star, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export default function Footer() {
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
    <footer className="bg-cosmic-navy border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Star className="text-accent text-2xl" />
              <span className="text-2xl font-serif font-bold text-accent">Nakshatra</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Your trusted guide to cosmic wisdom, offering personalized astrological insights and sacred tools for spiritual growth.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" data-testid="footer-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" data-testid="footer-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" data-testid="footer-youtube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" data-testid="footer-twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('kundali')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-birth-chart"
                >
                  Birth Chart Analysis
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('kundali')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-predictions"
                >
                  Life Predictions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('kundali')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-compatibility"
                >
                  Marriage Compatibility
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('astroai')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-ai-consultations"
                >
                  AI Consultations
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-personal-sessions"
                >
                  Personal Sessions
                </button>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Sacred Collection</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('store')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-gemstone-rings"
                >
                  Gemstone Rings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('store')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-healing-crystals"
                >
                  Healing Crystals
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('store')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-sacred-yantras"
                >
                  Sacred Yantras
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('store')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-astrology-books"
                >
                  Astrology Books
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('store')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-spiritual-accessories"
                >
                  Spiritual Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-accent transition-colors text-left"
                  data-testid="footer-contact-us"
                >
                  Contact Us
                </button>
              </li>
              <li><a href="#" className="hover:text-accent transition-colors" data-testid="footer-faq">FAQ</a></li>
              <li><a href="/admin" className="hover:text-accent transition-colors" data-testid="footer-admin-portal">Admin Portal</a></li>
              <li><a href="#" className="hover:text-accent transition-colors" data-testid="footer-returns">Returns</a></li>
              <li><a href="#" className="hover:text-accent transition-colors" data-testid="footer-privacy">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors" data-testid="footer-terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-muted-foreground text-sm">
            © 2024 Nakshatra. All rights reserved. Made with cosmic love ✨
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-accent text-sm transition-colors" data-testid="footer-privacy-link">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-accent text-sm transition-colors" data-testid="footer-terms-link">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-accent text-sm transition-colors" data-testid="footer-cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
