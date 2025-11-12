import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description too long"),
  studentPhone: z.string().optional(),
});

const categories = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "academic", label: "Academic" },
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "hostel", label: "Hostel" },
  { value: "food", label: "Food" },
  { value: "placement", label: "Placement" },
  { value: "other", label: "Other" },
];

const NewComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    requestedCall: false,
    studentPhone: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error("Only images and PDF files are allowed");
        return;
      }
      setSelectedFile(file);
    }
  };

  const generateDescription = async () => {
    if (!formData.title || !formData.category) {
      toast.error("Please enter title and category first");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-description", {
        body: { title: formData.title, category: formData.category }
      });

      if (error) throw error;

      if (data?.description) {
        setFormData({ ...formData, description: data.description });
        toast.success("Description generated successfully!");
      }
    } catch (error: any) {
      console.error("Error generating description:", error);
      toast.error(error.message || "Failed to generate description");
    } finally {
      setGenerating(false);
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("complaint-attachments")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("complaint-attachments")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload file: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = complaintSchema.parse({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        studentPhone: formData.requestedCall ? formData.studentPhone : undefined,
      });

      if (formData.requestedCall && !formData.studentPhone) {
        throw new Error("Phone number is required when requesting a call");
      }

      let attachmentUrl = null;
      if (selectedFile) {
        attachmentUrl = await uploadFile();
        if (!attachmentUrl) {
          throw new Error("Failed to upload attachment");
        }
      }

      const { error } = await supabase.from("complaints").insert({
        student_id: user?.id as string,
        title: validated.title,
        category: validated.category as any,
        description: validated.description,
        requested_call: formData.requestedCall,
        student_phone: formData.requestedCall ? validated.studentPhone : null,
        attachment_url: attachmentUrl,
      });

      if (error) throw error;

      toast.success("Complaint submitted successfully!");
      navigate("/student");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to submit complaint");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
      </div>

      <header className="border-b border-primary/20 glass-card relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/student")}
              className="neon-border hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold neon-text">Submit New Complaint</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <Card className="glass-card hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl neon-text">Complaint Details</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please provide detailed information about your complaint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Complaint Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your complaint"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDescription}
                    disabled={generating || !formData.title || !formData.category}
                    className="neon-border hover:bg-primary/10"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Generate
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your complaint"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Fill in the title and category, then click "AI Generate" for an automatic description
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requestCall"
                  checked={formData.requestedCall}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requestedCall: checked as boolean })
                  }
                />
                <Label htmlFor="requestCall" className="cursor-pointer">
                  Request a callback
                </Label>
              </div>

              {formData.requestedCall && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.studentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, studentPhone: e.target.value })
                    }
                    required={formData.requestedCall}
                    className="neon-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="attachment"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="neon-border"
                  />
                  {selectedFile && (
                    <span className="text-sm text-primary">{selectedFile.name}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload images or PDF (Max 10MB)
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/student")}
                  className="flex-1 neon-border hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || uploading} 
                  className="flex-1 gradient-primary hover-lift"
                >
                  {loading ? "Submitting..." : uploading ? "Uploading..." : "Submit Complaint"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewComplaint;
