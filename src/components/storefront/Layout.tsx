import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

import { PageTransition } from "./PageTransition";

export function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}