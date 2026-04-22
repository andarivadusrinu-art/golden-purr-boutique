import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const [about, setAbout] = useState({
    title: "",
    body: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("key", "about")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) setAbout(data.content as any);
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "about", content: about });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("About page content updated!");
    }
  }

  if (loading) return <AdminLayout title="Site Content"><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Site Content">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-primary">About Page Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage the text and images on your About page</p>
      </div>

      <div className="max-w-2xl rounded-md border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Page Title</label>
            <input
              type="text"
              required
              value={about.title}
              onChange={(e) => setAbout({ ...about, title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-4 py-2 focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Body Text</label>
            <textarea
              required
              rows={8}
              value={about.body}
              onChange={(e) => setAbout({ ...about, body: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-4 py-2 focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Hero Image URL</label>
            <input
              type="url"
              value={about.image_url}
              onChange={(e) => setAbout({ ...about, image_url: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-4 py-2 focus:ring-2 focus:ring-ring"
              placeholder="https://images.unsplash.com/..."
            />
            {about.image_url && (
              <img src={about.image_url} alt="Preview" className="mt-4 aspect-[4/3] w-48 rounded object-cover border border-border" />
            )}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
