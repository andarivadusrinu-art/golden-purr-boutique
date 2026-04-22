import { Link } from "@tanstack/react-router";
import { formatINR } from "@/lib/format";
import { motion } from "framer-motion";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  price_inr: number | string | null;
  gold_weight_grams: number | string;
  purity: string;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link
        to="/product/$slug"
        params={{ slug: p.slug }}
        className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:shadow-[0_0_30px_rgba(var(--color-accent),0.1)] hover:border-accent/30 backdrop-blur-md"
      >
        <div className="aspect-square w-full overflow-hidden bg-white/5">
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>
        <div className="p-5 border-t border-white/5">
          <h3 className="font-serif text-xl leading-tight text-foreground group-hover:text-accent transition-colors">{p.name}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-accent/80 font-medium">
            {Number(p.gold_weight_grams).toFixed(0)}g · {p.purity} Gold
          </p>
        </div>
      </Link>
    </motion.div>
  );
}