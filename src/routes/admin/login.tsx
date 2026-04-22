import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/useAdmin";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Portal | AndarivaduSrinu" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) navigate({ to: "/admin" });
  }, [loading, session, isAdmin, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (err) throw err;
        setError("Account created. Ask an existing admin to grant you the admin role, then sign in.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-primary px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <Link to="/" className="mb-8 block text-center font-serif text-3xl text-accent font-bold tracking-tight">AndarivaduSrinu</Link>
        <h1 className="text-center font-serif text-xl text-white/90">
          {mode === "signin" ? "Admin Portal Access" : "Create Admin Account"}
        </h1>

        {session && !isAdmin && !loading && (
          <div className="mt-6 space-y-3 rounded-xl bg-white/10 p-4 text-sm text-white/80 border border-white/10">
            <p>Signed in as <span className="font-medium text-white">{session.user.email}</span>, but you don't have admin access.</p>
            <button
              type="button"
              onClick={async () => {
                const { data, error: err } = await supabase.rpc("claim_first_admin");
                if (err) { setError(err.message); return; }
                if (data === true) {
                  window.location.href = "/admin";
                } else {
                  setError("An admin already exists. Ask them to grant you access.");
                }
              }}
              className="rounded-md bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20"
            >
              Claim admin access (first user only)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-white/60 font-medium">Email</label>
            <input
              type="email"
              required
              placeholder="admin@andarivadusrinu.art"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-white/60 font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>

          {error && <p className="rounded-md bg-destructive/20 border border-destructive/20 p-3 text-sm text-destructive-foreground">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-accent px-4 py-3 text-sm font-bold text-accent-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-accent/20"
          >
            {busy ? "Authorizing..." : mode === "signin" ? "Sign In to Dashboard" : "Create Account"}
          </button>

          <div className="flex flex-col gap-4 pt-4 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-xs text-white/40 hover:text-accent transition-colors"
            >
              {mode === "signin" ? "Need credentials? Sign up" : "Already have an account? Sign in"}
            </button>

            <Link
              to="/forgot-password"
              className="text-xs text-white/40 hover:text-accent transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}