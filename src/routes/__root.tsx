import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { StarBackground } from "../components/storefront/StarBackground";
import { motion } from "framer-motion";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden bg-primary">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[100px]" />
      </div>
      
      <div className="relative z-10 max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="font-serif text-[12rem] leading-none text-white/5 select-none">404</h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
            <h2 className="font-serif text-5xl text-foreground mb-6">Lost in the Cosmos</h2>
            <p className="mx-auto max-w-md text-sm text-muted-foreground uppercase tracking-[0.2em] leading-relaxed mb-10">
              The masterpiece you seek has drifted beyond our current horizon.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-accent px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-accent-foreground transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-accent/20"
            >
              Return to Heritage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});


function RootComponent() {
  return (
    <>
      <StarBackground />
      <Outlet />
    </>
  );
}
