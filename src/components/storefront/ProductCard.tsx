import { Link } from "@tanstack/react-router";
import { formatINR } from "@/lib/format";

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
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group block overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square w-full overflow-hidden bg-secondary/40">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg leading-tight text-foreground">{p.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-gold">
          {Number(p.gold_weight_grams).toFixed(0)}g · {p.purity}
        </p>
      </div>
    </Link>
  );
}