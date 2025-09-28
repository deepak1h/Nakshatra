import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Package, Truck } from "lucide-react";

// Placeholder data - will be replaced with real API calls
const sampleOrders = [
  {
    id: "ORD-001",
    customer: "Priya Sharma",
    email: "priya@example.com",
    amount: "₹2,450",
    status: "new",
    items: 3,
    createdAt: "2025-09-28",
    trackingId: "",
    courierPartner: "",
  },
  {
    id: "ORD-002", 
    customer: "Rahul Kumar",
    email: "rahul@example.com",
    amount: "₹1,890",
    status: "in_progress",
    items: 2,
    createdAt: "2025-09-27",
    trackingId: "TRK-12345",
    courierPartner: "Blue Dart",
  },
  {
    id: "ORD-003",
    customer: "Anita Patel",
    email: "anita@example.com", 
    amount: "₹3,200",
    status: "completed",
    items: 4,
    createdAt: "2025-09-26",
    trackingId: "TRK-67890",
    courierPartner: "FedEx",
  }
];

const orderStatuses = [
  { value: "all", label: "All Orders" },
  { value: "new", label: "New" },
  { value: "in_queue", label: "In Queue" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "in_queue":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "in_progress":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

export default function AdminOrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredOrders = sampleOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Order Management</h1>
        <p className="text-muted-foreground">
          Track and manage customer orders, update shipping details, and monitor order progress.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "New Orders", value: "5", color: "text-blue-500" },
          { label: "In Queue", value: "8", color: "text-yellow-500" },
          { label: "In Progress", value: "12", color: "text-orange-500" },
          { label: "Completed", value: "156", color: "text-green-500" },
        ].map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID, customer, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Tracking</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{order.id}</div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.email}</div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{order.amount}</td>
                    <td className="p-4">{order.items} items</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{order.createdAt}</td>
                    <td className="p-4">
                      {order.trackingId ? (
                        <div className="text-sm">
                          <div className="font-medium">{order.trackingId}</div>
                          <div className="text-muted-foreground">{order.courierPartner}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Package className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Truck className="w-4 h-4" />
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