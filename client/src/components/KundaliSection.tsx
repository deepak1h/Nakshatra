import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface KundaliFormData {
  fullName: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  fatherName: string;
  kundaliType: string;
}

const kundaliTypes = [
  { value: "basic", name: "Basic Kundali Report", description: "Traditional birth chart analysis", price: 999 },
  { value: "detailed", name: "Detailed Life Reading", description: "Comprehensive analysis with predictions", price: 2499 },
  { value: "compatibility", name: "Marriage Compatibility", description: "Partner matching and compatibility analysis", price: 1799 },
  { value: "career", name: "Career & Finance Forecast", description: "Professional and financial guidance", price: 1999 },
  { value: "yearly", name: "Yearly Prediction", description: "Complete year ahead forecast", price: 1299 },
];

export default function KundaliSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<KundaliFormData>({
    fullName: "",
    gender: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    fatherName: "",
    kundaliType: "",
  });

  const selectedType = kundaliTypes.find(type => type.value === formData.kundaliType);

  const createKundaliMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/kundali", data);
    },
    onSuccess: () => {
      toast({
        title: "Kundali Order Placed! 🌟",
        description: "Your cosmic blueprint request has been received. You'll receive confirmation via email.",
      });
      // Reset form
      setFormData({
        fullName: "",
        gender: "",
        birthDate: "",
        birthTime: "",
        birthPlace: "",
        fatherName: "",
        kundaliType: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "Failed to place your Kundali order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.gender || !formData.birthDate || !formData.birthTime || !formData.birthPlace || !formData.kundaliType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      ...formData,
      birthDate: new Date(formData.birthDate).toISOString(),
      price: selectedType?.price.toString() || "0",
    };

    createKundaliMutation.mutate(requestData);
  };

  const handleGetQuote = () => {
    if (!selectedType) {
      toast({
        title: "Select Kundali Type",
        description: "Please select a Kundali type to get your quote.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `📊 Quote Summary`,
      description: `${selectedType.name} - ₹${selectedType.price}\n\n✨ Includes detailed analysis and PDF report delivery within 3-5 business days.`,
    });
  };

  return (
    <section id="kundali" className="py-20 px-6 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Unlock Your Celestial Blueprint</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the cosmic influences that shape your destiny through detailed Vedic astrology analysis.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Kundali Form */}
          <Card className="cosmic-border">
            <CardHeader>
              <CardTitle className="star-pattern">Birth Details Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      data-testid="input-fullname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger data-testid="select-gender">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other/Prefer Not To Say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthDate">Birth Date *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      required
                      data-testid="input-birthdate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthTime">Birth Time *</Label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={formData.birthTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                      required
                      data-testid="input-birthtime"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birthPlace">Birth Place *</Label>
                  <Input
                    id="birthPlace"
                    type="text"
                    placeholder="City, State, Country"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                    required
                    data-testid="input-birthplace"
                  />
                </div>

                <div>
                  <Label htmlFor="fatherName">Father's Name (Optional)</Label>
                  <Input
                    id="fatherName"
                    type="text"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                    data-testid="input-fathername"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-4 block">Select Kundali Type *</Label>
                  <div className="space-y-3">
                    {kundaliTypes.map((type) => (
                      <div 
                        key={type.value} 
                        className="flex items-center p-4 border border-border rounded-lg hover:border-accent transition-colors cursor-pointer"
                        onClick={() => setFormData(prev => ({ ...prev, kundaliType: type.value }))}
                      >
                        <input
                          type="radio"
                          name="kundaliType"
                          value={type.value}
                          checked={formData.kundaliType === type.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, kundaliType: e.target.value }))}
                          className="mr-3 accent-accent"
                          data-testid={`radio-kundali-${type.value}`}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                        <div className="text-accent font-semibold">₹{type.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full"
                    onClick={handleGetQuote}
                    data-testid="button-get-quote"
                  >
                    Get Quote & Preview
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full cosmic-glow"
                    disabled={createKundaliMutation.isPending}
                    data-testid="button-checkout"
                  >
                    {createKundaliMutation.isPending ? "Processing..." : "Proceed to Secure Checkout"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information Panel */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-serif font-semibold mb-4 star-pattern">What is a Kundali?</h3>
                <p className="text-muted-foreground mb-4">
                  A Kundali, also known as a birth chart or horoscope, is a cosmic map of the planetary positions at the exact time and place of your birth. It reveals your unique cosmic blueprint and provides insights into:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <Star className="text-accent mr-2 w-4 h-4" /> 
                    Personality traits and characteristics
                  </li>
                  <li className="flex items-center">
                    <Star className="text-accent mr-2 w-4 h-4" /> 
                    Career and financial prospects
                  </li>
                  <li className="flex items-center">
                    <Star className="text-accent mr-2 w-4 h-4" /> 
                    Relationship compatibility
                  </li>
                  <li className="flex items-center">
                    <Star className="text-accent mr-2 w-4 h-4" /> 
                    Health and wellness guidance
                  </li>
                  <li className="flex items-center">
                    <Star className="text-accent mr-2 w-4 h-4" /> 
                    Favorable and challenging periods
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Testimonial */}
            <Card className="bg-gradient-to-r from-secondary/20 to-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
                    alt="Customer testimonial" 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-medium">Priya Sharma</div>
                    <div className="text-sm text-muted-foreground">Mumbai, India</div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "The detailed life reading from Nakshatra was incredibly accurate and insightful. It helped me understand my strengths and navigate challenging times with confidence."
                </p>
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-accent w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
