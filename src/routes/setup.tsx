import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, ArrowRight } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl text-primary">Admin Setup</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {adminExists 
              ? "Initial setup is already complete." 
              : "Create the primary administrator account for your shop."}
          </p>
        </div>

        {adminExists ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-foreground">
              An administrator already exists. Please use the login page to access the dashboard.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Secure Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Minimum 8 characters.</p>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {busy ? "Setting up..." : "Create Admin Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
