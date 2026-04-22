import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StorefrontLayout } from "@/components/storefront/Layout";
import { ProductCard, type ProductCardData } from "@/components/storefront/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: ({ deps: { q } }) => ({ q }),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.q ? `Search for "${loaderData.q}" | AndarivaduSrinu` : "Search | AndarivaduSrinu" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      return;
    }

    setLoading(true);
    supabase
      .from("products")
      .select("id, slug, name, image_url, price_inr, gold_weight_grams, purity")
      .ilike("name", `%${q}%`)
      .eq("is_active", true)
      .limit(20)
      .then(({ data }) => {
        setProducts((data ?? []) as ProductCardData[]);
        setLoading(false);
      });
  }, [q]);

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 border-b border-border pb-8"
        >
          <div className="rounded-full bg-primary/10 p-4">
            <SearchIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-primary">Search Results</h1>
            <p className="text-sm text-muted-foreground">
              {q ? `Showing results for "${q}"` : "Enter a search term in the header to find pieces"}
            </p>
          </div>
        </motion.div>

        <div className="mt-10">
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Searching our collections...</p>
            </div>
          ) : !q ? (
            <p className="text-center py-24 text-muted-foreground italic">Start searching to find your perfect jewelry.</p>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <p className="text-lg font-medium text-foreground">No pieces found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or explore our categories.</p>
            </motion.div>
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
      </div>
    </StorefrontLayout>
  );
}
