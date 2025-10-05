import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";
import { Heart, Search  } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";

const categories = [
  { id: "all", name: "All Products" },
  { id: "rings", name: "Rings" },
  { id: "stones", name: "Gemstones" },
  { id: "yantras", name: "Yantras" },
  { id: "books", name: "Books" },
  { id: "accessories", name: "Accessories" },
];

export default function CelestialStore() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory === "all" ? "" : `?category=${selectedCategory}`],
  });

  const { data: likedProducts = [] } = useQuery<Product[]>({
    queryKey: ["likedProducts"], // Using a cleaner key
    queryFn: api.getLikedProducts, // Use the new function here
    enabled: !!user,
  });
  const likedProductIds = new Set((likedProducts || []).map((p) => p.id));


   const likeMutation = useMutation({
    mutationFn: (productId: string) => api.likeProduct(productId), // Use the new function
    onSuccess: () => {
      // Invalidate with the same key used in useQuery
      queryClient.invalidateQueries({ queryKey: ["likedProducts"] });
      toast({
        title: "Added to Favorites! ❤️",
        description: "This item has been added to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Oops! Something went wrong.",
        description: "Could not add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // 3. Update the unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: (productId: string) => api.unlikeProduct(productId), // Use the new function
    onSuccess: () => {
      // Invalidate with the same key used in useQuery
      queryClient.invalidateQueries({ queryKey: ["likedProducts"] });
      toast({
        title: "Removed from Favorites",
        description: "This item has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Oops! Something went wrong.",
        description: "Could not remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // This handleLike function does not need any changes
  const handleLike = (product: Product) => {
    if (!user) {
      alert("Please log in to like products.");
      return;
    }

    if (likedProductIds.has(product.id)) {
      unlikeMutation.mutate(product.id);
    } else {
      likeMutation.mutate(product.id);
    }
  };


  const handleAddToCart = (product: Product) => {

    const finalPrice = parseFloat(product.discountedPrice || product.price);

    addToCart({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl || "",
      quantity: 1,
    });

    console.log("CELESTIALSTORE: Adding to cart:", {
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl || "",
      quantity: 1,
    })
};

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (error) {
    return (
      <section id="store" className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Discover Celestial Treasures</h2>
          <p className="text-red-500">Unable to load products. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="store" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Discover Celestial Treasures</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sacred artifacts and spiritual tools blessed by ancient wisdom and cosmic energies.
          </p>
        </div>


         {/* --- Filters (Search and Category) --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search for treasures..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((c) => <Button key={c.id} variant={selectedCategory === c.id ? "default" : "outline"} onClick={() => setSelectedCategory(c.id)}>{c.name}</Button>)}
            </div>
        </div>


        {/* --- THE NEW, CLEANER PRODUCT GRID --- */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onLike={handleLike}
                isLiked={likedProductIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
