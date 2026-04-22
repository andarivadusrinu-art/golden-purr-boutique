import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StorefrontLayout } from "@/components/storefront/Layout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Our Story | AndarivaduSrinu" }] }),
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

  if (!content) return (
    <StorefrontLayout>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    </StorefrontLayout>
  );

  return (
    <StorefrontLayout>
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.3em] text-accent mb-4"
          >
            Our Heritage
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl text-foreground"
          >
            {content.title}
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground/90">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                {content.body}
              </p>
            </div>
            <div className="pt-8 border-t border-border">
              <p className="font-serif italic text-primary text-xl">"Every piece tells a story of tradition and timeless elegance."</p>
            </div>
          </motion.div>
          
          {content.image_url && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-accent/10 blur-2xl rounded-full" />
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={content.image_url}
                  alt="Our Story"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-1000 hover:scale-110"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </StorefrontLayout>
  );
}
