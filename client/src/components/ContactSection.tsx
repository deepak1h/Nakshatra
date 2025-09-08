import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent to the Stars! ✨",
        description: "We will respond within 24 hours with cosmic insights.",
      });
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    contactMutation.mutate(formData);
  };

  return (
    <section id="contact" className="py-20 px-6 bg-card/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Connect with the Cosmos</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to begin your celestial journey? Reach out to us for personalized guidance or any questions about our services.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="cosmic-border">
            <CardHeader>
              <CardTitle className="star-pattern">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Name *</Label>
                    <Input
                      id="contact-name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact-subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger data-testid="select-contact-subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kundali">Kundali Consultation</SelectItem>
                      <SelectItem value="products">Product Inquiry</SelectItem>
                      <SelectItem value="astroai">AstroAI Support</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contact-message">Message *</Label>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Share your cosmic questions or thoughts..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    data-testid="textarea-contact-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full cosmic-glow"
                  disabled={contactMutation.isPending}
                  data-testid="button-send-contact"
                >
                  {contactMutation.isPending ? "Sending to the Stars..." : "Send Message to the Stars"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="star-pattern">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <Mail className="text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Email Us</div>
                    <div className="text-muted-foreground">contact@nakshatra.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Phone className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium">Call Us</div>
                    <div className="text-muted-foreground">+91 98765 43210</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <MapPin className="text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Visit Us</div>
                    <div className="text-muted-foreground">
                      Sacred Wisdom Center<br />
                      Varanasi, Uttar Pradesh, India
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Clock className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium">Consultation Hours</div>
                    <div className="text-muted-foreground">
                      Mon-Sat: 9:00 AM - 8:00 PM IST<br />
                      Sun: 10:00 AM - 6:00 PM IST
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media & FAQ */}
            <Card>
              <CardContent className="p-8">
                <h4 className="text-xl font-serif font-semibold mb-4">Follow Our Cosmic Journey</h4>
                <div className="flex space-x-4 mb-6">
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
                    data-testid="link-facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
                    data-testid="link-instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
                    data-testid="link-youtube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
                    data-testid="link-twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-muted-foreground text-sm">
                  📅 Response time: Within 24 hours<br />
                  🌟 For urgent consultations, please call directly<br />
                  ✨ Join our newsletter for cosmic updates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
