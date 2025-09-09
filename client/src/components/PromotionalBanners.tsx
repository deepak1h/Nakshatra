import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PromotionalBanner } from "@shared/schema";


interface PromotionalBannersProps {
  position?: string;
  className?: string;
}

export function PromotionalBanners({ position = "top", className = "" }: PromotionalBannersProps) {
  const [dismissedBanners, setDismissedBanners] = useState<string[]>(() => {
    const dismissed = localStorage.getItem('dismissedBanners');
    return dismissed ? JSON.parse(dismissed) : [];
  });

  const { data: banners = [], isLoading } = useQuery<PromotionalBanner[]>({
    queryKey: ["/api/promotional-banners", position],
    queryFn: async () => {
      const response = await fetch(`/api/promotional-banners?position=${position}`);
      if (!response.ok) {
        throw new Error('Failed to fetch promotional banners');
      }
      return response.json();
    },
  });

  const dismissBanner = (bannerId: string) => {
    const newDismissed = [...dismissedBanners, bannerId];
    setDismissedBanners(newDismissed);
    localStorage.setItem('dismissedBanners', JSON.stringify(newDismissed));
  };

  const visibleBanners = banners.filter(banner => !dismissedBanners.includes(banner.id));

  if (isLoading || visibleBanners.length === 0) {
    return null;
  }

  return (
    <div className={`promotional-banners ${className}`}>
      {visibleBanners.map((banner) => (
        <Card 
          key={banner.id} 
          className="cosmic-bg border-cosmic-purple/30 mb-4 overflow-hidden relative group hover:border-cosmic-gold/50 transition-all duration-300"
          data-testid={`banner-${banner.id}`}
        >
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-cosmic-gold hover:text-white hover:bg-cosmic-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => dismissBanner(banner.id)}
              data-testid={`button-dismiss-${banner.id}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <CardContent className="p-0">
            {banner.imageUrl && (
              <div className="relative h-32 md:h-24 overflow-hidden">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cosmic-navy/70 to-transparent" />
              </div>
            )}
            
            <div className={`p-4 ${banner.imageUrl ? 'absolute inset-0 flex flex-col justify-center' : ''}`}>
              <div className="flex items-start gap-3">
                <Gift className="w-6 h-6 text-cosmic-gold flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-2 leading-tight">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-cosmic-gold/90 text-sm mb-3 leading-relaxed">
                      {banner.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {banner.ctaText && banner.ctaLink && (
                      <Button 
                        size="sm" 
                        className="cosmic-glow text-xs px-4 py-2"
                        onClick={() => {
                          if (banner.ctaLink?.startsWith('/')) {
                            window.location.href = banner.ctaLink;
                          } else {
                            window.open(banner.ctaLink, '_blank');
                          }
                        }}
                        data-testid={`button-cta-${banner.id}`}
                      >
                        {banner.ctaText}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                    
                    {banner.discountCode && (
                      <div className="bg-cosmic-gold/20 border border-cosmic-gold/40 px-3 py-1 rounded-full">
                        <span className="text-cosmic-gold text-xs font-mono font-bold">
                          CODE: {banner.discountCode}
                        </span>
                      </div>
                    )}
                    
                    {banner.discountPercent && (
                      <div className="bg-cosmic-purple/30 border border-cosmic-purple/50 px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-bold">
                          {banner.discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {banner.validUntil && (
                    <p className="text-cosmic-gold/60 text-xs mt-2">
                      Valid until: {new Date(banner.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Component to seed promotional banners (for demo purposes)
export function SeedPromotionalBanners() {
  const [isLoading, setIsLoading] = useState(false);

  const seedBanners = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed-promotional-banners', {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error seeding banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={seedBanners}
      disabled={isLoading}
      className="cosmic-glow"
      data-testid="button-seed-banners"
    >
      {isLoading ? "Loading..." : "Load Sample Promotions"}
    </Button>
  );
}