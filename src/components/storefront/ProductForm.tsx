import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

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
  const [error, setError] = useState("");
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
    setError("");
    if (!f.name.trim()) return setError("Name is required");
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
    if (err) return setError(err.message);
    navigate({ to: "/admin" });
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-md border border-border bg-card p-6">
      <Row>
        <Field label="Name *" value={f.name} onChange={(v) => setF({ ...f, name: v, slug: f.slug || slugify(v) })} />
        <Field label="Slug (URL)" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} placeholder="auto from name" />
      </Row>
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          value={f.category_id ?? ""}
          onChange={(e) => setF({ ...f, category_id: e.target.value || null })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— Select —</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <Row>
        <Field label="Weight (g)" type="number" step="0.001" value={f.gold_weight_grams} onChange={(v) => setF({ ...f, gold_weight_grams: v })} />
        <Field label="Purity" value={f.purity} onChange={(v) => setF({ ...f, purity: v })} placeholder="22K" />
        <Field label="Price (INR)" type="number" value={f.price_inr} onChange={(v) => setF({ ...f, price_inr: v })} placeholder="optional" />
      </Row>
      <Field label="Image URL" value={f.image_url} onChange={(v) => setF({ ...f, image_url: v })} placeholder="https://…" />
      {f.image_url && <img src={f.image_url} alt="preview" className="h-32 w-32 rounded-md object-cover border border-border" />}
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
          Active (visible on storefront)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} />
          Featured on home
        </label>
      </div>
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {busy ? "Saving…" : f.id ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => navigate({ to: "/admin" })} className="rounded-md border border-border px-5 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-3">{children}</div>;
}

function Field({ label, value, onChange, placeholder, type = "text", step }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type} step={step} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}