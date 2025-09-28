import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminOverview from "./AdminOverview";
import AdminProductManagement from "./AdminProductManagement";
import AdminOrderManagement from "./AdminOrderManagement";

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "products":
        return <AdminProductManagement />;
      case "orders":
        return <AdminOrderManagement />;
      case "kundali":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Kundali Types Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "users":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  return (
    <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminDashboard>
  );
}