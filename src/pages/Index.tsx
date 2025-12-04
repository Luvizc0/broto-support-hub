import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, FileText, CheckCircle, Users, Sparkles, Zap, ArrowRight } from "lucide-react";

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center pulse-glow">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="neon-text text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-20" />

      {/* Header */}
      <header className="border-b border-primary/20 bg-background/60 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center pulse-glow">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold neon-text">Brototype</h1>
              <p className="text-xs text-muted-foreground">BCMP</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={() => navigate("/auth")} variant="cyber">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Hero Section */}
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Zap className="w-24 h-24 text-primary float-animation" />
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="neon-text">Brototype</span>
              <br />
              <span className="text-foreground">Complaint Management</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A transparent and efficient platform for students to raise issues and track their resolutions with cutting-edge technology
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                variant="cyber"
                className="text-lg px-8 py-6"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              {
                icon: FileText,
                title: "Easy Submission",
                description: "Submit complaints with detailed descriptions, file attachments, and categorization for faster resolution"
              },
              {
                icon: CheckCircle,
                title: "Track Progress",
                description: "Monitor your complaint status in real-time from pending to resolved with transparent updates"
              },
              {
                icon: Users,
                title: "Admin Management",
                description: "Efficient complaint resolution with advanced admin dashboard and powerful management tools"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card hover-lift p-8 space-y-4 group"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="relative w-14 h-14">
                  <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center pulse-glow group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-xl text-primary">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Key Features Section */}
          <div className="glass-card p-10 space-y-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <h2 className="text-3xl font-bold neon-text mb-2">Key Features</h2>
              <div className="w-24 h-1 gradient-primary mx-auto rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "File Attachments", desc: "Upload images and PDFs as proof for your complaints" },
                { title: "Callback Requests", desc: "Request a direct callback for urgent issues" },
                { title: "Real-time Updates", desc: "Get instant notifications on status changes" },
                { title: "Advanced Filtering", desc: "Search and filter complaints by category and status" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors">
                  <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-background/60 backdrop-blur-xl mt-16 relative z-10">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 Brototype. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
