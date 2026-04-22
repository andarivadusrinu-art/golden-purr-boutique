import { ReactNode, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/lib/useAdmin";
import { LayoutDashboard, Package, Inbox, Settings, LogOut, ChevronRight, FileText, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
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

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/admin/login" });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-r-transparent" />
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-sidebar text-sidebar-foreground md:flex shadow-2xl overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent blur-[100px]" />
        </div>

        <div className="relative z-10 flex h-20 items-center border-b border-white/5 px-6">
          <Link to="/" className="font-serif text-2xl text-accent font-bold tracking-tight hover:opacity-80 transition-opacity">
            AndarivaduSrinu
          </Link>
        </div>
        
        <nav className="relative z-10 flex-1 space-y-1 p-4 mt-4">
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/admin" }}
              className="group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
            >
              {({ isActive }) => (
                <>
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${isActive ? "bg-accent/10 border border-accent/20 shadow-lg shadow-accent/5" : "group-hover:bg-white/5"}`} />
                  <link.icon className={`relative z-10 h-4.5 w-4.5 transition-colors ${isActive ? "text-accent" : "text-foreground/40 group-hover:text-foreground"}`} />
                  <span className={`relative z-10 transition-colors ${isActive ? "text-accent font-bold" : "text-foreground/60 group-hover:text-foreground"}`}>
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-pill"
                      className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                    />
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 border-t border-white/5 p-4">
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 bg-background relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl px-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="uppercase tracking-widest text-[10px] font-bold text-accent">Admin Console</span>
            <ChevronRight className="h-4 w-4 text-white/20" />
            <span className="font-serif text-xl text-foreground">{title}</span>
          </div>
        </header>
        
        <div key={window.location.pathname} className="relative z-10 p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
