import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StorefrontLayout } from "@/components/storefront/Layout";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, buildWhatsAppLink } from "@/lib/format";
import { MessageCircle } from "lucide-react";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_inr: number | string | null;
  gold_weight_grams: number | string;
  purity: string;
  category_id: string | null;
}

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("id, slug, name, description, image_url, price_inr, gold_weight_grams, purity, category_id")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { product: data as Product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — 1g 22K Gold | Aurum` },
          {
            name: "description",
            content:
              loaderData.product.description ??
              `${loaderData.product.name} in pure 1 gram 22K gold. Enquire on WhatsApp.`,
          },
          { property: "og:title", content: loaderData.product.name },
          ...(loaderData.product.image_url
            ? [
                { property: "og:image", content: loaderData.product.image_url },
                { name: "twitter:image", content: loaderData.product.image_url },
              ]
            : []),
        ]
      : [],
  }),
  notFoundComponent: () => (
    <StorefrontLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl text-primary">Product not found</h1>
        <Link to="/" className="mt-6 inline-block text-primary underline">Back to home</Link>
      </div>
    </StorefrontLayout>
  ),
  errorComponent: ({ error }) => (
    <StorefrontLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-primary">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
      </div>
    </StorefrontLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [shopName, setShopName] = useState<string>("Aurum 1g Gold");

  useEffect(() => {
    supabase
      .from("shop_settings")
      .select("whatsapp_number, shop_name")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setWhatsapp(data.whatsapp_number);
          setShopName(data.shop_name);
        }
      });
  }, []);

  const productUrl =
    typeof window !== "undefined" ? window.location.href : `https://example.com/product/${product.slug}`;
  const waLink = whatsapp ? buildWhatsAppLink(whatsapp, product.name, productUrl) : "#";

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-primary transition-colors">Home</Link> <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-lg border border-border bg-secondary/40 shadow-sm"
          >
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-muted-foreground">No image</div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">
              {Number(product.gold_weight_grams).toFixed(0)}g · {product.purity} Gold
            </p>
            <h1 className="mt-4 font-serif text-4xl text-primary md:text-5xl">{product.name}</h1>
            {product.description && (
              <p className="mt-8 text-base leading-relaxed text-muted-foreground/90">{product.description}</p>
            )}

            <div className="mt-10 rounded-xl border border-primary/10 bg-primary/5 p-6 backdrop-blur-sm">
              <h3 className="font-serif text-xl text-primary">Direct Enquiry</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Chat with {shopName} on WhatsApp for current gold rates, availability, and fast ordering.
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-md bg-accent px-8 py-4 text-base font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" />
                Enquire on WhatsApp
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-y-6 gap-x-8 border-t border-border pt-8">
              <div>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Weight</span>
                <span className="text-lg font-medium text-foreground">{Number(product.gold_weight_grams).toFixed(3)} g</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Purity</span>
                <span className="text-lg font-medium text-foreground">{product.purity}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Certification</span>
                <span className="text-lg font-medium text-foreground">BIS Hallmarked</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Shipping</span>
                <span className="text-lg font-medium text-foreground">Pan-India Courier</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </StorefrontLayout>
  );
}