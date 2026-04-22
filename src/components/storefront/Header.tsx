import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Search } from "lucide-react";

const NAV = [
  { to: "/category/$slug", params: { slug: "necklaces" }, label: "Necklaces" },
  { to: "/category/$slug", params: { slug: "rings" }, label: "Rings" },
  { to: "/category/$slug", params: { slug: "earrings" }, label: "Earrings" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [shopName, setShopName] = useState("Aurum 1g Gold");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("shop_settings")
      .select("shop_name")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.shop_name) setShopName(data.shop_name);
      });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/search", search: { q: query.trim() } as any });
      setSearchOpen(false);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-primary">
          AndarivaduSrinu
        </Link>
        
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                {...(n as any).params ? { params: (n as any).params } : {}}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 border-l border-border pl-4 md:pl-8">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex animate-in fade-in slide-in-from-right-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search pieces..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-32 rounded-l-md border border-input bg-background px-3 py-1 text-sm focus:outline-none md:w-48"
                />
                <button type="submit" className="rounded-r-md bg-primary px-3 py-1 text-primary-foreground">
                  <Search className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 p-1 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="p-1 text-foreground/80 hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            
            <button
              aria-label="Toggle menu"
              className="md:hidden text-foreground ml-2"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                {...(n as any).params ? { params: (n as any).params } : {}}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-foreground/80 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}