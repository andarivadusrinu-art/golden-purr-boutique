import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Admin Setup | Aurum" }] }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data, error } = await supabase.from("user_roles").select("id").eq("role", "admin").limit(1);
      if (error) {
        console.error(error);
        setAdminExists(true); // Safety fallback
      } else {
        setAdminExists(data.length > 0);
      }
    }
    checkAdmin();
  }, []);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    if (adminExists) return;
    
    setBusy(true);
    try {
      // 1. Sign up
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Could not create user");

      // 2. Claim admin (using the RPC I already have)
      const { data: claimData, error: claimError } = await supabase.rpc("claim_first_admin");
      
      if (claimError) throw claimError;
      
      if (claimData === true) {
        toast.success("Admin account created and authorized!");
        navigate({ to: "/admin" });
      } else {
        throw new Error("Admin already exists or claim failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  }

  if (adminExists === null) return <div className="flex min-h-screen items-center justify-center">Checking...</div>;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent shadow-lg shadow-accent/5">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl text-foreground">Admin Setup</h1>
          <p className="mt-4 text-base text-muted-foreground">
            {adminExists 
              ? "Initial setup is already complete." 
              : "Create the primary administrator account for your shop."}
          </p>
        </div>

        {adminExists ? (
          <div className="space-y-6 text-center">
            <p className="text-base text-foreground/80">
              An administrator already exists. Please use the login page to access the dashboard.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-6 py-4 text-sm font-bold text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20 transition-all"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-accent font-medium">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/20"
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-accent font-medium">Secure Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/20"
                placeholder="••••••••"
              />
              <p className="mt-1 text-[10px] text-muted-foreground text-center">Minimum 8 characters.</p>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent py-4 text-sm font-bold text-accent-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-accent/20"
            >
              <UserPlus className="h-5 w-5" />
              {busy ? "Setting up..." : "Create Admin Account"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
