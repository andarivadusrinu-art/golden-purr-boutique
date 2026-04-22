import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.q ? `Search for "${loaderData.q}" | Aurum` : "Search | Aurum" }] }),
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
        <div className="flex items-center gap-4 border-b border-border pb-8">
          <div className="rounded-full bg-secondary p-4">
            <SearchIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-primary">Search Results</h1>
            <p className="text-sm text-muted-foreground">
              {q ? `Showing results for "${q}"` : "Enter a search term above"}
            </p>
          </div>
        </div>

        <div className="mt-10">
          {loading ? (
            <p className="text-center py-24 text-muted-foreground">Searching...</p>
          ) : !q ? (
            <p className="text-center py-24 text-muted-foreground italic">Start typing to find jewelry pieces.</p>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-medium text-foreground">No pieces found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search term.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
