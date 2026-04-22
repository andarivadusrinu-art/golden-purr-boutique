import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, X, Image as ImageIcon } from "lucide-react";

interface Category { id: string; name: string }
interface ProductFormData {
  id?: string;
  slug: string;
  name: string;
  category_id: string | null;
  description: string;
  gold_weight_grams: string;
  purity: string;
  price_inr: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function ProductForm({ initial }: { initial?: ProductFormData }) {
  const navigate = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<ProductFormData>(
    initial ?? {
      slug: "", name: "", category_id: null, description: "",
      gold_weight_grams: "1.000", purity: "22K", price_inr: "",
      image_url: "", is_featured: false, is_active: true,
    },
  );

  useEffect(() => {
    supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => setCats(data ?? []));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) { toast.error("Name is required"); return; }
    
    const slug = f.slug.trim() || slugify(f.name);
    setBusy(true);
    
    const payload = {
      name: f.name.trim().slice(0, 200),
      slug,
      category_id: f.category_id,
      description: f.description.trim().slice(0, 2000) || null,
      gold_weight_grams: Number(f.gold_weight_grams) || 1,
      purity: f.purity.trim().slice(0, 20),
      price_inr: f.price_inr ? Number(f.price_inr) : null,
      image_url: f.image_url.trim() || null,
      is_featured: f.is_featured,
      is_active: f.is_active,
    };
    
    const { error: err } = f.id
      ? await supabase.from("products").update(payload).eq("id", f.id)
      : await supabase.from("products").insert(payload);
      
    setBusy(false);
    if (err) {
      toast.error(err.message);
    } else {
      toast.success(f.id ? "Product updated!" : "Product created!");
      navigate({ to: "/admin/products" });
    }
  }

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-8 rounded-md border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Field label="Name *" value={f.name} onChange={(v) => setF({ ...f, name: v, slug: f.slug || slugify(v) })} />
          <Field label="Slug (URL)" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} placeholder="auto-generated from name" />
          
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Category</label>
            <select
              value={f.category_id ?? ""}
              onChange={(e) => setF({ ...f, category_id: e.target.value || null })}
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
            >
              <option value="">— Select Category —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <Field label="Weight (g)" type="number" step="0.001" value={f.gold_weight_grams} onChange={(v) => setF({ ...f, gold_weight_grams: v })} />
            <Field label="Purity" value={f.purity} onChange={(v) => setF({ ...f, purity: v })} placeholder="22K" />
          </div>

          <Field label="Price (INR) - Optional" type="number" value={f.price_inr} onChange={(v) => setF({ ...f, price_inr: v })} placeholder="Leave empty if hidden" />
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Product Description</label>
            <textarea
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              rows={6}
              maxLength={2000}
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
              placeholder="Describe the design, craftsmanship, and dimensions..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Image URL</label>
            <input
              type="url"
              value={f.image_url}
              onChange={(v) => setF({ ...f, image_url: v.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-secondary/20">
              {f.image_url ? (
                <img src={f.image_url} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-8 w-8 opacity-20" />
                  <p className="mt-2 text-xs">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 border-t border-border pt-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={f.is_active} 
            onChange={(e) => setF({ ...f, is_active: e.target.checked })} 
          />
          <span className="text-sm font-medium text-foreground">Active (Visible to customers)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={f.is_featured} 
            onChange={(e) => setF({ ...f, is_featured: e.target.checked })} 
          />
          <span className="text-sm font-medium text-foreground">Featured (Show on home page)</span>
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/products" })}
          className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving..." : f.id ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", step }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type} step={step} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}