import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, LogOut, FileText, Clock, CheckCircle, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import emptyStateImg from "@/assets/empty-state.png";

interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
  resolution_note: string | null;
}

const StudentDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("student_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComplaints(data || []);
      
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(c => c.status === "pending").length || 0,
        inProgress: data?.filter(c => c.status === "in_progress").length || 0,
        resolved: data?.filter(c => c.status === "resolved").length || 0,
      };
      setStats(stats);
    } catch (error: any) {
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="neon-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <header className="border-b border-primary/20 glass-card relative z-10">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
            <h1 className="text-3xl font-bold neon-text">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} className="neon-border hover:bg-destructive/20">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Complaints
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold neon-text">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-status-pending" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-pending">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-status-in-progress" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-in-progress">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Resolved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-status-resolved" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-resolved">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Complaint Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold neon-text">My Complaints</h2>
          <Button 
            onClick={() => navigate("/student/new-complaint")}
            className="gradient-primary hover-lift"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={emptyStateImg} 
                      alt="No complaints" 
                      className="w-64 h-64 object-contain opacity-80"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">No complaints yet</p>
                    <p className="text-muted-foreground">Create your first complaint to get started.</p>
                  </div>
                  <Button 
                    onClick={() => navigate("/student/new-complaint")}
                    className="gradient-primary hover-lift"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Complaint
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="glass-card hover-lift cursor-pointer"
                onClick={() => navigate(`/student/complaint/${complaint.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-primary">{complaint.title}</CardTitle>
                      <CardDescription>
                        Category: {complaint.category.replace("_", " ")}
                      </CardDescription>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {complaint.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;