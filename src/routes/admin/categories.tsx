import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "", sort_order: 0 });
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
    };

    if (!payload.name) { toast.error("Name is required"); return; }

    const { error } = id 
      ? await supabase.from("categories").update(payload).eq("id", id)
      : await supabase.from("categories").insert(payload);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(id ? "Category updated" : "Category created");
      setEditingId(null);
      setShowAdd(false);
      loadCategories();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This may affect products in this category.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else loadCategories();
  }

  return (
    <AdminLayout title="Categories">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-primary">Manage Collections</h1>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditForm({ name: "", slug: "", sort_order: categories.length * 10 });
          }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="space-y-4">
        {showAdd && (
          <div className="rounded-md border-2 border-primary bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-medium">New Category</h3>
            <CategoryFields form={editForm} setForm={setEditForm} onSave={() => handleSave()} onCancel={() => setShowAdd(false)} />
          </div>
        )}

        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    {editingId === c.id ? (
                      <td colSpan={4} className="px-6 py-4">
                        <CategoryFields 
                          form={editForm} 
                          setForm={setEditForm} 
                          onSave={() => handleSave(c.id)} 
                          onCancel={() => setEditingId(null)} 
                        />
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.sort_order}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{c.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{c.slug}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingId(c.id);
                                setEditForm({ name: c.name, slug: c.slug, sort_order: c.sort_order });
                              }}
                              className="rounded p-1 text-primary hover:bg-primary/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="rounded p-1 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function CategoryFields({ form, setForm, onSave, onCancel }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-4 md:items-end">
      <div className="md:col-span-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground uppercase">Order</label>
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="md:col-span-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground uppercase">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="md:col-span-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground uppercase">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2 md:col-span-1">
        <button
          onClick={onSave}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
