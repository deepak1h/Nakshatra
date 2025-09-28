import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  rating?: number;
  reviews?: number;
  features?: string[];
  materials?: string[];
  dimensions?: string;
  weight?: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  // Sample additional images for demonstration
  const productImages = product?.imageUrl ? [
    product.imageUrl,
    product.imageUrl.replace('photo-1602173574767', 'photo-1589656966895'), // Different angle
    product.imageUrl.replace('photo-1602173574767', 'photo-1544947950-fa07a98d237f'), // Close-up
    product.imageUrl.replace('photo-1602173574767', 'photo-1518837695005'), // Lifestyle
  ] : [];

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl || "",
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
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="border-cosmic-purple/30 overflow-hidden">
              <div className="aspect-square bg-cosmic-purple/10 flex items-center justify-center">
                <img
                  src={productImages[selectedImageIndex] || product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Card>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? "border-cosmic-gold ring-2 ring-cosmic-gold/50" 
                      : "border-cosmic-purple/30 hover:border-cosmic-purple/60"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-4 capitalize">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-serif font-bold text-cosmic-gold mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < (product.rating || 4) 
                          ? "fill-cosmic-gold text-cosmic-gold" 
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews || 127} reviews)
                </span>
              </div>

              <p className="text-3xl font-bold text-cosmic-gold mb-6">
                ₹{parseFloat(product.price).toLocaleString()}
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "This sacred item carries the ancient wisdom of the cosmos, carefully crafted to enhance your spiritual journey and bring positive energies into your life."}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-cosmic-gold">Features & Benefits</h3>
              <ul className="space-y-2">
                {(product.features || [
                  "Authentic spiritual energy",
                  "Handcrafted with cosmic precision",
                  "Blessed by ancient rituals",
                  "Suitable for meditation and healing"
                ]).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-cosmic-gold rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <Card className="border-cosmic-purple/30 bg-cosmic-purple/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleAddToCart}
                    className="flex-1 cosmic-glow"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground mt-3">
                  {product.stock > 0 ? (
                    <span className="text-green-400">✓ {product.stock} items in stock</span>
                  ) : (
                    <span className="text-red-400">✗ Currently out of stock</span>
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

        {/* Product Details */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card className="border-cosmic-purple/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-cosmic-gold">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials:</span>
                  <span>{product.materials?.join(", ") || "Sacred materials"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span>{product.dimensions || "Standard size"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span>{product.weight || "Lightweight"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
}