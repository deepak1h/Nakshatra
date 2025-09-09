import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Heart, 
  Scroll, 
  LogOut, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowLeft
} from "lucide-react";
import type { Order, KundaliRequest, Product, UserCart } from "@shared/schema";
import { useNavigate } from "react-router-dom";

export function UserDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  // Fetch user orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/user/orders"],
    enabled: !!user,
  });

  // Fetch kundali requests
  const { data: kundaliRequests = [] } = useQuery<KundaliRequest[]>({
    queryKey: ["/api/user/kundali-requests"], 
    enabled: !!user,
  });

  // Fetch liked products
  const { data: likedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/user/liked-products"],
    enabled: !!user,
  });

  // Fetch user cart
  const { data: cartItems = [] } = useQuery<(UserCart & { product: Product })[]>({
    queryKey: ["/api/user/cart"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "Thank you for visiting Nakshatra. Come back soon!",
    });
    navigate('/');
  };

  if (!user) return null;

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen cosmic-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="cosmic-bg border border-cosmic-purple/30 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-cosmic-navy mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-4">
              <div className="cosmic-glow w-16 h-16 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-cosmic-gold">{user.email}</p>
                {user.lastLoginAt && (
                  <p className="text-sm text-cosmic-gold/70">
                    Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-cosmic-navy"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-cosmic-navy/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-cosmic-purple">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-cosmic-purple">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="kundali" className="data-[state=active]:bg-cosmic-purple">
              <Scroll className="w-4 h-4 mr-2" />
              Kundali ({kundaliRequests.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-cosmic-purple">
              <Heart className="w-4 h-4 mr-2" />
              Favorites ({likedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="cart" className="data-[state=active]:bg-cosmic-purple">
              <Settings className="w-4 h-4 mr-2" />
              Cart ({cartItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="cosmic-bg border-cosmic-purple/30">
              <CardHeader>
                <CardTitle className="text-cosmic-gold">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cosmic-gold" />
                    <div>
                      <p className="text-sm text-cosmic-gold/70">Email</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-cosmic-gold" />
                      <div>
                        <p className="text-sm text-cosmic-gold/70">Phone</p>
                        <p className="text-white">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-cosmic-gold" />
                    <div>
                      <p className="text-sm text-cosmic-gold/70">Member Since</p>
                      <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card className="cosmic-bg border-cosmic-purple/30">
                <CardContent className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                  <p className="text-cosmic-gold/70">Your order history will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="cosmic-bg border-cosmic-purple/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-cosmic-gold/70">Order #{order.id.slice(-8)}</p>
                          <p className="text-lg font-bold text-white">{formatPrice(order.totalAmount)}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status!)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-cosmic-gold/70">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Kundali Tab */}
          <TabsContent value="kundali" className="space-y-4">
            {kundaliRequests.length === 0 ? (
              <Card className="cosmic-bg border-cosmic-purple/30">
                <CardContent className="text-center py-12">
                  <Scroll className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Kundali Requests</h3>
                  <p className="text-cosmic-gold/70">Your Kundali readings will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {kundaliRequests.map((request) => (
                  <Card key={request.id} className="cosmic-bg border-cosmic-purple/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-bold text-white">{request.kundaliType}</p>
                          <p className="text-sm text-cosmic-gold/70">for {request.fullName}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(request.status!)}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-cosmic-gold">{formatPrice(request.price)}</p>
                      <p className="text-sm text-cosmic-gold/70">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {likedProducts.length === 0 ? (
              <Card className="cosmic-bg border-cosmic-purple/30">
                <CardContent className="text-center py-12">
                  <Heart className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Favorites Yet</h3>
                  <p className="text-cosmic-gold/70">Products you like will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedProducts.map((product) => (
                  <Card key={product.id} className="cosmic-bg border-cosmic-purple/30">
                    <CardContent className="p-4">
                      <img 
                        src={product.imageUrl || ''} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-4"
                      />
                      <h3 className="font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-cosmic-gold font-bold">{formatPrice(product.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart" className="space-y-4">
            {cartItems.length === 0 ? (
              <Card className="cosmic-bg border-cosmic-purple/30">
                <CardContent className="text-center py-12">
                  <Settings className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Cart is Empty</h3>
                  <p className="text-cosmic-gold/70">Items in your cart will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="cosmic-bg border-cosmic-purple/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.product.imageUrl || ''} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{item.product.name}</h3>
                          <p className="text-cosmic-gold">Quantity: {item.quantity}</p>
                          <p className="text-cosmic-gold font-bold">{formatPrice(item.product.price)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}