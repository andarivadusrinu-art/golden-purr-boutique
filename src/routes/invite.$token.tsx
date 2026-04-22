import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldAlert, UserPlus, LogIn, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({ meta: [{ title: "Accept Invitation | AndarivaduSrinu" }] }),
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
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Realtime listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    async function checkInvite() {
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

    return () => subscription.unsubscribe();
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

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-r-transparent" />
    </div>
  );

  if (!invitation && !accepted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-destructive/10 blur-[120px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10"
        >
          <ShieldAlert className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-6 font-serif text-4xl text-white">Invalid Link</h1>
          <p className="mt-4 text-white/60">
            This invitation link is invalid, expired, or has already been used.
          </p>
          <Link to="/" className="mt-8 inline-block rounded-xl bg-white/10 px-8 py-3 text-sm font-medium text-white hover:bg-white/20 transition-all">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl md:p-10"
        >
          <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
          <h1 className="mt-6 font-serif text-4xl text-white">Welcome Aboard!</h1>
          <p className="mt-4 text-white/60">Your admin account is ready. Redirecting you to the dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10"
      >
        <div className="mb-10 text-center">
          <Link to="/" className="mb-8 block text-center font-serif text-3xl text-accent font-bold tracking-tight">AndarivaduSrinu</Link>
          <h1 className="font-serif text-2xl text-white">Join the Team</h1>
          <p className="mt-3 text-white/60">
            You've been invited to manage the **AndarivaduSrinu** storefront.
          </p>
        </div>

        {user ? (
          <div className="space-y-8">
            <div className="rounded-xl bg-white/5 border border-white/10 p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Authenticated as</p>
              <p className="text-lg font-medium text-white">{user.email}</p>
            </div>
            <button
              onClick={handleAccept}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-accent px-6 py-4 text-sm font-bold text-accent-foreground hover:opacity-90 disabled:opacity-60 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
            >
              {busy ? "Authorizing..." : "Accept Invitation & Join Team"}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-white/60 font-medium">Invitation Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  readOnly
                  className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-white/60 font-medium">Create Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-accent px-6 py-4 text-sm font-bold text-accent-foreground hover:opacity-90 disabled:opacity-60 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4" />
                {busy ? "Creating Account..." : "Create Account & Join"}
              </button>
            </form>
            <p className="text-center text-xs text-white/40">
              Already have an account? <Link to="/admin/login" className="text-accent hover:underline">Sign in first</Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
