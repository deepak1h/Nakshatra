import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { type UserAddress } from "@shared/schema";
import { Minus, Plus, Trash2, ArrowLeft, Pencil } from "lucide-react";

const initialFormState = {
  name: "", mobileNumber: "", addressLine1: "", addressLine2: "", landmark: "", pincode: "", city: "", state: "", country: "India"
};

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart, updateQuantity, removeFromCart, isUpdatingCart } = useCart();
  const { user, session } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({ ...initialFormState, name: user ? `${user.firstName} ${user.lastName}` : "" });

  const { data: savedAddresses = [] } = useQuery<UserAddress[]>({
    queryKey: ['userAddresses'],
    queryFn: () => api.getUserAddresses(session?.access_token ?? null),
    enabled: !!user,
  });

  useEffect(() => {
    // Redirect if cart becomes empty, but not immediately after a successful order
    if (cartItems.length === 0 && !createOrderMutation.isSuccess) {
      setLocation("/");
    }
  }, [cartItems, setLocation]);

  const handleAddressSelect = (addressId: string) => {
    if (addressId === 'new') {
      setFormState({ ...initialFormState, name: user ? `${user.firstName} ${user.lastName}` : "" });
      return;
    }
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setFormState({
        name: selectedAddress.name,
        mobileNumber: selectedAddress.mobileNumber,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 || "",
        landmark: selectedAddress.landmark || "",
        pincode: selectedAddress.pincode,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country,
      });
    }
  };

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => api.createOrder(orderData, session?.access_token ?? null),
    onSuccess: () => {
      toast({ title: "Order Placed! 🚀", description: "Your cosmic order is on its way." });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["userCart"] });
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => toast({ title: "Order Failed", description: error.message, variant: "destructive" }),
  });

  const handlePlaceOrder = () => {
    if (!formState.name || !formState.mobileNumber || !formState.addressLine1 || !formState.pincode || !formState.city || !formState.state) {
      toast({ title: "Incomplete Details", description: "Please fill out all required shipping fields.", variant: "destructive" });
      return;
    }
    createOrderMutation.mutate(formState);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  // --- COMPLETE & CORRECT PRICE CALCULATIONS ---
  
  // 1. Calculate the total original price (Total MRP)
  const subtotal = cartItems.reduce((acc, item) => {
    // Use the originalPrice if available, otherwise fall back to the final price
    const priceToUse = item.price;
    return acc + priceToUse * item.quantity;
  }, 0);
  
  // 2. The Selling Price is what getCartTotal already calculates
  const sellingPriceTotal = getCartTotal();

  // 3. The Discount is the difference
  const totalDiscount = subtotal - sellingPriceTotal;

  const freeShippingThreshold = 1000;
  const deliveryCharge = 40;
  const handlingFee = 20;
  // Fees are based on the final SELLING price, not the original price
  
  const isEligibleForFreeShipping = sellingPriceTotal >= freeShippingThreshold;
  const finalDeliveryCharge = isEligibleForFreeShipping ? 0 : deliveryCharge;
  const finalHandlingFee = isEligibleForFreeShipping ? 0 : handlingFee;
  // 4. The Grand Total is the Selling Price + Fees
  const grandTotal = sellingPriceTotal + finalDeliveryCharge + finalHandlingFee;

  if (!user) { /* ... return login prompt ... */ }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="mb-8">
        <Button variant="outline" onClick={() => setLocation("/")}><ArrowLeft className="w-4 h-4 mr-2" />Back to Store</Button>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Confirm Your Order</h1>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* --- SHIPPING FORM COLUMN --- */}
        <div>
          <Card id="shipping-info">
            <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.length > 0 && (
                <div>
                  <Label>Select a Saved Address</Label>
                  <Select onValueChange={handleAddressSelect}>
                    <SelectTrigger><SelectValue placeholder="Choose a saved address..." /></SelectTrigger>
                    <SelectContent>
                      {savedAddresses.map(addr => (
                        <SelectItem key={addr.id} value={addr.id}>{addr.name}, {addr.addressLine1}, {addr.city}</SelectItem>
                      ))}
                      <SelectItem value="new">--- Add a new address ---</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="name">Full Name *</Label><Input id="name" value={formState.name} onChange={handleInputChange} /></div>
                <div><Label htmlFor="mobileNumber">Mobile Number *</Label><Input id="mobileNumber" value={formState.mobileNumber} onChange={handleInputChange} /></div>
              </div>
              <div><Label htmlFor="addressLine1">Address Line 1 *</Label><Input id="addressLine1" value={formState.addressLine1} onChange={handleInputChange} placeholder="House No, Building, Street" /></div>
              <div><Label htmlFor="addressLine2">Address Line 2</Label><Input id="addressLine2" value={formState.addressLine2} onChange={handleInputChange} placeholder="Apartment, suite, etc. (optional)" /></div>
              <div><Label htmlFor="landmark">Landmark</Label><Input id="landmark" value={formState.landmark} onChange={handleInputChange} placeholder="Near Cosmic Tower (optional)" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label htmlFor="pincode">Pincode *</Label><Input id="pincode" value={formState.pincode} onChange={handleInputChange} /></div>
                <div><Label htmlFor="city">City *</Label><Input id="city" value={formState.city} onChange={handleInputChange} /></div>
                <div><Label htmlFor="state">State *</Label><Input id="state" value={formState.state} onChange={handleInputChange} /></div>
              </div>
              <div><Label htmlFor="country">Country *</Label><Input id="country" value={formState.country} readOnly /></div>
            </CardContent>
          </Card>
        </div>
        
        {/* --- SUMMARY COLUMN --- */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Shipping To</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('shipping-info')?.scrollIntoView({ behavior: 'smooth' })}><Pencil className="w-4 h-4 mr-2"/> Edit</Button>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{formState.name || "..."}</p>
              <p>{formState.addressLine1 || "..."}</p>
              {formState.addressLine2 && <p>{formState.addressLine2}</p>}
              <p>{formState.city || "..."}, {formState.state || "..."} - {formState.pincode || "..."}</p>
              <p>{formState.country}</p>
              <p className="mt-2">Mobile: {formState.mobileNumber || "..."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Price Details</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => {
                  const hasItemDiscount = item.originalPrice && item.originalPrice > item.price;
                  return (
                    <div key={item.productId} className="flex items-start space-x-4">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        {hasItemDiscount ? (
                          <div className="text-xs">
                            <span className="text-muted-foreground line-through">₹{item.originalPrice?.toFixed(2)}</span>
                            <span className="text-green-600 font-semibold ml-2">(-₹{(item.originalPrice! - item.price).toFixed(2)})</span>
                          </div>
                        ) : (<p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</p>)}
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive mt-1" onClick={() => removeFromCart(item.productId)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              {/* --- FINAL, CORRECTED PRICE BREAKDOWN --- */}
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal (MRP)</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-semibold">Discount</span>
                    <span className="font-semibold">- ₹{totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  {isEligibleForFreeShipping ? <span className="text-green-600 font-semibold">FREE</span> : <span className="font-medium">₹{deliveryCharge.toFixed(2)}</span>}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Handling Fee</span>
                  {isEligibleForFreeShipping ? <span className="text-muted-foreground line-through">₹{handlingFee.toFixed(2)}</span> : <span className="font-medium">₹{handlingFee.toFixed(2)}</span>}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <p>Grand Total</p>
                <p>₹{grandTotal.toFixed(2)}</p>
              </div>
              <Button onClick={handlePlaceOrder} className="w-full mt-6 cosmic-glow" disabled={createOrderMutation.isPending || cartItems.length === 0 || isUpdatingCart}>
                {createOrderMutation.isPending ? "Processing..." : `Pay ₹${grandTotal.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}