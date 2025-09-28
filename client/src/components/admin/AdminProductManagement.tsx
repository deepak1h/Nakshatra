import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";

// Placeholder data - will be replaced with real API calls
const sampleProducts = [
  {
    id: "1",
    name: "Rudraksha Mala",
    category: "spiritual",
    price: "₹1,250",
    stock: 45,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a"
  },
  {
    id: "2", 
    name: "Crystal Healing Set",
    category: "crystals",
    price: "₹2,800",
    stock: 12,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a"
  },
  {
    id: "3",
    name: "Gemstone Ring",
    category: "jewelry",
    price: "₹4,500",
    stock: 0,
    status: "Out of Stock",
    imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a"
  }
];

export default function AdminProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "spiritual", name: "Spiritual Items" },
    { id: "crystals", name: "Crystals" },
    { id: "jewelry", name: "Jewelry" },
    { id: "books", name: "Books" },
  ];

  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent mb-2">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your celestial treasures and spiritual products.
          </p>
        </div>
        <Button className="cosmic-glow">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="p-4 font-medium">{product.price}</td>
                    <td className="p-4">
                      <span className={product.stock === 0 ? "text-red-500" : "text-foreground"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={product.status === "Active" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}