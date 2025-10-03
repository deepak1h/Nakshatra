import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAdmin } from "@/hooks/useAdmin";
import { type KundaliRequestWithUser } from "server/storage"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Loader2 } from "lucide-react";

const kundaliStatuses = ["New", "Processing", "Completed", "Cancelled"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "New": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Processing": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

export default function AdminKundaliManagement() {
  const [editingRequest, setEditingRequest] = useState<KundaliRequestWithUser | null>(null);
  const [updateData, setUpdateData] = useState({ status: "", reportUrl: "" });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session } = useAdmin();

  const { data: requests = [], isLoading, error } = useQuery<KundaliRequestWithUser[]>({
    queryKey: ["adminKundaliRequests"],
    queryFn: () => api.getAdminKundaliRequests(session?.access_token ?? null),
    enabled: !!session,
  });


  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { status: string, reportUrl: string }}) =>
      api.updateAdminKundaliRequest(id, data, session?.access_token ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminKundaliRequests"] });
      toast({ title: "Request Updated Successfully!" });
      setEditingRequest(null);
    },
    onError: (err: Error) => toast({ title: "Update Failed", description: err.message, variant: "destructive" }),
  });

  const handleEditClick = (request: KundaliRequestWithUser) => {
    setEditingRequest(request);
    setUpdateData({
      status: request.status,
      reportUrl: request.reportUrl || "",
    });
  };

  const handleUpdateSubmit = () => {
    if (editingRequest) {
      updateMutation.mutate({ id: editingRequest.id, data: updateData });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500 text-center py-10">Error fetching requests: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Kundali Requests Management</h1>
        <p className="text-muted-foreground">View and manage all user-submitted kundali requests.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Requests ({requests.length})</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Birth Details</th>
                <th className="text-left p-4 font-medium">Requested On</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">{req.user.firstName} {req.user.lastName}</td>
                  <td className="p-4">{req.name}, {new Date(req.birthDate).toLocaleDateString()} at {req.birthTime}</td>
                  <td className="p-4">{new Date(req.createdAt).toLocaleString()}</td>
                  <td className="p-4"><Badge className={getStatusColor(req.status)}>{req.status}</Badge></td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(req)}><Edit className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!editingRequest} onOpenChange={() => setEditingRequest(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Kundali Request</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={updateData.status} onValueChange={(value) => setUpdateData(p => ({...p, status: value}))}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>{kundaliStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportUrl" className="text-right">Report URL</Label>
              <Input id="reportUrl" value={updateData.reportUrl} onChange={(e) => setUpdateData(p => ({...p, reportUrl: e.target.value}))} className="col-span-3" placeholder="Link to generated PDF..."/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRequest(null)}>Cancel</Button>
            <Button onClick={handleUpdateSubmit} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}