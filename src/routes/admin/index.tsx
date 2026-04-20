import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/storefront/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

interface Row {
  id: string;
  slug: string;
  name: string;
  price_inr: number | string | null;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  category_id: string | null;
}

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin · Products" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, slug, name, price_inr, is_active, is_featured, image_url, category_id")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    load();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-primary">Products</h1>
        <Link to="/admin/new" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          + Add Product
        </Link>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">No products yet. Add your first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Active</th>
                <th className="p-3">Featured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-secondary" />
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.slug}</div>
                  </td>
                  <td className="p-3 text-foreground">{formatINR(r.price_inr)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(r.id, r.is_active)}
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        r.is_active ? "bg-gold/30 text-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-3">{r.is_featured ? "★" : "—"}</td>
                  <td className="p-3 text-right">
                    <Link to="/admin/$id" params={{ id: r.id }} className="text-primary hover:underline">Edit</Link>
                    <button onClick={() => remove(r.id)} className="ml-3 text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}