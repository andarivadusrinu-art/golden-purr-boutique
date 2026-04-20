import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/storefront/AdminShell";
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
    <AdminShell>
      <h1 className="mb-6 font-serif text-2xl text-primary">Edit Product</h1>
      {loading ? <p>Loading…</p> : data ? <ProductForm initial={data} /> : <p>Not found.</p>}
    </AdminShell>
  );
}