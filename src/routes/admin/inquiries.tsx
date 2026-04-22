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
    <AdminLayout title="Customer Inquiries">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-foreground">Inquiry Vault</h1>
        <p className="mt-2 text-muted-foreground">Manage and respond to customer requests from across the world.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-r-transparent" />
            <p className="text-xs uppercase tracking-widest text-accent font-bold">Consulting the Oracle...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border-2 border-dashed border-white/5 bg-white/5 backdrop-blur-md">
            <Mail className="mx-auto h-16 w-16 text-white/10" />
            <p className="mt-6 text-xl font-serif text-foreground">The vault is empty</p>
            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">No customer messages found yet.</p>
          </div>
        ) : (
          inquiries.map((iq) => (
            <div key={iq.id} className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-accent/30 hover:bg-white/10 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Mail className="h-32 w-32" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {iq.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-foreground group-hover:text-accent transition-colors">{iq.name}</h3>
                      <p className="text-sm text-muted-foreground">{iq.email}</p>
                    </div>
                    <span className={`ml-2 rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                      iq.status === 'new' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {iq.status}
                    </span>
                  </div>

                  <div className="relative rounded-xl bg-black/20 p-6 border border-white/5">
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap italic">
                      "{iq.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                    <Clock className="h-3 w-3" />
                    {format(new Date(iq.created_at), 'PPP p')}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                  {iq.status === 'new' ? (
                    <button
                      onClick={() => updateStatus(iq.id, 'read')}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Read
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(iq.id, 'new')}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                    >
                      <Clock className="h-4 w-4" />
                      Mark New
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(iq.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Archive
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
