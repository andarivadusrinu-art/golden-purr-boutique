import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Save } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password | Aurum" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate({ to: "/admin/login" });
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10"
      >
        <div className="mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent shadow-lg shadow-accent/5"
          >
            <Lock className="h-8 w-8" />
          </motion.div>
          <h1 className="font-serif text-4xl text-foreground">New Password</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Set a secure password for your admin account.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-accent font-medium">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/20"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-accent font-medium">Confirm Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/20"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent py-4 text-sm font-bold text-accent-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-accent/20"
          >
            <Save className="h-5 w-5" />
            {busy ? "Updating..." : "Update Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
