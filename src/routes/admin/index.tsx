import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Package, Inbox, Star, Settings } from "lucide-react";

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
    { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "New Inquiries", value: stats.inquiries, icon: Inbox, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Featured Pieces", value: stats.featured, icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Shop Settings", value: "Active", icon: Settings, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
              </div>
              <div className={`rounded-full p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-2xl text-primary">Quick Actions</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link to="/admin/products" className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
            <p className="font-medium text-foreground">Manage Products</p>
            <p className="mt-1 text-sm text-muted-foreground">Add or edit jewelry pieces</p>
          </Link>
          <Link to="/admin/inquiries" className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
            <p className="font-medium text-foreground">Check Inquiries</p>
            <p className="mt-1 text-sm text-muted-foreground">View customer messages</p>
          </Link>
          <Link to="/admin/settings" className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
            <p className="font-medium text-foreground">Site Settings</p>
            <p className="mt-1 text-sm text-muted-foreground">Update shop details</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}