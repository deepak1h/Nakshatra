import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, UserCart } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  productId: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getCartTotal: ()=> number;
  clearCart: ()=> void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast(); // 2. Initialize toast
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["userCart"], // Use a more descriptive query key
    queryFn: api.getUserCart, // Call the new function
    enabled: !!user,
    select: (data: (UserCart & { product: Product })[]) =>
      data.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: parseFloat(item.product.price),
        imageUrl: item.product.imageUrl || "",
        quantity: item.quantity,
      })),
  });

const addToCartMutation = useMutation({
    mutationFn: (item: { productId: string; quantity: number; name: string }) =>
      api.addToCart({ productId: item.productId, quantity: item.quantity }),
    onSuccess: (data, variables) => {
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

  // 3. Update the other mutations as well
  const removeFromCartMutation = useMutation({
    mutationFn: (productId: string) => api.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (item: { productId: string; quantity: number }) => api.updateCartQuantity(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCart"] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: api.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCart"] });
    },
  });



  const addToCart = (item: Omit<CartItem, 'quantity' | 'id'> & { quantity?: number }) => {
    if (!user) {
      toast({
        title: "Please log in to add items to cart.",
        description: "You need to be logged in to add items to your cart.",
        variant: "destructive",
      });
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
        name: item.name,
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

  const getCartTotal = ()=> {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = ()=> {
    if (!user) return;
    clearCartMutation.mutate();
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart: (item) => addToCart(item as any), // Casting to avoid type issues with `id`
      removeFromCart,
      updateQuantity,
      getCartTotal,
      clearCart,
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
