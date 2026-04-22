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
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-accent/5 blur-[120px] animate-pulse" />
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/10 bg-black/40 p-12 shadow-2xl backdrop-blur-3xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-4 font-serif text-4xl text-foreground tracking-tighter hover:text-accent transition-colors">
            Andarivadu<span className="text-accent">Srinu</span>
          </Link>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-white/10" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">
              {mode === "signin" ? "Council Entrance" : "Admin Genesis"}
            </p>
            <div className="h-px w-8 bg-white/10" />
          </div>
        </div>

        {session && !isAdmin && !loading && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mb-8 overflow-hidden rounded-2xl bg-destructive/10 p-6 text-sm text-destructive-foreground border border-destructive/20"
          >
            <p className="mb-4 flex items-center gap-2 font-medium">
              <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
              Unauthorized Access Detected
            </p>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Signed in as <span className="text-white font-bold">{session.user.email}</span>, but your credentials lack administrative privileges.
            </p>
            <button
              type="button"
              onClick={async () => {
                const { data, error: err } = await supabase.rpc("claim_first_admin");
                if (err) { setError(err.message); return; }
                if (data === true) {
                  window.location.href = "/admin";
                } else {
                  setError("The council is already established. Contact a senior admin for access.");
                }
              }}
              className="w-full rounded-xl bg-destructive/20 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-destructive/30 transition-all border border-destructive/30"
            >
              Claim Founder Rights
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="group">
              <label className="mb-3 block text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold group-focus-within:text-accent transition-colors">Email Address</label>
              <input
                type="email"
                required
                placeholder="curator@andarivadu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/10 transition-all font-light"
              />
            </div>
            
            <div className="group">
              <label className="mb-3 block text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold group-focus-within:text-accent transition-colors">Security Cipher</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/10 transition-all tracking-widest"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive-foreground text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="relative group w-full overflow-hidden rounded-2xl bg-accent p-4 text-[10px] font-black uppercase tracking-[0.4em] text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-accent/20"
          >
            <span className="relative z-10">{busy ? "Verifying..." : mode === "signin" ? "Enter Dashboard" : "Initiate Account"}</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          <div className="flex flex-col gap-6 pt-6 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-[10px] uppercase tracking-widest text-white/20 hover:text-accent transition-all font-bold"
            >
              {mode === "signin" ? "Need credentials? Request Access" : "Authorized already? Portal Entrance"}
            </button>

            <Link
              to="/forgot-password"
              className="text-[10px] uppercase tracking-widest text-white/10 hover:text-white/40 transition-all"
            >
              Recover Forgotten Cipher
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}