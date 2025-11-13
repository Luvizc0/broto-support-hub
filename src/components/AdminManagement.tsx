import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserCog, Shield, User } from "lucide-react";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const AdminManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || "student",
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === "admin" ? "student" : "admin";

      // Delete existing role
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update user role");
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCog className="w-5 h-5 text-primary" />
          <CardTitle className="text-primary">User Management</CardTitle>
        </div>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              {user.role === "admin" ? (
                <Shield className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className={user.role === "admin" ? "neon-border" : ""}
              >
                {user.role}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleRole(user.id, user.role)}
                className="neon-border"
              >
                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
