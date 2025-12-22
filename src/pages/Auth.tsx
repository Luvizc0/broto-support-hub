import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { Shield, Sparkles } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({ name: "", email: "", phone: "", password: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = signUpSchema.parse(signUpData);
      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { name: validated.name, phone: validated.phone },
        },
      });
      if (error) throw error;
      toast.success("Account created successfully!");
      navigate("/student");
    } catch (error: any) {
      toast.error(error instanceof z.ZodError ? error.errors[0].message : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = signInSchema.parse(signInData);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });
      if (error) throw error;
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();
      toast.success("Signed in successfully!");
      setTimeout(() => navigate(roleData?.role === "admin" ? "/admin" : "/student"), 100);
    } catch (error: any) {
      toast.error(error instanceof z.ZodError ? error.errors[0].message : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <LiquidBackground />
      
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <div className="w-20 h-20 liquid-button rounded-3xl flex items-center justify-center pulse-glow">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
          </motion.div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-glow text-primary">Brototype BCMP</h1>
            <p className="text-muted-foreground mt-2">Next-Gen Complaint Management Portal</p>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-sm p-1 rounded-xl mb-6">
              <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    className="liquid-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className="liquid-input"
                    required
                  />
                </div>
                <LiquidButton type="submit" className="w-full" disabled={loading}>
                  <Sparkles className="w-4 h-4" />
                  {loading ? "Signing in..." : "Sign In"}
                </LiquidButton>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    className="liquid-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="liquid-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    className="liquid-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="liquid-input"
                    required
                  />
                </div>
                <LiquidButton type="submit" className="w-full" disabled={loading}>
                  <Sparkles className="w-4 h-4" />
                  {loading ? "Creating account..." : "Create Account"}
                </LiquidButton>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.p 
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Secure • Fast • Transparent
        </motion.p>
      </div>
    </div>
  );
};

export default Auth;
