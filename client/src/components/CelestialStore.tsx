import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

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

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory === "all" ? "" : `?category=${selectedCategory}`],
  });

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl || "",
      quantity: 1,
    });

    toast({
      title: "Added to Cart! ✨",
      description: `${product.name} has been added to your cosmic collection.`,
    });
  };

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

        {/* Product Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full transition-all hover:scale-105"
              data-testid={`category-${category.id}`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Our cosmic inventory is being updated. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product: Product) => (
              <Card key={product.id} className="product-card border border-border overflow-hidden hover:border-cosmic-gold/50 transition-all group">
                <Link href={`/product/${product.id}`}>
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
                    alt={product.name} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </Link>
                <CardContent className="p-6">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-cosmic-gold transition-colors cursor-pointer">{product.name}</h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">₹{product.price}</span>
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="font-medium transition-all cosmic-glow"
                      data-testid={`button-add-to-cart-${product.id}`}
                    >
                      Add to Cart
                    </Button>
                  </div>
                  {product.stock !== undefined && product.stock !== null && product.stock < 5 && (
                    <p className="text-orange-500 text-xs mt-2">Only {product.stock} left in stock!</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load Products Button for Demo */}
        {!isLoading && products.length === 0 && (
          <div className="text-center">
            <Button 
              onClick={() => {
                fetch("/api/seed-products", { method: "POST" })
                  .then(() => {
                    toast({
                      title: "Products Loaded! 🌟",
                      description: "Sample celestial treasures have been added to the store.",
                    });
                    window.location.reload();
                  })
                  .catch(() => {
                    toast({
                      title: "Failed to Load Products",
                      description: "Please try again later.",
                      variant: "destructive",
                    });
                  });
              }}
              className="cosmic-glow"
              data-testid="button-seed-products"
            >
              Load Sample Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
