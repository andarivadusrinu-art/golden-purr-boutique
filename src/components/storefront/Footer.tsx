import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-2xl text-primary">Aurum 1g Gold</h3>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Pure 1 gram gold jewellery, crafted with heart and the care of generations.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-lg text-foreground">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/category/$slug" params={{ slug: "necklaces" }} className="hover:text-primary">Necklaces & Neck Sets</Link></li>
            <li><Link to="/category/$slug" params={{ slug: "rings" }} className="hover:text-primary">Rings</Link></li>
            <li><Link to="/about" className="hover:text-primary">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg text-foreground">Our Promise</h4>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Every piece is hallmarked and inspected for quality. Enquire on WhatsApp for personalised assistance, current gold rates and custom orders.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aurum 1g Gold. All rights reserved.
      </div>
    </footer>
  );
}