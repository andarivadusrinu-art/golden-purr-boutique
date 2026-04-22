import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldAlert, UserPlus, LogIn, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({ meta: [{ title: "Accept Invitation | Aurum" }] }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkInvite() {
      // Get current user if any
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Verify invitation
      const { data, error } = await supabase
        .from("admin_invitations")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (error || !data) {
        setInvitation(null);
      } else {
        setInvitation(data);
        setEmail(data.email);
      }
      setLoading(false);
    }
    checkInvite();
  }, [token]);

  async function handleAccept() {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("accept_invitation", { _token: token });
      if (error) throw error;
      if (data === true) {
        toast.success("Welcome! You are now an admin.");
        setAccepted(true);
        setTimeout(() => navigate({ to: "/admin" }), 2000);
      } else {
        throw new Error("Invitation invalid or already used.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      setUser(data.user);
      toast.success("Account created! Now you can accept the invitation.");
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Verifying invitation...</div>;

  if (!invitation && !accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-md rounded-md border border-border bg-card p-8 text-center shadow-xl">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-serif text-2xl text-primary">Invalid Invitation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invitation link is invalid, expired, or has already been used.
          </p>
          <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-md rounded-md border border-border bg-card p-8 text-center shadow-xl">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 font-serif text-2xl text-primary">Invitation Accepted</h1>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl text-primary">Join the Team</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You've been invited to manage <span className="font-medium text-foreground">Aurum 1g Gold</span>.
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="rounded-md bg-secondary/50 p-4 text-center">
              <p className="text-sm text-muted-foreground text-center">Signed in as</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <button
              onClick={handleAccept}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Joining..." : "Accept Invitation & Become Admin"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  readOnly
                  className="w-full rounded-md border border-input bg-muted px-4 py-2 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Choose a Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {busy ? "Creating Account..." : "Create Account & Join"}
              </button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account? <Link to="/admin/login" className="text-primary hover:underline">Sign in first</Link>, then return to this link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
