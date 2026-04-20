import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AdminShell } from "@/components/storefront/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Admin · Settings" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState("");

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
      });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setStatus("");
    const cleaned = whatsapp.replace(/\D/g, "");
    if (cleaned.length < 10) { setStatus("Enter a valid WhatsApp number with country code (e.g. 919876543210)."); return; }
    const { error } = await supabase.from("shop_settings").update({
      shop_name: shopName.trim().slice(0, 100),
      tagline: tagline.trim().slice(0, 200),
      whatsapp_number: cleaned,
    }).eq("id", 1);
    setStatus(error ? `Error: ${error.message}` : "Saved!");
  }

  return (
    <AdminShell>
      <h1 className="mb-6 font-serif text-2xl text-primary">Shop Settings</h1>
      <form onSubmit={save} className="max-w-xl space-y-5 rounded-md border border-border bg-card p-6">
        <Field label="Shop name" value={shopName} onChange={setShopName} maxLength={100} />
        <Field label="Tagline" value={tagline} onChange={setTagline} maxLength={200} />
        <Field
          label="WhatsApp number (with country code, no +)"
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="919876543210"
          maxLength={15}
        />
        <p className="text-xs text-muted-foreground">
          This number receives all product enquiries from customers.
        </p>
        <button type="submit" className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Save Settings
        </button>
        {status && <p className="text-sm text-foreground">{status}</p>}
      </form>
    </AdminShell>
  );
}

function Field({
  label, value, onChange, placeholder, maxLength,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}