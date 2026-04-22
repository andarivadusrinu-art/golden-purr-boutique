import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

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
    <AdminLayout title="About Page Editor">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-foreground">About Page Content</h1>
          <p className="mt-2 text-muted-foreground">Sculpt the story and heritage of AndarivaduSrinu.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {busy ? "Preserving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.3em] text-accent font-bold">Content Sculptor</h2>
            
            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-xs uppercase tracking-widest text-white/40 font-medium">Hero Title</label>
                <input
                  type="text"
                  required
                  value={about.title}
                  onChange={(e) => setAbout({ ...about, title: e.target.value })}
                  placeholder="e.g., A Legacy of Pure 1 Gram Gold"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-serif text-xl"
                />
              </div>

              <div>
                <label className="mb-3 block text-xs uppercase tracking-widest text-white/40 font-medium">The Narrative (Body Text)</label>
                <textarea
                  required
                  rows={12}
                  value={about.body}
                  onChange={(e) => setAbout({ ...about, body: e.target.value })}
                  placeholder="Tell your brand's story..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all leading-relaxed"
                />
                <p className="mt-2 text-[10px] text-right text-white/20 uppercase tracking-widest">{about.body.length} characters</p>
              </div>

              <div>
                <ImageUpload
                  label="Hero Imagery"
                  value={about.image_url}
                  onChange={(url) => setAbout({ ...about, image_url: url })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-8">
          <div className="sticky top-32 rounded-2xl border border-white/5 bg-black/40 p-1 backdrop-blur-xl shadow-inner">
            <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-accent/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="ml-4 text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Live Storefront Preview</span>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto p-8 bg-background">
              <div className="text-center mb-12">
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-4">Our Heritage</p>
                <h3 className="font-serif text-3xl text-foreground leading-tight">{about.title || "Untitled Masterpiece"}</h3>
              </div>
              
              <div className="grid gap-8">
                {about.image_url && (
                  <div className="aspect-[16/9] rounded-xl overflow-hidden border border-white/5">
                    <img src={about.image_url} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground/80">
                  <p className="first-letter:text-4xl first-letter:font-serif first-letter:text-accent first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                    {about.body || "Begin writing to see your story unfold here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
