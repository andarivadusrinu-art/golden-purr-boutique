import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Package, Inbox, Star, Settings, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({
    products: 0,
    inquiries: 0,
    categories: 0,
    featured: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [p, i, c, f] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
      ]);

      setStats({
        products: p.count ?? 0,
        inquiries: i.count ?? 0,
        categories: c.count ?? 0,
        featured: f.count ?? 0,
      });
    }
    loadStats();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "text-accent", bg: "bg-accent/10" },
    { label: "New Inquiries", value: stats.inquiries, icon: Inbox, color: "text-accent", bg: "bg-accent/10" },
    { label: "Featured Pieces", value: stats.featured, icon: Star, color: "text-accent", bg: "bg-accent/10" },
    { label: "Shop Settings", value: "Active", icon: Settings, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-accent/30 hover:bg-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{card.label}</p>
                <p className="mt-3 text-4xl font-bold text-foreground font-serif">{card.value}</p>
              </div>
              <div className={`rounded-xl p-4 ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-serif text-3xl text-foreground">Quick Actions</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { to: "/admin/products", title: "Manage Products", desc: "Add or edit jewelry pieces" },
            { to: "/admin/inquiries", title: "Check Inquiries", desc: "View customer messages" },
            { to: "/admin/settings", title: "Site Settings", desc: "Update shop details" }
          ].map((action) => (
            <Link 
              key={action.to}
              to={action.to as any} 
              className="group rounded-2xl border border-white/5 bg-white/5 p-8 transition-all hover:border-accent/20 hover:bg-white/10"
            >
              <p className="font-serif text-xl text-foreground group-hover:text-accent transition-colors">{action.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{action.desc}</p>
              <div className="mt-6 flex items-center text-[10px] uppercase tracking-[0.2em] text-accent font-bold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                Open Page <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}