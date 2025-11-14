import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, FileText, CheckCircle, Users, Sparkles, Zap } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center pulse-glow">
              <Shield className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold neon-text">Brototype</h1>
              <p className="text-xs text-muted-foreground">BCMP</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={() => navigate("/auth")} className="gradient-primary hover-lift">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section with Illustration */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-6">
                <Zap className="w-20 h-20 text-primary animate-pulse-glow" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold neon-text animate-fade-in">
                Brototype Complaint Management Portal
              </h1>
              <p className="text-xl text-muted-foreground">
                A transparent and efficient platform for students to raise issues and track their resolutions with cutting-edge technology
              </p>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="gradient-primary hover-lift text-lg px-8 py-6"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Sign In or Create Account
                </Button>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="relative animate-fade-in hover-lift">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl animate-pulse-glow" />
              <img 
                src={heroIllustration} 
                alt="Complaint Management Dashboard" 
                className="relative rounded-2xl shadow-2xl glass-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="glass-card hover-lift p-6 space-y-3">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto pulse-glow">
                <FileText className="w-6 h-6 text-background" />
              </div>
              <h3 className="font-semibold text-lg text-primary">Easy Submission</h3>
              <p className="text-sm text-muted-foreground">
                Submit complaints with detailed descriptions, file attachments, and categorization for faster resolution
              </p>
            </div>

            <div className="glass-card hover-lift p-6 space-y-3">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto pulse-glow">
                <CheckCircle className="w-6 h-6 text-background" />
              </div>
              <h3 className="font-semibold text-lg text-primary">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your complaint status in real-time from pending to resolved with transparent updates
              </p>
            </div>

            <div className="glass-card hover-lift p-6 space-y-3">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto pulse-glow">
                <Users className="w-6 h-6 text-background" />
              </div>
              <h3 className="font-semibold text-lg text-primary">Admin Management</h3>
              <p className="text-sm text-muted-foreground">
                Efficient complaint resolution with advanced admin dashboard and powerful management tools
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="glass-card p-8 mt-16 space-y-6 text-left">
            <h2 className="text-3xl font-bold neon-text text-center mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 gradient-primary rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">File Attachments</h4>
                  <p className="text-sm text-muted-foreground">Upload images and PDFs as proof for your complaints</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 gradient-primary rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Callback Requests</h4>
                  <p className="text-sm text-muted-foreground">Request a direct callback for urgent issues</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 gradient-primary rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Real-time Updates</h4>
                  <p className="text-sm text-muted-foreground">Get instant notifications on status changes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 gradient-primary rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Advanced Filtering</h4>
                  <p className="text-sm text-muted-foreground">Search and filter complaints by category and status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-primary/20 mt-16 glass-card relative z-10">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 Brototype. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;