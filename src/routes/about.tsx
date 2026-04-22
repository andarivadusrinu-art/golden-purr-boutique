import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StorefrontLayout } from "@/components/storefront/Layout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Our Story | AndarivaduSrinu" }] }),
  component: AboutPage,
});

function AboutPage() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("key", "about")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setContent(data.content);
      });
  }, []);

  if (!content) return (
    <StorefrontLayout>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    </StorefrontLayout>
  );

  return (
    <StorefrontLayout>
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-4"
          >
            Our Heritage
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-4xl md:text-6xl text-foreground leading-tight"
          >
            {content.title}
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground/90">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                {content.body}
              </p>
            </div>
            <div className="pt-8 border-t border-white/10">
              <p className="font-serif italic text-accent text-xl">"Every piece tells a story of tradition and timeless elegance."</p>
            </div>
          </motion.div>
          
          {content.image_url && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-accent/10 blur-2xl rounded-full" />
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={content.image_url}
                  alt="Our Story"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-1000 hover:scale-110"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white/5 py-24 backdrop-blur-sm border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-4">Core Principles</p>
            <h2 className="font-serif text-4xl text-foreground">What Defines Us</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Authentic Tradition",
                desc: "We celebrate the rich heritage of Indian jewelry, preserving traditional motifs while embracing modern aesthetics."
              },
              {
                title: "Uncompromising Purity",
                desc: "Trust is the foundation of our brand. Every 1 gram gold piece is crafted with meticulous attention to hallmarked purity."
              },
              {
                title: "Personal Connection",
                desc: "We believe in direct communication. No algorithms, just real people helping you find your next small treasure."
              }
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-accent/20 transition-all"
              >
                <h3 className="font-serif text-2xl text-accent mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <h2 className="font-serif text-4xl text-foreground leading-tight">The 1 Gram Promise</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Luxury shouldn't be out of reach. Our mission is to provide high-quality, hallmarked 1 gram gold jewelry that feels as premium as it looks, allowing you to adorn yourself with confidence and grace.
              </p>
              <div className="flex items-center gap-4 text-accent font-serif text-xl italic">
                <span>✓ BIS Hallmarked</span>
                <span>✓ Insured Shipping</span>
                <span>✓ Expert Support</span>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573408302185-9127ff5f6ad3?w=800&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" />
                <span className="relative z-10 text-[10px] uppercase tracking-[0.6em] text-white font-bold bg-black/40 px-6 py-3 backdrop-blur-md rounded-full border border-white/20">Handcrafted Excellence</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="font-serif text-5xl text-foreground">Start Your Journey</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Ready to find a piece that resonates with your soul? Explore our collections or reach out for personalized assistance.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link to="/category/$slug" params={{ slug: "necklaces" }} className="rounded-xl bg-accent px-10 py-4 font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 active:scale-95">
                Explore Shop
              </Link>
              <Link to="/contact" className="rounded-xl border border-white/10 bg-white/5 px-10 py-4 font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
