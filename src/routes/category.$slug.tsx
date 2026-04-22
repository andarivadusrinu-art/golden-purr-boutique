import { createFileRoute, notFound } from "@tanstack/react-router";
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

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const { data: cat } = await supabase
      .from("categories")
      .select("id, slug, name, description")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!cat) throw notFound();
    return { category: cat as Category };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — 1 Gram Gold | Aurum` },
          {
            name: "description",
            content:
              loaderData.category.description ??
              `Shop ${loaderData.category.name} in pure 1 gram gold.`,
          },
          { property: "og:title", content: `${loaderData.category.name} — Aurum 1g Gold` },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <StorefrontLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl text-primary">Category not found</h1>
      </div>
    </StorefrontLayout>
  ),
  component: CategoryPage,
});

import { motion } from "framer-motion";

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("products")
      .select("id, slug, name, image_url, price_inr, gold_weight_grams, purity")
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data ?? []) as ProductCardData[]);
        setLoading(false);
      });
  }, [category.id]);

  return (
    <StorefrontLayout>
      <div className="border-b border-white/5 bg-white/5 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl px-4 py-12 text-center md:py-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Collection</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">{category.description}</p>
          )}
        </motion.div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No products yet in this collection.</p>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </motion.div>
        )}
      </div>
    </StorefrontLayout>
  );
}