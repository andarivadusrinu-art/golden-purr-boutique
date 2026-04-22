import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/storefront/ProductForm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/$id")({
  head: () => ({ meta: [{ title: "Admin · Edit Product" }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) {
        setData({
          id: data.id,
          slug: data.slug,
          name: data.name,
          category_id: data.category_id,
          description: data.description ?? "",
          gold_weight_grams: String(data.gold_weight_grams ?? "1.000"),
          purity: data.purity ?? "22K",
          price_inr: data.price_inr != null ? String(data.price_inr) : "",
          image_url: data.image_url ?? "",
          is_featured: !!data.is_featured,
          is_active: !!data.is_active,
        });
      }
      setLoading(false);
    });
  }, [id]);

  return (
    <AdminLayout title="Refining Masterpiece">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-foreground">Refine Masterpiece</h1>
        <p className="mt-2 text-muted-foreground">Polishing the details of "{data?.name || '...'}"</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-r-transparent" />
          <p className="text-xs uppercase tracking-widest text-accent font-bold">Retrieving the Treasure...</p>
        </div>
      ) : data ? (
        <ProductForm initial={data} />
      ) : (
        <div className="text-center py-24 rounded-2xl border-2 border-dashed border-white/5 bg-white/5 backdrop-blur-md">
          <p className="text-xl font-serif text-foreground">Treasure not found</p>
          <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">The piece you are looking for has vanished from the archive.</p>
        </div>
      )}
    </AdminLayout>
  );
}