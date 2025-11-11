import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Phone, Mail, Download, Image as ImageIcon } from "lucide-react";
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
  attachment_url: string | null;
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

  const handleDownload = async () => {
    if (!complaint?.attachment_url) return;
    
    try {
      const response = await fetch(complaint.attachment_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complaint-${complaint.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download attachment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="neon-text">Loading...</div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <header className="border-b border-primary/20 glass-card relative z-10">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-2 neon-border hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold neon-text">Manage Complaint</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6 relative z-10">
        {/* Student Info */}
        <Card className="glass-card hover-lift">
          <CardHeader>
            <CardTitle className="text-primary">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary">Name:</span>
              <span>{complaint.profiles.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>{complaint.profiles.email}</span>
            </div>
            {complaint.profiles.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{complaint.profiles.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card className="glass-card hover-lift">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-2xl neon-text">{complaint.title}</CardTitle>
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
              <h3 className="font-semibold mb-2 text-primary">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {complaint.attachment_url && (
              <div className="neon-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Attachment
                </h3>
                <img 
                  src={complaint.attachment_url} 
                  alt="Complaint attachment" 
                  className="w-full rounded-lg max-h-96 object-contain bg-muted/20"
                />
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full neon-border hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Attachment
                </Button>
              </div>
            )}

            {complaint.requested_call && complaint.student_phone && (
              <div className="flex items-center gap-2 text-sm neon-border rounded-lg p-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-medium">Callback requested:</span>
                <span>{complaint.student_phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Section */}
        <Card className="glass-card hover-lift">
          <CardHeader>
            <CardTitle className="text-primary">Update Complaint Status</CardTitle>
            <CardDescription>
              Change the status and add resolution notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status" className="neon-border">
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
                className="neon-border"
              />
            </div>

            <Button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full gradient-primary hover-lift"
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