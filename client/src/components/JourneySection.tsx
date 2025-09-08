import { Star, Book, Laptop, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const timelineEvents = [
  {
    year: "1985 - 1995",
    title: "Early Awakening",
    description: "Born under a rare planetary alignment, I felt the cosmic call from childhood. My grandmother, a village astrologer, first introduced me to the language of the stars.",
    icon: Star,
    side: "left",
  },
  {
    year: "1995 - 2005",
    title: "Sacred Learning",
    description: "Studied at the ancient Kashi Vishwanath temple complex, learning from masters who preserved centuries-old astrological traditions and Sanskrit texts.",
    icon: Book,
    side: "right",
  },
  {
    year: "2005 - 2020",
    title: "Modern Integration",
    description: "Embraced technology to reach global seekers, developing innovative methods to blend traditional wisdom with contemporary accessibility.",
    icon: Laptop,
    side: "left",
  },
  {
    year: "2020 - Present",
    title: "Nakshatra Vision",
    description: "Founded Nakshatra to create a comprehensive platform where ancient wisdom meets cutting-edge AI, making cosmic guidance accessible to all.",
    icon: Rocket,
    side: "right",
  },
];

export default function JourneySection() {
  return (
    <section id="journey" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">The Stars Aligned: My Story</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A journey guided by celestial wisdom and a passion for unlocking cosmic mysteries.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600" 
              alt="Master Astrologer Portrait" 
              className="rounded-2xl shadow-2xl w-full object-cover aspect-square"
            />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-3xl font-serif font-semibold star-pattern">Master Raj Kumar</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              With over 25 years of experience in Vedic astrology, I have dedicated my life to helping souls discover their cosmic purpose. My journey began in the ancient temples of Varanasi, where I studied under renowned gurus and learned the sacred traditions passed down through generations.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, I blend ancient wisdom with modern technology to make astrological guidance accessible to seekers worldwide. Each consultation is a sacred dialogue between the cosmos and the soul, revealing the divine blueprint that guides our earthly journey.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-accent/20 px-4 py-2 rounded-full">
                <span className="text-accent font-medium">25+ Years Experience</span>
              </div>
              <div className="bg-secondary/20 px-4 py-2 rounded-full">
                <span className="text-secondary font-medium">10,000+ Consultations</span>
              </div>
              <div className="bg-accent/20 px-4 py-2 rounded-full">
                <span className="text-accent font-medium">Certified Master</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-accent to-secondary"></div>
          
          <div className="space-y-12">
            {timelineEvents.map((event, index) => {
              const IconComponent = event.icon;
              return (
                <div key={index} className="flex items-center">
                  {event.side === "left" ? (
                    <>
                      <div className="flex-1 pr-8 text-right">
                        <Card>
                          <CardContent className="p-6">
                            <h4 className="text-xl font-serif font-semibold mb-2">{event.title}</h4>
                            <p className="text-muted-foreground">{event.description}</p>
                            <div className="text-accent font-medium mt-2">{event.year}</div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="w-8 h-8 bg-accent rounded-full border-4 border-background flex items-center justify-center">
                        <IconComponent className="text-accent-foreground w-4 h-4" />
                      </div>
                      <div className="flex-1 pl-8"></div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 pr-8"></div>
                      <div className="w-8 h-8 bg-secondary rounded-full border-4 border-background flex items-center justify-center">
                        <IconComponent className="text-secondary-foreground w-4 h-4" />
                      </div>
                      <div className="flex-1 pl-8">
                        <Card>
                          <CardContent className="p-6">
                            <h4 className="text-xl font-serif font-semibold mb-2">{event.title}</h4>
                            <p className="text-muted-foreground">{event.description}</p>
                            <div className="text-secondary font-medium mt-2">{event.year}</div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-secondary/20 to-accent/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-serif font-semibold mb-6 star-pattern">My Philosophy</h3>
              <blockquote className="text-xl font-serif italic text-muted-foreground mb-6">
                "Every soul carries a cosmic blueprint written in the stars at the moment of birth. My role is not to predict fate, but to illuminate the path towards your highest potential."
              </blockquote>
              <p className="text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                I believe astrology is not about limiting beliefs or fearful predictions, but about understanding the cosmic energies that influence our lives and using that knowledge to make empowered choices. Each reading is an opportunity to connect with your authentic self and align with your soul's purpose.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
