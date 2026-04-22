import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Search, LogOut } from "lucide-react";
import { toast } from "sonner";

const NAV = [
  { to: "/category/$slug", params: { slug: "necklaces" }, label: "Necklaces" },
  { to: "/category/$slug", params: { slug: "rings" }, label: "Rings" },
  { to: "/category/$slug", params: { slug: "earrings" }, label: "Earrings" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [open, setOpen] = useState(false);
  const [shopName, setShopName] = useState("AndarivaduSrinu");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });

    // Realtime listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    supabase
      .from("shop_settings")
      .select("shop_name")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.shop_name) setShopName(data.shop_name);
      });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/search", search: { q: query.trim() } as any });
      setSearchOpen(false);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="AndarivaduSrinu" className="h-30 md:h-15 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                {...(n as any).params ? { params: (n as any).params } : {}}
                className="relative text-sm font-medium transition-all py-2 group"
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-accent font-bold" : "text-white/60 group-hover:text-accent"}>
                      {n.label}
                    </span>
                    {/* Active/Hover underline */}
                    <motion.span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full opacity-40"}`}
                    />
                  </>
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="relative text-sm font-medium text-accent transition-colors hover:text-white group"
              >
                Admin
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white transition-all group-hover:w-full"
                />
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 border-l border-border pl-4 md:pl-8">
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSearch}
                  className="flex items-center"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search pieces..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-32 rounded-l-md border border-border bg-white/5 px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:ring-1 focus:ring-primary focus:outline-none md:w-48"
                  />
                  <button type="submit" className="rounded-r-md bg-primary px-3 py-1.5 text-primary-foreground shadow-lg shadow-accent/20">
                    <Search className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 p-1.5 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 text-white hover:text-accent transition-colors"
                >
                  <Search className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {user && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-white hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}

            <button
              aria-label="Toggle menu"
              className="md:hidden text-white ml-2 p-1.5"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-8 space-y-2">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  {...(n as any).params ? { params: (n as any).params } : {}}
                  onClick={() => setOpen(false)}
                  className="group relative overflow-hidden rounded-xl px-4 py-4 text-xl font-medium text-white/80 transition-all hover:bg-white/10 hover:text-accent"
                  activeProps={{ className: "text-accent bg-white/5 font-bold" }}
                >
                  <span className="relative z-10">{n.label}</span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}