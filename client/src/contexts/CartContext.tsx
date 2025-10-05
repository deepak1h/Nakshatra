import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, UserCart } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  productId: string;
  name: string;
  price: number;          // The FINAL price the user pays per item
  originalPrice?: number; // The price before discount
  imageUrl: string;         // The first image for display
  quantity: number;
}

type AddToCartItem = Omit<CartItem, 'quantity'> & { quantity?: number };

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: AddToCartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getCartTotal: () => number;
  clearCart: () => void;
  isUpdatingCart: boolean; // For showing loading states
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // This query fetches the raw cart data from the DB
  const { data: cartItems = [], isLoading: isCartLoading } = useQuery({
    queryKey: ["userCart"],
    queryFn: () => api.getUserCart(),
    enabled: !!user,

    // --- 2. THE CRITICAL FIX: Data Transformation ---
    // The `select` function transforms the raw DB data into the CartItem shape our app uses.
    select: (data: (UserCart & { product: Product })[]): CartItem[] =>
      data.map((item) => {
        // Safely parse prices
        const originalPrice = parseFloat(item.product.price);
        const discountedPrice = item.product.discountedPrice ? parseFloat(item.product.discountedPrice) : null;
        
        // Determine the final price
        const finalPrice = (discountedPrice && discountedPrice > 0) ? discountedPrice : originalPrice;

        return {
          productId: item.productId,
          name: item.product.name,
          price: finalPrice,
          originalPrice: originalPrice,
          // Get the first image from the new `imageUrls` array
          imageUrl: item.product.imageUrls?.[0] || "/placeholder.svg",
          quantity: item.quantity,
        };
      }),
  });

const addToCartMutation = useMutation({
    mutationFn: (item: { productId: string; quantity: number }) =>
      api.addToCart(item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userCart"] });
      toast({
        title: "Added to Cart! ✨",
        description: `${variables.name} has been added to your cosmic collection.`,
      });
    },
    onError: (error: Error) => {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Something went wrong.",
        description: error.message || "Could not add item to cart.",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: string) => api.removeFromCart(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userCart"] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (item: { productId: string; quantity: number }) => api.updateCartQuantity(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userCart"] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: () => api.clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userCart"] }),
  });

  // --- 3. UPDATED addToCart function signature ---
  const addToCart = (item: AddToCartItem) => {
    if (!user) {
      toast({ title: "Please log in to add items to cart.", variant: "destructive" });
      return;
    }

    const existingItem = cartItems.find(cartItem => cartItem.productId === item.productId);
     
    if (existingItem) {
      updateQuantityMutation.mutate({
        productId: existingItem.productId,
        quantity: existingItem.quantity + (item.quantity || 1),
      });
    } else {
      addToCartMutation.mutate({
        productId: item.productId,
        quantity: item.quantity || 1,
      });
    }
  };
  
  const removeFromCart = (productId: string) => {
    if (!user) return;
    removeFromCartMutation.mutate(productId);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantityMutation.mutate({ productId, quantity });
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    if (!user) return;
    clearCartMutation.mutate();
  };

  const isUpdatingCart = 
    addToCartMutation.isPending || 
    removeFromCartMutation.isPending || 
    updateQuantityMutation.isPending || 
    clearCartMutation.isPending;

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartTotal,
      clearCart,
      isUpdatingCart, // Provide loading state to components
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(){
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}