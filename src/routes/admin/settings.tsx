import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Admin · Settings" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("shop_settings")
      .select("shop_name, tagline, whatsapp_number")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setShopName(data.shop_name);
          setTagline(data.tagline);
          setWhatsapp(data.whatsapp_number);
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const cleaned = whatsapp.replace(/\D/g, "");
    if (cleaned.length < 10) { 
      toast.error("Enter a valid WhatsApp number with country code."); 
      setBusy(false);
      return; 
    }
    const { error } = await supabase.from("shop_settings").update({
      shop_name: shopName.trim().slice(0, 100),
      tagline: tagline.trim().slice(0, 200),
      whatsapp_number: cleaned,
    }).eq("id", 1);
    
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Settings saved!");
    }
  }

  if (loading) return <AdminLayout title="Settings"><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Shop Settings">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-foreground">Shop Configuration</h1>
        <p className="mt-2 text-muted-foreground">Orchestrate your brand identity and communication channels.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.3em] text-accent font-bold">Brand Identity</h2>
            
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Shop Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-serif text-xl"
                />
              </div>
              
              <div>
                <label className="mb-3 block text-[10px] uppercase tracking-widest text-white/40 font-bold">Brand Tagline</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.3em] text-accent font-bold">Communication Hub</h2>
            
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-[10px] uppercase tracking-widest text-white/40 font-bold">WhatsApp Business Number</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-accent font-bold">+</span>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="919876543210"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-6 py-4 text-foreground placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-mono"
                  />
                </div>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  This number serves as the primary bridge between you and your customers. All product enquiries will be routed here.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={busy}
              className="group flex items-center gap-3 rounded-xl bg-accent px-10 py-4 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {busy ? "Preserving..." : "Save Configuration"}
            </button>
          </div>
        </form>

        {/* Informational Sidebar */}
        <div className="hidden lg:block space-y-8">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-8">
            <h3 className="font-serif text-2xl text-foreground mb-4">Configuration Guide</h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Your shop settings define the core of your digital storefront's identity.</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><span className="text-accent">Shop Name</span> appears in browser tabs and emails.</li>
                <li><span className="text-accent">Tagline</span> is featured in the home page hero section.</li>
                <li><span className="text-accent">WhatsApp</span> must include the country code for global connectivity.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}