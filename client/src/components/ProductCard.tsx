// src/components/ProductCard.tsx

import { Link } from "wouter";
import { type Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onLike: (product: Product) => void;
  isLiked: boolean;
}

export default function ProductCard({ product, onAddToCart, onLike, isLiked }: ProductCardProps) {
  const hasDiscount = product.discountedPrice && parseFloat(product.discountedPrice) > 0;

  return (
    <Card className="overflow-hidden group relative border-border/50 transition-all hover:shadow-lg hover:border-primary/50 flex flex-col">
      
      {product.stock === 0 ? (
        <Badge variant="destructive" className="absolute top-3 left-3 z-10">Out of Stock</Badge>
      ) : product.stock < 10 ? (
        <Badge variant="secondary" className="absolute top-3 left-3 z-10 bg-orange-500/10 text-orange-500 border-orange-500/20">Low Stock</Badge>
      ) : null}
      
      <div className="absolute top-2 right-2 z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white" onClick={() => onLike(product)}>
          <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}/>
        </Button>
      </div>
      
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={product.imageUrls?.[0] || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <CardContent className="p-4 space-y-3 flex-grow flex flex-col">
        <Badge variant="outline" className="capitalize w-fit">{product.category}</Badge>
        
        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-lg truncate hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex-grow"></div>
        
        <div className="flex items-baseline gap-2 mt-auto">
          <p className={`text-2xl font-bold ${hasDiscount ? 'text-red-500' : 'text-foreground'}`}>
            ₹{parseFloat(hasDiscount ? product.discountedPrice! : product.price).toLocaleString()}
          </p>
          {hasDiscount && (
            <p className="text-md text-muted-foreground line-through">
              ₹{parseFloat(product.price).toLocaleString()}
            </p>
          )}
        </div>

        <Button 
          onClick={() => onAddToCart(product)} 
          className="w-full cosmic-glow"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}