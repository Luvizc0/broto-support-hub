import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminManagement } from "@/components/AdminManagement";

const UserManagement = () => {
  const navigate = useNavigate();
  const { userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && userRole !== "admin") {
      navigate("/auth");
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        </div>
        
        <AdminManagement />
      </div>
    </div>
  );
};

export default UserManagement;
