import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  resolution_note: string | null;
  requested_call: boolean;
  student_phone: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string;
    email: string;
    phone: string;
  };
}

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    if (user && userRole === "admin" && id) {
      fetchComplaint();
    } else if (userRole !== "admin") {
      navigate("/student");
    }
  }, [user, userRole, id]);

  const fetchComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          profiles!inner (
            name,
            email,
            phone
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setComplaint(data as any);
      setNewStatus(data.status);
      setResolutionNote(data.resolution_note || "");
    } catch (error: any) {
      toast.error("Failed to fetch complaint details");
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!complaint) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: newStatus as "pending" | "in_progress" | "resolved",
          resolution_note: resolutionNote || null,
        })
        .eq("id", complaint.id);

      if (error) throw error;

      toast.success("Complaint updated successfully!");
      fetchComplaint();
    } catch (error: any) {
      toast.error("Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Manage Complaint</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Name:</span>
              <span>{complaint.profiles.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{complaint.profiles.email}</span>
            </div>
            {complaint.profiles.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{complaint.profiles.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                <CardDescription>
                  Category: {complaint.category.replace("_", " ")} • Submitted:{" "}
                  {new Date(complaint.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <StatusBadge status={complaint.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {complaint.requested_call && complaint.student_phone && (
              <div className="flex items-center gap-2 text-sm bg-accent/50 p-3 rounded-md">
                <Phone className="w-4 h-4" />
                <span className="font-medium">Callback requested:</span>
                <span>{complaint.student_phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Section */}
        <Card>
          <CardHeader>
            <CardTitle>Update Complaint Status</CardTitle>
            <CardDescription>
              Change the status and add resolution notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution Note</Label>
              <Textarea
                id="resolution"
                placeholder="Add notes about the resolution or actions taken..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={6}
              />
            </div>

            <Button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full"
            >
              {updating ? "Updating..." : "Update Complaint"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminComplaintDetail;
