import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { StorefrontLayout } from "@/components/storefront/Layout";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};
import { ProductCard, type ProductCardData } from "@/components/storefront/ProductCard";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AndarivaduSrinu — Pure 1 Gram Gold Jewellery Online" },
      {
        name: "description",
        content:
          "Shop authentic 1 gram gold jewellery: necklaces, rings, earrings & nose rings. Hallmarked, traditional & modern designs. Enquire instantly on WhatsApp.",
      },
      { property: "og:title", content: "AndarivaduSrinu — Pure 1 Gram Gold Jewellery" },
      {
        property: "og:description",
        content: "Necklaces, rings, earrings and nose rings in pure 1 gram gold. Enquire on WhatsApp.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<ProductCardData[]>([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, slug, name, description")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
    supabase
      .from("products")
      .select("id, slug, name, image_url, price_inr, gold_weight_grams, purity")
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(8)
      .then(({ data }) => setFeatured((data ?? []) as ProductCardData[]));
  }, []);

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-accent/20 blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -bottom-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]" />
        </div>
        <motion.div 
          className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 rounded-full border border-accent/20 bg-accent/5 px-3.5 py-1 backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
              <p className="text-[9px] uppercase tracking-[0.4em] text-accent font-bold">New Collection 2026</p>
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-serif text-4xl leading-[1.1] text-foreground md:text-6xl lg:text-7xl">
              Pure 1 Gram Gold,<br />
              <span className="text-accent italic">Crafted with Heart</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="max-w-md text-base text-foreground/80 leading-relaxed">
              Discover timeless necklaces, rings, earrings and nose rings — every piece a small treasure in the cosmic expanse.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/category/$slug"
                params={{ slug: "necklaces" }}
                className="rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-xl shadow-accent/20 transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              >
                Shop Collection
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "rings" }}
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-accent/30 hover:scale-105 active:scale-95"
              >
                Explore Rings
              </Link>
            </motion.div>
          </div>
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <div className="absolute -inset-8 bg-accent/10 blur-[80px] rounded-full animate-pulse" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=80"
                alt="Elegant 1 gram gold jewellery"
                className="aspect-square w-full object-cover transition-transform duration-[2s] hover:scale-110 md:aspect-square"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center font-serif text-3xl text-primary md:text-4xl">Shop by Category</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Curated collections in pure 1 gram gold
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-[4/5] overflow-hidden rounded-md bg-secondary"
            >
              <img
                src={`https://images.unsplash.com/photo-${
                  c.slug === "necklaces"
                    ? "1599643478518-a784e5dc4c8f"
                    : c.slug === "rings"
                      ? "1605100804763-247f67b3557e"
                      : c.slug === "earrings"
                        ? "1535632787350-4e68ef0ac584"
                        : "1611591437281-460bfbe1220a"
                }?w=600&q=80`}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-foreground">
                <h3 className="font-serif text-xl">{c.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider opacity-90">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-white/5 py-24 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center font-serif text-4xl text-primary">Trending Pieces</h2>
            <p className="mt-4 text-center text-sm text-primary-foreground/60 uppercase tracking-[0.2em]">
              Handpicked favourites from our collections
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Features */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                title: "Hallmarked Quality",
                desc: "Every single piece is BIS Hallmarked, ensuring the purity and authenticity of your 1 gram gold treasure."
              },
              {
                icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
                title: "Direct WhatsApp",
                desc: "No middlemen. Chat directly with us for current gold rates, customization, and seamless ordering."
              },
              {
                icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
                title: "Pan-India Courier",
                desc: "Insured and secure shipping to every corner of India. Your jewelry arrives safely at your doorstep."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-accent/30"
              >
                <div className="mb-6 text-accent group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="font-serif text-2xl text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-accent/10 blur-[120px] rounded-full" />
        <div className="mx-auto max-w-4xl px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/5 p-12 md:p-16 backdrop-blur-xl text-center shadow-2xl"
          >
            <h2 className="font-serif text-4xl text-foreground">Join the Inner Circle</h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Be the first to see our new collections and receive exclusive updates from the heart of our craftsmanship.
            </p>
            <form className="mt-10 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-6 py-4 text-foreground outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-foreground/20"
              />
              <button className="rounded-xl bg-accent px-8 py-4 font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 active:scale-95">
                Subscribe
              </button>
            </form>
            <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground/50">Cosmic Updates · Weekly · Pure Heart</p>
          </motion.div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
