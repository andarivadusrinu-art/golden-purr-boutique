import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StorefrontLayout } from "@/components/storefront/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Us | Aurum 1g Gold" }] }),
  component: AboutPage,
});

function AboutPage() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("key", "about")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setContent(data.content);
      });
  }, []);

  if (!content) return <StorefrontLayout><div className="py-24 text-center">Loading...</div></StorefrontLayout>;

  return (
    <StorefrontLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-serif text-4xl text-primary md:text-5xl">{content.title}</h1>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>{content.body}</p>
            </div>
          </div>
          {content.image_url && (
            <div className="relative overflow-hidden rounded-md">
              <img
                src={content.image_url}
                alt="Our Story"
                className="aspect-[4/3] w-full object-cover shadow-xl"
              />
            </div>
          )}
        </div>
      </section>
    </StorefrontLayout>
  );
}
