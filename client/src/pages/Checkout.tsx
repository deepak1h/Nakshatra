import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";



export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // --- STATE FOR FORM INPUTS ---
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");


  const createOrderMutation = useMutation({
    mutationFn: (orderData: {
      name: string; mobileNumber: string; addressLine1: string; addressLine2: string;
      landmark: string; pincode: string; city: string; state: string; country: string;
    }) => api.createOrder(orderData),
    onSuccess: () => {
      toast({
        title: "Order Placed! 🚀",
        description: "Your cosmic order is on its way.",
      });
      clearCart(); // Clear local cart state for instant UI update
      queryClient.invalidateQueries({ queryKey: ["userCart"] }); // Refetch db cart to confirm it's empty
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "There was an issue placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    // Basic validation
    if (!name || !mobileNumber || !addressLine1 || !pincode || !city || !state || !country) {
      toast({
        title: "Incomplete Details",
        description: "Please fill out all shipping information fields.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({ name, mobileNumber, addressLine1, addressLine2, 
      landmark, pincode, city, state, country});
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Please log in</h1>
        <p>You need to be logged in to proceed to checkout.</p>
        <Button onClick={() => setLocation('/login')} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-12">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
              {/* --- BIND INPUTS TO STATE --- */}
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input id="mobile" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address1">Address Line 1 *</Label>
                  <Input id="address1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="House No, Building, Street" />
                </div>
                <div>
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input id="address2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" />
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input id="landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near Cosmic Tower (optional)" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" value={country || "India"} readOnly onChange={(e) => setCountry(e.target.value)} />
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {/* ... The order summary part is fine, no changes needed ... */}
              <div className="space-y-4">
                {cartItems && cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₹{getCartTotal().toFixed(2)}</p>
              </div>
              
              {/* --- UPDATE THE BUTTON --- */}
              <Button 
                onClick={handlePlaceOrder} 
                className="w-full mt-6 cosmic-glow"
                disabled={createOrderMutation.isPending || cartItems.length === 0}
              >
                {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}