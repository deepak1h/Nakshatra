import { useState, useMemo } from "react";
import { useParams, Link,  useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield,Gem, RotateCcw, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../hooks/use-toast";
import { Separator } from "./ui/separator";
import { api } from "../lib/api"; 
import { useAuth } from "../hooks/useAuth"; 
import ImageGalleryModal from "./ImageGalleryModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  discountedPrice?: string | null;
  category: string;
  imageUrls?: string[] | null;
  stock: number;
  isActive: boolean;
  specifications?: { key: string; value: string }[] | null;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [, setLocation] = useLocation(); 
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id!),
    enabled: !!id,
  });

    const handleBuyNow = () => {
    if (!product) return;

    // First, add the item to the cart
    const finalPrice = parseFloat(product.discountedPrice || product.price);
    addToCart({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      imageUrl: product.imageUrls?.[0] || "",
      quantity, // Use the selected quantity
    });

    // Then, immediately redirect to checkout
    setLocation("/checkout");
  };



    const { data: likedProducts = [] } = useQuery<Product[]>({
    queryKey: ["likedProducts"],
    queryFn: () => api.getLikedProducts(),
    enabled: !!user,
  });
  const isLiked = useMemo(() => 
    likedProducts && product ? new Set(likedProducts.map(p => p.id)).has(product.id) : false,
    [likedProducts, product]
  );
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

 const handleLike = () => {
    if (!user || !product) {
      toast({ title: "Please log in to like products.", variant: "destructive" });
      return;
    }
    if (isLiked) {
      unlikeMutation.mutate(product.id);
    } else {
      likeMutation.mutate(product.id);
    }
  };
  
  // --- FIX: Add To Cart Logic (was missing toast) ---
  const handleAddToCart = () => {
    if (!product) return;
    const finalPrice = parseFloat(product.discountedPrice || product.price);
    addToCart({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      imageUrl: product.imageUrls?.[0] || "",
      quantity,
    });
    toast({
      title: "Added to Cart! ✨",
      description: `${quantity} x ${product.name} added to your cosmic collection.`,
    });
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-navy pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-cosmic-purple/20 rounded w-32 mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-cosmic-purple/20 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-cosmic-purple/20 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-cosmic-purple/20 rounded w-3/4"></div>
                <div className="h-6 bg-cosmic-purple/20 rounded w-1/2"></div>
                <div className="h-24 bg-cosmic-purple/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cosmic-navy pt-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/#store">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
          </Link>
          <h1 className="text-3xl font-serif text-cosmic-gold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The celestial treasure you're looking for couldn't be found.</p>
          <Link href="/#store">
            <Button>Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }
  // --- MAIN PRODUCT DETAIL LOGIC ---
  const productImages = product.imageUrls || [];
  const hasDiscount = product.discountedPrice && parseFloat(product.discountedPrice) > 0;
  
  // --- FEATURE: Calculate Discount Percentage ---
  let discountPercent = 0;
  if (hasDiscount && product.price) {
    const originalPrice = parseFloat(product.price);
    const salePrice = parseFloat(product.discountedPrice!);
    if (originalPrice > 0) {
        discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
  }
  
  // --- FEATURE: Image Gallery Logic ---
  const visibleThumbnails = productImages.slice(0, 4);
  const hasMoreImages = productImages.length > 4;
  const remainingImagesCount = productImages.length - 4;



  return (
    <div className="min-h-screen bg-cosmic-navy pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/#store">
            <Button variant="outline" className="cosmic-glow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
          </Link>
          <nav className="text-sm text-muted-foreground mt-4">
            <Link href="/" className="hover:text-cosmic-gold">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/#store" className="hover:text-cosmic-gold">Store</Link>
            <span className="mx-2">/</span>
            <span className="text-cosmic-gold capitalize">{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>


        <div className="grid lg:grid-cols-2 gap-12">
          {/* --- UPGRADED Image Gallery --- */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                <img src={productImages[selectedImageIndex] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover"/>
              </div>
            </Card>
            <div className="grid grid-cols-5 gap-2">
              {visibleThumbnails.map((image, index) => (
                <button key={index} onClick={() => setSelectedImageIndex(index)} 
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? "border-primary ring-2 ring-primary/50" : "border-transparent hover:border-muted-foreground"}`}
                >
                <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {hasMoreImages && (
                <button onClick={() => setIsGalleryOpen(true)} className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80">
                  <span className="font-bold text-lg">+{remainingImagesCount}</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-4 capitalize">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
            </div>
            
            {/* --- UPGRADED Price Display --- */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
              <p className={`text-4xl font-bold ${hasDiscount ? 'text-red-500' : 'text-primary'}`}>
                ₹{parseFloat(hasDiscount ? product.discountedPrice! : product.price).toLocaleString()}
              </p>
              {hasDiscount && (
                <>
                  <p className="text-2xl text-muted-foreground line-through">
                    ₹{parseFloat(product.price).toLocaleString()}
                  </p>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-md py-1">
                    {discountPercent}% OFF
                  </Badge>
                </>
              )}
            </div>
              <Separator />
              
              {/* --- DYNAMIC Specifications Table --- */}
              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                  <div className="space-y-2">
                    {product.specifications.map(spec => (
                      spec.key && <div key={spec.key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{spec.key}:</span>
                        <span>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            {/* Quantity and Add to Cart */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Minus className="w-4 h-4" /></Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
                
                {/* --- NEW: Authentic Button Layout --- */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleAddToCart} className="flex-1" variant="outline" disabled={product.stock === 0}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button onClick={handleBuyNow} className="flex-1 cosmic-glow" disabled={product.stock === 0}>
                    {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                  </Button>
                </div>
                
                {/* The like button can be separate or integrated */}
                <div className="mt-4 text-center">
                    <Button variant="ghost" onClick={handleLike} className="text-sm">
                        <Heart className={`w-4 h-4 mr-2 transition-all ${isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                        {isLiked ? 'Added to Favorites' : 'Add to Favorites'}
                    </Button>
                </div>

                <div className="text-sm text-center mt-3">
                  {product.stock > 0 ? (
                    <span className={`font-medium ${product.stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>✓ {product.stock} units available</span>
                  ) : (
                    <span className="font-medium text-red-500">✗ Out of stock</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* --- UPGRADED Trust Badges --- */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Truck className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Fast Shipping</span>
                <span className="text-xs text-muted-foreground">Dispatched in 24h</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Authentic</span>
                <span className="text-xs text-muted-foreground">Guaranteed</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Gem className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Quality Assured</span>
                <span className="text-xs text-muted-foreground">Energized & Blessed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

            <ImageGalleryModal 
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={productImages}
        startIndex={selectedImageIndex}
      />

          <Card className="border-cosmic-purple/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-cosmic-gold">Spiritual Guidance</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>This sacred item has been carefully selected for its spiritual properties and cosmic energies.</p>
                <p>Perfect for meditation, healing practices, and enhancing your spiritual journey.</p>
                <p className="text-cosmic-gold font-medium">
                  "Every celestial treasure carries the wisdom of the universe."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
  );
}