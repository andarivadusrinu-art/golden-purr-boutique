import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StorefrontLayout } from "@/components/storefront/Layout";
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
      { title: "Aurum 1g Gold — Pure 1 Gram Gold Jewellery Online" },
      {
        name: "description",
        content:
          "Shop authentic 1 gram gold jewellery: necklaces, rings, earrings & nose rings. Hallmarked, traditional & modern designs. Enquire instantly on WhatsApp.",
      },
      { property: "og:title", content: "Aurum 1g Gold — Pure 1 Gram Gold Jewellery" },
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
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary/60">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold">Hallmarked · 22K · 1 Gram</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-primary md:text-6xl">
              Pure 1 Gram Gold,<br />Crafted with Heart
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Discover timeless necklaces, rings, earrings and nose rings — every piece a small treasure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/category/$slug"
                params={{ slug: "necklaces" }}
                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Shop Collection
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "rings" }}
                className="rounded-md border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Explore Rings
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=80"
              alt="Elegant 1 gram gold jewellery"
              className="aspect-[3/2] w-full rounded-md object-cover shadow-2xl md:aspect-video"
            />
          </div>
        </div>
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
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <h3 className="font-serif text-xl">{c.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider opacity-90">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-secondary/40 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center font-serif text-3xl text-primary md:text-4xl">Featured Pieces</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Handpicked favourites from our collection
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </StorefrontLayout>
  );
}
