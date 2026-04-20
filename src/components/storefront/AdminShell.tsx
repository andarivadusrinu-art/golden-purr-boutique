import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAdmin } from "@/lib/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate({ to: "/admin/login" });
    }
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-serif text-xl text-primary">Aurum Admin</Link>
            <nav className="hidden gap-5 text-sm md:flex">
              <Link to="/admin" className="text-foreground/80 hover:text-primary" activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-medium" }}>Products</Link>
              <Link to="/admin/new" className="text-foreground/80 hover:text-primary" activeProps={{ className: "text-primary font-medium" }}>Add Product</Link>
              <Link to="/admin/settings" className="text-foreground/80 hover:text-primary" activeProps={{ className: "text-primary font-medium" }}>Settings</Link>
              <Link to="/" className="text-foreground/80 hover:text-primary">View Site →</Link>
            </nav>
          </div>
          <button
            onClick={() => { supabase.auth.signOut().then(() => navigate({ to: "/admin/login" })); }}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}