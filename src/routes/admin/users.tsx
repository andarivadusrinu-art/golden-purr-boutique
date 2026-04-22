import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Shield, Mail, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [u, i] = await Promise.all([
      supabase.from("user_roles").select("user_id, role, created_at").eq("role", "admin"),
      supabase.from("admin_invitations").select("*").is("used_at", null).gt("expires_at", new Date().toISOString()),
    ]);
    setAdmins(u.data ?? []);
    setInvitations(i.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setBusy(true);
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { error } = await supabase.from("admin_invitations").insert({
      email: inviteEmail.trim(),
      token,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    });

    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Invitation generated!");
      setInviteEmail("");
      loadData();
    }
  }

  async function revokeAdmin(userId: string) {
    if (!confirm("Are you sure? This user will lose all admin access instantly.")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (error) toast.error(error.message);
    else loadData();
  }

  async function deleteInvitation(id: string) {
    const { error } = await supabase.from("admin_invitations").delete().eq("id", id);
    if (error) toast.error(error.message);
    else loadData();
  }

  function copyInviteLink(token: string, id: string) {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <AdminLayout title="Team Management">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-foreground">Royal Council</h1>
        <p className="mt-2 text-muted-foreground">Manage the curators and architects of your digital kingdom.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Admins List */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-serif text-2xl text-foreground flex items-center gap-3">
              <Shield className="h-6 w-6 text-accent" /> Active Curators
            </h2>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold text-accent uppercase tracking-widest border border-accent/20">
              {admins.length} Admins
            </span>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-r-transparent" />
                <p className="text-[10px] uppercase tracking-widest text-white/20">Identifying Council Members...</p>
              </div>
            ) : admins.map((admin) => (
              <div key={admin.user_id} className="group relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent font-serif text-xl border border-white/5 group-hover:scale-105 transition-transform">
                    {admin.user_id.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">Admin Member</h3>
                    <p className="font-mono text-[10px] text-white/20 truncate max-w-[150px]">{admin.user_id}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-widest text-white/40">Joined {format(new Date(admin.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <button
                  onClick={() => revokeAdmin(admin.user_id)}
                  className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-destructive hover:bg-destructive/20 transition-all opacity-0 group-hover:opacity-100"
                  title="Revoke access"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Invitations Management */}
        <section className="space-y-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-foreground flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-accent" /> Summon New Admin
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">Generate an exclusive portal link for a trusted associate.</p>
            </div>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  required
                  placeholder="associate@andarivadu.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "Forging Link..." : "Generate Invitation"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold">Pending Invitations</h3>
            <div className="grid gap-4">
              {invitations.length === 0 ? (
                <div className="py-8 text-center rounded-2xl border-2 border-dashed border-white/5 bg-white/5">
                  <p className="text-xs text-white/20 uppercase tracking-widest italic">No summons pending.</p>
                </div>
              ) : invitations.map((inv) => (
                <div key={inv.id} className="group relative rounded-xl border border-white/5 bg-black/20 p-5 transition-all hover:bg-black/40">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{inv.email}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        <span>Expires {format(new Date(inv.expires_at), 'PPP')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyInviteLink(inv.token, inv.id)}
                        className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                      >
                        {copiedId === inv.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copiedId === inv.id ? "Copied" : "Copy Link"}
                      </button>
                      <button
                        onClick={() => deleteInvitation(inv.id)}
                        className="rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-destructive hover:bg-destructive/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
