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
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Admins List */}
        <section>
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-primary flex items-center gap-2">
              <Shield className="h-5 w-5" /> Active Admins
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">People who have full access to this dashboard</p>
          </div>
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">User ID / Email</th>
                  <th className="px-6 py-4 font-medium">Added</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : admins.map((admin) => (
                  <tr key={admin.user_id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-muted-foreground truncate max-w-[150px]" title={admin.user_id}>
                        {admin.user_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {format(new Date(admin.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => revokeAdmin(admin.user_id)}
                        className="rounded p-1 text-destructive hover:bg-destructive/10"
                        title="Revoke access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Invitations Management */}
        <section className="space-y-8">
          <div>
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-primary flex items-center gap-2">
                <UserPlus className="h-5 w-5" /> Invite New Admin
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Send an invitation to someone you trust</p>
            </div>
            <form onSubmit={handleInvite} className="flex gap-2 p-4 rounded-md border border-border bg-card shadow-sm">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="new-admin@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Generating..." : "Generate Link"}
              </button>
            </form>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Pending Invitations</h3>
            <div className="space-y-3">
              {invitations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No pending invitations.</p>
              ) : invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-md border border-border bg-card p-4 shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.email}</p>
                    <p className="text-[10px] text-muted-foreground">Expires {format(new Date(inv.expires_at), 'PPP p')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyInviteLink(inv.token, inv.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                    >
                      {copiedId === inv.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copiedId === inv.id ? "Copied" : "Copy Link"}
                    </button>
                    <button
                      onClick={() => deleteInvitation(inv.id)}
                      className="rounded-md border border-destructive/20 bg-destructive/5 p-1.5 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
