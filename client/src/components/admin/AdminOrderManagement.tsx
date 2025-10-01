
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type Order, type OrderItem, type Product } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Edit, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getAdminQueryFn } from '@/lib/queryClient';
import { useAdmin } from '@/hooks/useAdmin';


type OrderWithDetails = Order & { 
  orderItems: (OrderItem & { product: Product })[] 
};


const orderStatuses = [
  { value: "all", label: "All Orders" },
  { value: "new", label: "New" },
  { value: "in_queue", label: "In Queue" },
  { value: "in_progress", label: "In Progress" },

  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },

];

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "in_queue":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "in_progress":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";

    case "Shipped":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "Delivered":

      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

export default function AdminOrderManagement() {

  const { session } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [updateData, setUpdateData] = useState({
    status: "",
    trackingId: "",
    courierPartner: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ["adminOrders"], // Key for caching
    queryFn: () => api.getAdminOrders(session?.access_token ?? null),
    enabled: !!session?.access_token,
  });


  const { data: orderDetails, isFetching: isFetchingDetails } = useQuery<OrderWithDetails>({
    queryKey: ["adminOrderDetails", viewingOrder?.id], // Key for caching
    queryFn: () => api.getAdminOrderById(viewingOrder!.id, session?.access_token ?? null),
    enabled: !!viewingOrder?.id && !!session?.access_token,
  });

  const updateOrderMutation = useMutation({

    mutationFn: ({ orderId, data }: { orderId: string, data: any }) =>
      api.updateAdminOrder(orderId, data, session?.access_token ?? null),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrderDetails", updatedOrder.id] });
      toast({ title: "Order Updated Successfully!" });
      setEditingOrder(null);
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });

  const handleViewClick = (order: Order) => {
    setViewingOrder(order as OrderWithDetails);

  };
  
  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setUpdateData({
      status: order.status,
      trackingId: order.trackingId || "",
      courierPartner: order.courierPartner || "",
    });
  };

  const handleUpdateSubmit = () => {
    if (editingOrder) {
      updateOrderMutation.mutate({ orderId: editingOrder.id, data: updateData });
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.shippingName.toLowerCase().includes(searchLower);

    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });


  const stats = {
    new: orders.filter(o => o.status === 'new').length,
    in_queue: orders.filter(o => o.status === 'in_queue').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    Shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (error) {
    return <div className="text-red-500 text-center py-10">Error fetching orders: {error.message}</div>;
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Order Management</h1>

        <p className="text-muted-foreground">Track, view, and update customer orders and shipping details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-500">{stats.new}</div><div className="text-sm text-muted-foreground">New Orders</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{stats.in_queue}</div><div className="text-sm text-muted-foreground">In Queue</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-orange-500">{stats.in_progress}</div><div className="text-sm text-muted-foreground">In Progress</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-500">{stats.Shipped}</div><div className="text-sm text-muted-foreground">Shipped</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-500">{stats.delivered}</div><div className="text-sm text-muted-foreground">Delivered</div></CardContent></Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by Order # or Customer Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}><SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger><SelectContent>{orderStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>

            </div>
          </div>
        </CardContent>
      </Card>


      <Card className="border-border/50">
        <CardHeader><CardTitle>Orders ({filteredOrders.length})</CardTitle></CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">

                  <th className="text-left p-4 font-medium">Order #</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">

                    <td className="p-4 font-medium">{order.orderNumber}</td>
                    <td className="p-4">{order.shippingName}</td>
                    <td className="p-4 font-medium">₹{order.totalAmount}</td>
                    <td className="p-4"><Badge className={getStatusColor(order.status)} variant="outline">{order.status.replace('_', ' ').toUpperCase()}</Badge></td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewClick(order)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(order)}><Edit className="w-4 h-4" /></Button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      {/* View Order Details Modal */}


      {/* View Order Details Modal */}
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details: {orderDetails?.orderNumber ?? viewingOrder?.orderNumber}</DialogTitle>
            <DialogDescription>Full order and shipping information.</DialogDescription>
          </DialogHeader>
          {isFetchingDetails ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div> :
            orderDetails ? (
              <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><h4 className="font-semibold">Shipping To:</h4><p>{orderDetails.shippingName}<br/>{orderDetails.mobileNumber}</p></div>
                  <div><h4 className="font-semibold">Address:</h4><p>{orderDetails.addressLine1}<br/>{orderDetails.addressLine2}<br/>{orderDetails.landmark}<br/>{orderDetails.city}, {orderDetails.state} - {orderDetails.pincode}</p></div>
                </div>
                <Separator />
                <div><h4 className="font-semibold mb-2">Items Ordered:</h4>
                  <div className="space-y-2">
                    {orderDetails.orderItems?.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <p>{item.product.name} (x{item.quantity})</p>
                        <p>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <Separator className="my-2"/>
                    <div className="flex justify-between font-bold">
                      <p>Total</p><p>₹{orderDetails.totalAmount}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : <div className="py-10 text-center text-muted-foreground">No details found.</div>
          }
        </DialogContent>
      </Dialog>
      
      {/* Edit Order Modal */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Order {editingOrder?.orderNumber}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={updateData.status} onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent>{orderStatuses.slice(1).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingId" className="text-right">Tracking ID</Label>
              <Input id="trackingId" value={updateData.trackingId} onChange={(e) => setUpdateData(prev => ({ ...prev, trackingId: e.target.value }))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courierPartner" className="text-right">Courier</Label>
              <Input id="courierPartner" value={updateData.courierPartner} onChange={(e) => setUpdateData(prev => ({ ...prev, courierPartner: e.target.value }))} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
            <Button onClick={handleUpdateSubmit} disabled={updateOrderMutation.isPending}>{updateOrderMutation.isPending ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

  // return (
  //   <div className="space-y-6">
  //     <div>
  //       <h1 className="text-3xl font-bold text-accent mb-2">Order Management</h1>
  //       <p className="text-muted-foreground">
  //         Track and manage customer orders, update shipping details, and monitor order progress.
  //       </p>
  //     </div>

  //     {/* Quick Stats */}
  //     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  //       {[
  //         { label: "New Orders", value: "5", color: "text-blue-500" },
  //         { label: "In Queue", value: "8", color: "text-yellow-500" },
  //         { label: "In Progress", value: "12", color: "text-orange-500" },
  //         { label: "Completed", value: "156", color: "text-green-500" },
  //       ].map((stat, index) => (
  //         <Card key={index} className="border-border/50">
  //           <CardContent className="p-4">
  //             <div className="text-center">
  //               <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
  //               <div className="text-sm text-muted-foreground">{stat.label}</div>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>

  //     {/* Filters */}
  //     <Card className="border-border/50">
  //       <CardContent className="p-6">
  //         <div className="flex flex-col md:flex-row gap-4">
  //           <div className="flex-1">
  //             <div className="relative">
  //               <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
  //               <Input
  //                 placeholder="Search orders by ID, customer, or email..."
  //                 value={searchTerm}
  //                 onChange={(e) => setSearchTerm(e.target.value)}
  //                 className="pl-10"
  //               />
  //             </div>
  //           </div>
  //           <div className="w-full md:w-48">
  //             <Select value={selectedStatus} onValueChange={setSelectedStatus}>
  //               <SelectTrigger>
  //                 <SelectValue placeholder="Filter by status" />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 {orderStatuses.map((status) => (
  //                   <SelectItem key={status.value} value={status.value}>
  //                     {status.label}
  //                   </SelectItem>
  //                 ))}
  //               </SelectContent>
  //             </Select>
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>

  //     {/* Orders Table */}
  //     <Card className="border-border/50">
  //       <CardHeader>
  //         <CardTitle>Orders ({filteredOrders.length})</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="overflow-x-auto">
  //           <table className="w-full">
  //             <thead>
  //               <tr className="border-b border-border/50">
  //                 <th className="text-left p-4 font-medium">Order ID</th>
  //                 <th className="text-left p-4 font-medium">Customer</th>
  //                 <th className="text-left p-4 font-medium">Amount</th>
  //                 <th className="text-left p-4 font-medium">Items</th>
  //                 <th className="text-left p-4 font-medium">Status</th>
  //                 <th className="text-left p-4 font-medium">Date</th>
  //                 <th className="text-left p-4 font-medium">Tracking</th>
  //                 <th className="text-left p-4 font-medium">Actions</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {filteredOrders.map((order) => (
  //                 <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">
  //                   <td className="p-4">
  //                     <div className="font-medium">{order.id}</div>
  //                   </td>
  //                   <td className="p-4">
  //                     <div>
  //                       <div className="font-medium">{order.customer}</div>
  //                       <div className="text-sm text-muted-foreground">{order.email}</div>
  //                     </div>
  //                   </td>
  //                   <td className="p-4 font-medium">{order.amount}</td>
  //                   <td className="p-4">{order.items} items</td>
  //                   <td className="p-4">
  //                     <Badge className={getStatusColor(order.status)} variant="outline">
  //                       {order.status.replace('_', ' ').toUpperCase()}
  //                     </Badge>
  //                   </td>
  //                   <td className="p-4 text-sm text-muted-foreground">{order.createdAt}</td>
  //                   <td className="p-4">
  //                     {order.trackingId ? (
  //                       <div className="text-sm">
  //                         <div className="font-medium">{order.trackingId}</div>
  //                         <div className="text-muted-foreground">{order.courierPartner}</div>
  //                       </div>
  //                     ) : (
  //                       <span className="text-muted-foreground text-sm">Not assigned</span>
  //                     )}
  //                   </td>
  //                   <td className="p-4">
  //                     <div className="flex items-center gap-2">
  //                       <Button variant="ghost" size="sm">
  //                         <Eye className="w-4 h-4" />
  //                       </Button>
  //                       <Button variant="ghost" size="sm">
  //                         <Edit className="w-4 h-4" />
  //                       </Button>
  //                       <Button variant="ghost" size="sm">
  //                         <Package className="w-4 h-4" />
  //                       </Button>
  //                       <Button variant="ghost" size="sm">
  //                         <Truck className="w-4 h-4" />
  //                       </Button>
  //                     </div>
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
//}

