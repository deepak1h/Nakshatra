import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Star, Users, DollarSign, TrendingUp, Loader2, BarChart } from "lucide-react";
import { type Order } from "@shared/schema";


interface TopProduct {
  name: string;
  totalRevenue: string;
}

interface DashboardStats {
  totalProducts: number;
  newOrders: number;
  kundaliRequests: number;
  totalUsers: number;
  monthlyRevenue: string;
  recentOrders: Order[];
  topProducts: TopProduct[];
}

export default function AdminOverview() {

  const { session } = useAdmin();


  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () => api.getAdminDashboardStats(session?.access_token ?? null),
    enabled: !!session,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (error) {
    return <div className="text-red-500 text-center py-10">Error fetching dashboard data: {error.message}</div>;
  }
  if (!stats) {
    return <div className="text-center py-10">No dashboard data available.</div>;
  }

  const statsData = [
    { title: "Total Products", value: stats.totalProducts, icon: Package },
    { title: "New Orders", value: stats.newOrders, icon: ShoppingCart }, // Relabeled
    { title: "Kundali Requests", value: stats.kundaliRequests, icon: Star },
    { title: "Total Users", value: stats.totalUsers, icon: Users },
    { title: "Monthly Revenue (Delivered)", value: `₹${parseFloat(stats.monthlyRevenue).toLocaleString()}`, icon: DollarSign }, // Relabeled
    { title: "Top Product Revenue", value: `₹${parseFloat(stats.topProducts[0]?.totalRevenue || '0').toLocaleString()}`, icon: BarChart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          A quick overview of your platform's performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.shippingName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent orders.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* --- DYNAMIC TOP PRODUCTS CARD --- */}
        <Card>
          <CardHeader><CardTitle>Top Products by Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.length > 0 ? (
                stats.topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{parseFloat(product.totalRevenue).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No product sales data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}