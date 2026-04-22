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
    <AdminLayout title="Settings">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-primary">Shop Configuration</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your shop name and WhatsApp contact details</p>
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-6 rounded-md border border-border bg-card p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Shop Name</label>
          <input
            type="text"
            required
            maxLength={100}
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Tagline</label>
          <input
            type="text"
            required
            maxLength={200}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">WhatsApp Number (with country code, no +)</label>
          <input
            type="text"
            required
            maxLength={15}
            placeholder="919876543210"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            This number receives all product enquiries and contact form messages.
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={busy}
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </AdminLayout>
  );
}