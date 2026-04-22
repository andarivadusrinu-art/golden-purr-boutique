import { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/lib/useAdmin";
import { LayoutDashboard, Package, Inbox, Settings, LogOut, ChevronRight, FileText, Star, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const SIDEBAR_LINKS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Collections", icon: Star },
  { to: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { to: "/admin/content", label: "Site Content", icon: FileText },
  { to: "/admin/users", label: "Team", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  if (loading) return <div className="p-8 text-center">Checking authorization...</div>;
  if (!isAdmin) {
    navigate({ to: "/admin/login" });
    return null;
  }

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/" className="font-serif text-xl text-primary font-bold">AndarivaduSrinu</Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{title}</span>
          </div>
        </header>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
