import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, X, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

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
  images: string[];
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
      image_url: "", images: [], is_featured: false, is_active: true,
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
      images: f.images,
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
      toast.success(f.id ? "Masterpiece updated!" : "Masterpiece created!");
      navigate({ to: "/admin/products" });
    }
  }

  const addImage = (url: string) => {
    if (!f.image_url) setF({ ...f, image_url: url, images: [...f.images, url] });
    else setF({ ...f, images: [...f.images, url] });
  };

  const removeImage = (index: number) => {
    const newImages = [...f.images];
    const removed = newImages.splice(index, 1)[0];
    let newThumbnail = f.image_url;
    if (removed === f.image_url) {
      newThumbnail = newImages[0] || "";
    }
    setF({ ...f, images: newImages, image_url: newThumbnail });
  };

  return (
    <form onSubmit={submit} className="max-w-5xl space-y-10 rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-md shadow-2xl">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Core Identity</h3>
            <Field label="Title *" value={f.name} onChange={(v) => setF({ ...f, name: v, slug: f.slug || slugify(v) })} />
            <Field label="URL Handle (Slug)" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} placeholder="auto-generated from name" />
            
            <div>
              <label className="mb-3 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Heritage Collection</label>
              <select
                value={f.category_id ?? ""}
                onChange={(e) => setF({ ...f, category_id: e.target.value || null })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
              >
                <option value="" className="bg-background">— Select Collection —</option>
                {cats.map((c) => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Specifications</h3>
            <div className="grid gap-4 grid-cols-2">
              <Field label="Net Weight (g)" type="number" step="0.001" value={f.gold_weight_grams} onChange={(v) => setF({ ...f, gold_weight_grams: v })} />
              <Field label="Purity Level" value={f.purity} onChange={(v) => setF({ ...f, purity: v })} placeholder="22K" />
            </div>
            <Field label="Price (INR) - Optional" type="number" value={f.price_inr} onChange={(v) => setF({ ...f, price_inr: v })} placeholder="Leave empty if hidden" />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-6">Gallery Management</h3>
            <div className="mb-6 grid grid-cols-3 gap-3">
              {f.images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <img src={img} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {img === f.image_url && (
                    <div className="absolute bottom-0 inset-x-0 bg-accent py-1 text-[8px] font-bold text-center text-accent-foreground uppercase tracking-widest">Cover</div>
                  )}
                  {img !== f.image_url && (
                    <button
                      type="button"
                      onClick={() => setF({ ...f, image_url: img })}
                      className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[8px] font-bold text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest"
                    >
                      Set Cover
                    </button>
                  )}
                </div>
              ))}
              <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5">
                <ImageUpload 
                  label="Add Image" 
                  value="" 
                  onChange={(url) => addImage(url)} 
                  hidePreview 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Artisan's Note / Description</label>
            <textarea
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              rows={6}
              maxLength={2000}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all leading-relaxed"
              placeholder="Describe the design heritage, craftsmanship details, and dimensions..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-10 border-t border-white/5 pt-10">
        <label className="flex items-center gap-4 cursor-pointer group">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${f.is_active ? 'bg-accent border-accent' : 'border-white/10 bg-white/5 group-hover:border-accent/50'}`}>
            {f.is_active && <Save className="h-3 w-3 text-accent-foreground" />}
          </div>
          <input 
            type="checkbox" 
            className="hidden"
            checked={f.is_active} 
            onChange={(e) => setF({ ...f, is_active: e.target.checked })} 
          />
          <span className="text-sm font-medium text-foreground uppercase tracking-widest">Publicly Visible</span>
        </label>
        <label className="flex items-center gap-4 cursor-pointer group">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${f.is_featured ? 'bg-accent border-accent' : 'border-white/10 bg-white/5 group-hover:border-accent/50'}`}>
            {f.is_featured && <Save className="h-3 w-3 text-accent-foreground" />}
          </div>
          <input 
            type="checkbox" 
            className="hidden"
            checked={f.is_featured} 
            onChange={(e) => setF({ ...f, is_featured: e.target.checked })} 
          />
          <span className="text-sm font-medium text-foreground uppercase tracking-widest">Featured Piece</span>
        </label>
      </div>

      <div className="flex justify-end gap-4 border-t border-white/5 pt-10">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/products" })}
          className="rounded-xl border border-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground transition-all hover:bg-white/5"
        >
          Abandon Changes
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-accent-foreground shadow-2xl shadow-accent/20 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {busy ? "Preserving..." : f.id ? "Refine Masterpiece" : "Forge Masterpiece"}
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
    <div className="group">
      <label className="mb-3 block text-[10px] uppercase tracking-widest text-white/40 font-bold group-focus-within:text-accent transition-colors">{label}</label>
      <input
        type={type} step={step} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/10 transition-all"
      />
    </div>
  );
}