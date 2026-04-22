import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StorefrontLayout } from "@/components/storefront/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us | AndarivaduSrinu" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      message,
    });

    if (!error) {
      // Trigger email notification
      await supabase.functions.invoke("send-email", {
        body: {
          to: "andarivadusrinu@gmail.com", // Shop owner email
          subject: `New Inquiry from ${name}`,
          html: `
            <div style="font-family: serif; color: #1a1a1a;">
              <h2 style="color: #d4af37;">New Inquiry Received</h2>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>Message:</strong></p>
              <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #d4af37;">
                ${message}
              </div>
            </div>
          `,
        },
      });
    }

    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Thank you! Your message has been sent.");
      setName("");
      setEmail("");
      setMessage("");
    }
  }

  return (
    <StorefrontLayout>
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-4"
          >
            Get In Touch
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-4xl md:text-6xl text-foreground leading-tight"
          >
            Contact Us
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-serif text-3xl text-primary">Inquire About Your Piece</h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Whether you have a question about a specific design or wish to discuss a custom order, we are here to assist you.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">WhatsApp First</h4>
                  <p className="text-sm text-muted-foreground">The fastest way to get current rates and availability.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Email Support</h4>
                  <p className="text-sm text-muted-foreground">For business inquiries and partnership requests.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-widest text-accent font-medium">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-widest text-accent font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/30"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-accent font-medium">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-foreground/30"
                  placeholder="Tell us which piece you are interested in..."
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-md bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 shadow-lg shadow-accent/20"
              >
                {busy ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
