import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/storefront/ProductForm";

export const Route = createFileRoute("/admin/new")({
  head: () => ({ meta: [{ title: "Admin · New Product" }] }),
  component: () => (
    <AdminLayout title="Add Product">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-primary">Create New Piece</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the details to add a new item to your collection</p>
      </div>
      <ProductForm />
    </AdminLayout>
  ),
});