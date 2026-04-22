import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/storefront/ProductForm";

export const Route = createFileRoute("/admin/new")({
  head: () => ({ meta: [{ title: "Admin · New Product" }] }),
  component: () => (
    <AdminLayout title="Add New Piece">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-foreground">Forge New Masterpiece</h1>
        <p className="mt-2 text-muted-foreground">Add a new treasure to your celestial collection.</p>
      </div>
      <ProductForm />
    </AdminLayout>
  ),
});