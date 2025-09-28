import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Star, Users, DollarSign, TrendingUp } from "lucide-react";

const statsData = [
  {
    title: "Total Products",
    value: "124",
    change: "+12%",
    trend: "up",
    icon: Package,
  },
  {
    title: "Active Orders",
    value: "18",
    change: "+5%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Kundali Requests",
    value: "34",
    change: "+23%",
    trend: "up",
    icon: Star,
  },
  {
    title: "Total Users",
    value: "1,204",
    change: "+8%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Monthly Revenue",
    value: "₹45,230",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Growth Rate",
    value: "12.5%",
    change: "+2.1%",
    trend: "up",
    icon: TrendingUp,
  },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the Nakshatra administration panel. Here's a quick overview of your platform's performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "ORD-001", customer: "Priya Sharma", amount: "₹2,450", status: "Processing" },
                { id: "ORD-002", customer: "Rahul Kumar", amount: "₹1,890", status: "Shipped" },
                { id: "ORD-003", customer: "Anita Patel", amount: "₹3,200", status: "Delivered" },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Rudraksha Mala", sales: 45, revenue: "₹18,000" },
                { name: "Crystal Healing Set", sales: 32, revenue: "₹12,800" },
                { name: "Gemstone Ring", sales: 28, revenue: "₹22,400" },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}