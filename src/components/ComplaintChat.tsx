import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  complaint_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
  is_admin?: boolean;
}

interface ComplaintChatProps {
  complaintId: string;
}

export const ComplaintChat = ({ complaintId }: ComplaintChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !complaintId) return;

    // Fetch initial messages
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`complaint_messages_${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaint_messages',
          filter: `complaint_id=eq.${complaintId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages(); // Refetch to get sender info
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, complaintId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // First get all messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("complaint_messages")
        .select("*")
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get unique sender IDs
      const userIds = [...new Set(messagesData.map(m => m.sender_id))];

      // Get sender profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      // Get user roles to determine if sender is admin
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const adminIds = new Set(
        rolesData?.filter(r => r.role === "admin").map(r => r.user_id) || []
      );

      const messagesWithSender = messagesData.map(msg => {
        const profile = profilesMap.get(msg.sender_id);
        return {
          ...msg,
          sender_name: profile?.name || profile?.email || "Unknown",
          is_admin: adminIds.has(msg.sender_id)
        };
      });

      setMessages(messagesWithSender);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("complaint_messages")
        .insert({
          complaint_id: complaintId,
          sender_id: user.id,
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-background/40 backdrop-blur-xl rounded-lg border border-primary/20 shadow-lg shadow-primary/10">
      <div className="p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Chat with Admin
        </h3>
        <p className="text-sm text-muted-foreground">Ask questions about your complaint</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender_id === user?.id ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${
                    msg.is_admin 
                      ? "text-accent" 
                      : "text-primary"
                  }`}>
                    {msg.is_admin ? "Admin" : msg.sender_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(msg.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.sender_id === user?.id
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                      : msg.is_admin
                      ? "bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-foreground"
                      : "bg-background/60 border border-border text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-primary/20 bg-background/40">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send)"
            className="min-h-[60px] resize-none bg-background/60 border-primary/20 focus:border-primary/40"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="h-[60px] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/20"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};