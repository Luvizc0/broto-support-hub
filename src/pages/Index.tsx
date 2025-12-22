import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
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
        <LiquidBackground />
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 liquid-button rounded-2xl flex items-center justify-center pulse-glow">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-lg text-glow text-primary">Loading...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <LiquidBackground />

      {/* Header */}
      <motion.header 
        className="glass-card border-b border-primary/10 relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 liquid-button rounded-2xl flex items-center justify-center"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Shield className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-glow text-primary">Brototype</h1>
              <p className="text-xs text-muted-foreground">BCMP</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LiquidButton onClick={() => navigate("/auth")} size="md">
              <Sparkles className="w-4 h-4" />
              Get Started
            </LiquidButton>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <Zap className="w-24 h-24 text-primary" />
                </motion.div>
                <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-glow text-primary">Brototype</span>
              <br />
              <span className="text-foreground">Complaint Management</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              A transparent and efficient platform for students to raise issues and track their resolutions
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <LiquidButton size="lg" onClick={() => navigate("/auth")} glow>
                <Sparkles className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-5 h-5" />
              </LiquidButton>
              <LiquidButton variant="outline" size="lg" onClick={() => navigate("/auth")}>
                Sign In
              </LiquidButton>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {[
              { icon: FileText, title: "Easy Submission", description: "Submit complaints with detailed descriptions and file attachments" },
              { icon: CheckCircle, title: "Track Progress", description: "Monitor your complaint status in real-time with transparent updates" },
              { icon: Users, title: "Admin Management", description: "Efficient complaint resolution with advanced admin dashboard" }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="glass-card liquid-hover light-sweep p-8 space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <motion.div 
                  className="w-14 h-14 liquid-button rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <h3 className="font-semibold text-xl text-primary">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-primary/10 mt-16 relative z-10">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 Brototype. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
