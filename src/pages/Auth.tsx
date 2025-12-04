import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

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
          data: {
            name: validated.name,
            phone: validated.phone,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created successfully!");
      navigate("/student");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to create account");
      }
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

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching role:", roleError);
      }

      toast.success("Signed in successfully!");
      
      setTimeout(() => {
        if (roleData?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/student");
        }
      }, 100);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Cyber grid overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center pulse-glow">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -inset-1 gradient-primary rounded-2xl blur-lg opacity-50" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold neon-text">Brototype BCMP</h1>
            <p className="text-muted-foreground">
              Next-Gen Complaint Management Portal
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="hover-lift animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm p-1 rounded-xl">
                <TabsTrigger 
                  value="signin" 
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)] transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)] transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      required
                      className="bg-muted/50 border-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({ ...signInData, password: e.target.value })
                      }
                      required
                      className="bg-muted/50 border-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="cyber" disabled={loading}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.name}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, name: e.target.value })
                      }
                      required
                      className="bg-muted/50 border-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                      className="bg-muted/50 border-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={signUpData.phone}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, phone: e.target.value })
                      }
                      required
                      className="bg-muted/50 border-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, password: e.target.value })
                      }
                      required
                      className="bg-muted/50 border-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="cyber" disabled={loading}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Secure • Fast • Transparent
        </p>
      </div>
    </div>
  );
};

export default Auth;
