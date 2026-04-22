import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password | Aurum" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Reset link sent to your email!");
    }
  }

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
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent shadow-lg shadow-accent/5"
          >
            <KeyRound className="h-8 w-8" />
          </motion.div>
          <h1 className="font-serif text-4xl text-foreground">Forgot Password</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Enter your email to receive a secure reset link.
          </p>
        </div>

        {sent ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="rounded-xl bg-accent/10 border border-accent/20 p-6 text-sm text-accent">
              Check your inbox! We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>.
            </div>
            <Link
              to="/admin/login"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-accent font-medium">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-4 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/20"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent py-4 text-sm font-bold text-accent-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-accent/20"
            >
              {busy ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
