import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone } from "lucide-react";
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
}

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchComplaint();
    }
  }, [user, id]);

  const fetchComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setComplaint(data);
    } catch (error: any) {
      toast.error("Failed to fetch complaint details");
      navigate("/student");
    } finally {
      setLoading(false);
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
            onClick={() => navigate("/student")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Complaint Details</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
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
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {complaint.requested_call && complaint.student_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>Callback requested: {complaint.student_phone}</span>
              </div>
            )}

            {complaint.resolution_note && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Resolution Note</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {complaint.resolution_note}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated: {new Date(complaint.updated_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {complaint.status === "pending" && (
              <div className="flex gap-4 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button variant="destructive" className="flex-1">
                  Withdraw
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComplaintDetail;
