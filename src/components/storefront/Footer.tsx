import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/20 backdrop-blur-lg text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3">
        <div className="space-y-4">
          <img src="/logo.png" alt="AndarivaduSrinu" className="h-30 w-auto object-contain" />
          <p className="max-w-xs text-sm text-white/70 leading-relaxed">
            Pure 1 gram gold jewellery, crafted with heart and the heritage of generations. Discover small treasures for every occasion.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-lg text-white font-medium mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link to="/category/$slug" params={{ slug: "necklaces" }} className="hover:text-accent transition-colors">Necklaces & Neck Sets</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "rings" }} className="hover:text-accent transition-colors">Rings</Link></li>
            <li><Link to="/about" className="hover:text-accent transition-colors">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg text-white font-medium mb-4">Our Promise</h4>
          <p className="text-sm text-white/60 leading-relaxed">
            Every piece is hallmarked and inspected for superior quality. Enquire on WhatsApp for personalised assistance, current gold rates and secure orders.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} AndarivaduSrinu. A name of brand. All rights reserved.</p>
      </div>
    </footer>
  );
}