import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../hooks/use-toast";
import { Separator } from "./ui/separator";
import { api } from "../lib/api"; 

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
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id!), // Assuming api.getProduct(id) fetches from /api/products/:id
    enabled: !!id,
  });



const handleAddToCart = () => {
    if (!product) return;
    
    // Use the discounted price for the cart if it exists
    const finalPrice = parseFloat(product.discountedPrice || product.price);

    addToCart({
      id: product.id,
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

  const productImages = product.imageUrls || [];
  const hasDiscount = product.discountedPrice && parseFloat(product.discountedPrice) > 0;



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
            {/* --- DYNAMIC Image Gallery --- */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img
                    src={productImages[selectedImageIndex] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Card>
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((image, index) => (
                  <button key={index} onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? "border-primary ring-2 ring-primary/50" : "border-transparent hover:border-muted-foreground"}`}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>


            {/* --- DYNAMIC Product Information --- */}
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-4 capitalize">{product.category}</Badge>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
              </div>
              
              {/* --- DYNAMIC Price Display --- */}
              <div className="flex items-baseline gap-4">
                <p className={`text-4xl font-bold ${hasDiscount ? 'text-red-500' : 'text-primary'}`}>
                  ₹{parseFloat(hasDiscount ? product.discountedPrice! : product.price).toLocaleString()}
                </p>
                {hasDiscount && (
                  <p className="text-2xl text-muted-foreground line-through">
                    ₹{parseFloat(product.price).toLocaleString()}
                  </p>
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
                <div className="flex gap-3">
                  <Button onClick={handleAddToCart} className="flex-1" disabled={product.stock === 0}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button variant="outline" size="icon"><Heart className="w-4 h-4" /></Button>
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

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-cosmic-purple/5">
                <Truck className="w-6 h-6 text-cosmic-gold" />
                <span className="text-sm font-medium">Free Shipping</span>
                <span className="text-xs text-muted-foreground">Above ₹1000</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-cosmic-purple/5">
                <Shield className="w-6 h-6 text-cosmic-gold" />
                <span className="text-sm font-medium">Authentic</span>
                <span className="text-xs text-muted-foreground">Guaranteed</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-cosmic-purple/5">
                <RotateCcw className="w-6 h-6 text-cosmic-gold" />
                <span className="text-sm font-medium">7-Day Returns</span>
                <span className="text-xs text-muted-foreground">Easy process</span>
              </div>
            </div>
          </div>
        </div>

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
      </div>
  );
}