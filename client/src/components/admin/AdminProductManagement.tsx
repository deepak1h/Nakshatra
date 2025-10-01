import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import ProductFormModal from "./AdminProductForm";
import { useAdmin } from '@/hooks/useAdmin';


const categories = [
    { id: "all", name: "All Categories" },
    { id: "spiritual", name: "Spiritual Items" },
    { id: "crystals", name: "Crystals" },
    { id: "jewelry", name: "Jewelry" },
    { id: "books", name: "Books" },
];

export default function AdminProductManagement() {

  const { session } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["adminProducts"],
    queryFn: () => api.getAdminProducts(session?.access_token ?? null), // Correctly passes token
    enabled: !!session?.access_token, // Correctly waits for a token
  });

const createMutation = useMutation({
  // Wrap the call in an arrow function to pass the token
  mutationFn: (productData: FormData) => 
    api.createAdminProduct(productData, session?.access_token ?? null),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    toast({ title: "Product created successfully!" });
    setIsModalOpen(false);
  },
  onError: (err: Error) => toast({ title: "Creation Failed", description: err.message, variant: "destructive" }),
});


const updateMutation = useMutation({
  // Wrap the call to pass the token
  mutationFn: ({ id, data }: { id: string, data: any }) => 
    api.updateAdminProduct(id, data, session?.access_token ?? null),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    toast({ title: "Product updated successfully!" });
    setIsModalOpen(false);
  },
  onError: (err: Error) => toast({ title: "Update Failed", description: err.message, variant: "destructive" }),
});
  
const deleteMutation = useMutation({
  // Wrap the call to pass the token
  mutationFn: (productId: string) => 
    api.deleteAdminProduct(productId, session?.access_token ?? null),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    toast({ title: "Product deleted successfully!" });
  },
  onError: (err: Error) => toast({ title: "Delete Failed", description: err.message, variant: "destructive" }),
});

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: FormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(productId);
    }
  }


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500 text-center py-10">Error fetching products: {error.message}</div>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-accent mb-2">Product Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage your celestial products.</p>
        </div>
        <Button className="cosmic-glow" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by product name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((c) => <Button key={c.id} variant={selectedCategory === c.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(c.id)}>{c.name}</Button>)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- NEW: Dynamic Grid Layout --- */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name} ({filteredProducts.length})
        </h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group relative border-border/50">
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenModal(product)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                
                <Badge variant={product.isActive ? "default" : "destructive"} className="absolute top-2 left-2 z-10">
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>

                <div className="h-48 bg-muted overflow-hidden">
                  <img src={product.imageUrls?.[0] || "/placeholder.svg"} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                </div>

                <CardContent className="p-4 space-y-2">
                  <Badge variant="outline" className="capitalize">{product.category}</Badge>
                  <h3 className="font-bold text-lg truncate">{product.name}</h3>
                  
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold text-accent ${product.discountedPrice ? 'text-red-500' : ''}`}>
                      ₹{product.discountedPrice || product.price}
                    </p>
                    {product.discountedPrice && (
                      <p className="text-md text-muted-foreground line-through">
                        ₹{product.price}
                      </p>
                    )}
                  </div>

                  <div>
                    {product.stock > 0 ? (
                      <p className={`text-sm font-medium ${product.stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        {product.stock} units in stock
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-red-500">Out of Stock</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No products found for the selected criteria.</p>
          </div>
        )}
      </div>
      
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}