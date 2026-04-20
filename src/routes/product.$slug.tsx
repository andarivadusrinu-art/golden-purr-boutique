import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
        <div className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link> <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-md border border-border bg-secondary/40">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              {Number(product.gold_weight_grams).toFixed(0)}g · {product.purity} Gold
            </p>
            <h1 className="mt-3 font-serif text-3xl text-primary md:text-4xl">{product.name}</h1>
            <p className="mt-4 text-2xl font-medium text-foreground">{formatINR(product.price_inr)}</p>
            {product.description && (
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">{product.description}</p>
            )}

            <div className="mt-8 rounded-md border border-border bg-card p-5">
              <h3 className="font-serif text-lg text-primary">Send an Enquiry</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Chat directly with {shopName} on WhatsApp for availability, current rate and to place an order.
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" />
                Enquire on WhatsApp
              </a>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
              <li><span className="block text-foreground font-medium">Weight</span>{Number(product.gold_weight_grams).toFixed(3)} g</li>
              <li><span className="block text-foreground font-medium">Purity</span>{product.purity}</li>
              <li><span className="block text-foreground font-medium">Hallmark</span>BIS Hallmarked</li>
              <li><span className="block text-foreground font-medium">Shipping</span>Pan-India dispatch</li>
            </ul>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}