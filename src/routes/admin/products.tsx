import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Package, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Product deleted");
      loadProducts();
    }
  }

  return (
    <AdminLayout title="Inventory Management">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-foreground">Product Archive</h1>
          <p className="mt-2 text-muted-foreground">Manage your collection of pure 1 gram gold masterpieces.</p>
        </div>
        <Link
          to="/admin/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add New Piece
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-r-transparent" />
          <p className="text-xs uppercase tracking-widest text-accent font-bold">Summoning the Inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border-2 border-dashed border-white/5 bg-white/5 backdrop-blur-md">
          <Package className="mx-auto h-16 w-16 text-white/10" />
          <p className="mt-6 text-xl font-serif text-foreground">The archive is empty</p>
          <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">Begin your collection by adding your first masterpiece.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-accent/30 hover:bg-white/10 shadow-xl overflow-hidden">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-black/20">
                {p.image_url ? (
                  <img 
                    src={p.image_url} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={p.name} 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/10">
                    <ImageIcon className="h-16 w-16" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {p.is_active ? (
                    <span className="rounded-full bg-emerald-500/80 backdrop-blur-md px-2.5 py-0.5 text-[8px] font-bold text-white tracking-widest uppercase">Active</span>
                  ) : (
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[8px] font-bold text-white/60 tracking-widest uppercase border border-white/10">Draft</span>
                  )}
                  {p.is_featured && (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-[8px] font-bold text-accent-foreground tracking-widest uppercase">Featured</span>
                  )}
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm">
                  <Link
                    to="/admin/$id"
                    params={{ id: p.id }}
                    className="rounded-full bg-white/20 p-4 text-white backdrop-blur-md hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    <Pencil className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-full bg-white/20 p-4 text-white backdrop-blur-md hover:bg-destructive hover:text-white transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 text-[9px] uppercase tracking-[0.3em] text-accent font-bold">
                  {p.categories?.name || "Uncategorized"}
                </div>
                <h3 className="font-serif text-lg text-foreground line-clamp-1">{p.name}</h3>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-xs text-muted-foreground font-mono">
                    {p.gold_weight_grams}g · {p.purity}
                  </div>
                  {p.price_inr && (
                    <div className="text-sm font-bold text-accent">
                      ₹{Number(p.price_inr).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
