import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  LogOut, 
  Package, 
  ShoppingCart, 
  Star, 
  Users,
  BarChart3,
  Settings 
} from "lucide-react";
import { Link } from "wouter";

interface AdminDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const navigationItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "kundali", label: "Kundali Types", icon: Star },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminDashboard({ activeTab, onTabChange, children }: AdminDashboardProps) {
  const { admin, logout } = useAdmin();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out of the admin portal.",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-navy">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold text-accent">Nakshatra Admin</h1>
                <p className="text-sm text-muted-foreground">Administration Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Welcome, </span>
                <span className="font-medium">{admin?.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                          activeTab === item.id
                            ? "bg-accent/10 text-accent border-r-2 border-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <Card className="border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="p-6">
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}