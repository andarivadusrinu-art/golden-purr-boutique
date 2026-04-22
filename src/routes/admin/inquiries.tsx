import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiries,
});

function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInquiries() {
    setLoading(true);
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setInquiries(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Marked as ${status}`);
      loadInquiries();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Inquiry deleted");
      loadInquiries();
    }
  }

  return (
    <AdminLayout title="Inquiries">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-primary">Customer Inquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">Messages sent through the contact form</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-12 text-muted-foreground">Loading inquiries...</p>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-12 rounded-md border border-dashed border-border bg-card">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No inquiries found.</p>
          </div>
        ) : (
          inquiries.map((iq) => (
            <div key={iq.id} className="rounded-md border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{iq.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      iq.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {iq.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{iq.email}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{iq.message}</p>
                  <p className="mt-4 text-[10px] text-muted-foreground">
                    Received on {format(new Date(iq.created_at), 'PPP p')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {iq.status === 'new' ? (
                    <button
                      onClick={() => updateStatus(iq.id, 'read')}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark Read
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(iq.id, 'new')}
                      className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Mark Unread
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(iq.id)}
                    className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
