import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X, Star, ChevronRight, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "", sort_order: 0, description: "", image_url: "" });
  const [showAdd, setShowAdd] = useState(false);

  async function loadCategories() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, []);

  async function handleSave(id?: string) {
    const payload = {
      name: editForm.name.trim(),
      slug: editForm.slug.trim() || editForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      sort_order: editForm.sort_order,
      description: editForm.description.trim() || null,
      image_url: editForm.image_url.trim() || null,
    };

    if (!payload.name) { toast.error("Name is required"); return; }

    const { error } = id 
      ? await supabase.from("categories").update(payload).eq("id", id)
      : await supabase.from("categories").insert(payload);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(id ? "Collection refined" : "Collection created");
      setEditingId(null);
      setShowAdd(false);
      loadCategories();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This may affect products in this collection.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else loadCategories();
  }

  return (
    <AdminLayout title="Collection Management">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-foreground">Curated Collections</h1>
          <p className="mt-2 text-muted-foreground">Define the chapters of your brand story.</p>
        </div>
        {!showAdd && (
          <button
            onClick={() => {
              setShowAdd(true);
              setEditForm({ name: "", slug: "", sort_order: categories.length * 10, description: "", image_url: "" });
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Add Collection
          </button>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {showAdd && (
          <div className="rounded-2xl border-2 border-accent/50 bg-accent/5 p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <h3 className="mb-6 font-serif text-xl text-accent uppercase tracking-widest">New Masterpiece Collection</h3>
            <CategoryFields form={editForm} setForm={setEditForm} onSave={() => handleSave()} onCancel={() => setShowAdd(false)} />
          </div>
        )}

        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-r-transparent" />
            <p className="text-xs uppercase tracking-widest text-accent font-bold">Consulting the Curator...</p>
          </div>
        ) : categories.length === 0 && !showAdd ? (
          <div className="col-span-full text-center py-24 rounded-2xl border-2 border-dashed border-white/5 bg-white/5 backdrop-blur-md">
            <Star className="mx-auto h-16 w-16 text-white/10" />
            <p className="mt-6 text-xl font-serif text-foreground">No collections yet</p>
            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">Create your first collection to organize your treasures.</p>
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="group relative rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-accent/30 hover:bg-white/10 shadow-xl overflow-hidden flex flex-col">
              {editingId === c.id ? (
                <div className="p-8 animate-in fade-in duration-300">
                  <h3 className="mb-6 font-serif text-xl text-accent uppercase tracking-widest">Refining Collection</h3>
                  <CategoryFields 
                    form={editForm} 
                    setForm={setEditForm} 
                    onSave={() => handleSave(c.id)} 
                    onCancel={() => setEditingId(null)} 
                  />
                </div>
              ) : (
                <>
                  <div className="relative aspect-video overflow-hidden bg-black/20">
                    {c.image_url ? (
                      <img 
                        src={c.image_url} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={c.name} 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/5">
                        <ImageIcon className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditForm({ 
                            name: c.name, 
                            slug: c.slug, 
                            sort_order: c.sort_order,
                            description: c.description || "",
                            image_url: c.image_url || ""
                          });
                        }}
                        className="rounded-lg bg-black/40 backdrop-blur-md p-2 text-white/60 hover:text-accent hover:bg-black/60 transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="rounded-lg bg-black/40 backdrop-blur-md p-2 text-white/60 hover:text-destructive hover:bg-black/60 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="relative p-8 flex flex-1 flex-col">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Order #{c.sort_order}</span>
                    </div>

                    <h3 className="font-serif text-3xl text-foreground group-hover:text-accent transition-colors">{c.name}</h3>
                    <p className="mt-2 text-xs text-muted-foreground font-mono opacity-60">/{c.slug}</p>
                    
                    {c.description && (
                      <p className="mt-4 text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
                        "{c.description}"
                      </p>
                    )}
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Active Collection</span>
                      <ChevronRight className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

function CategoryFields({ form, setForm, onSave, onCancel }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-3">
        <div className="col-span-1">
          <label className="mb-2 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Rank</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-2 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Collection Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            placeholder="e.g., Heritage Gold"
          />
        </div>
      </div>
      
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Inspiration / Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 h-24"
          placeholder="Brief story of this collection..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Slug (URL Handle)</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            placeholder="auto-generated"
          />
        </div>
        <div className="flex flex-col justify-end">
          <ImageUpload 
            label="Collection Cover"
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/5">
        <button
          onClick={onSave}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90"
        >
          <Save className="h-4 w-4" /> Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
