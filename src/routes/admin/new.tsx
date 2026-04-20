import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/storefront/AdminShell";
import { ProductForm } from "@/components/storefront/ProductForm";

export const Route = createFileRoute("/admin/new")({
  head: () => ({ meta: [{ title: "Admin · New Product" }] }),
  component: () => (
    <AdminShell>
      <h1 className="mb-6 font-serif text-2xl text-primary">Add Product</h1>
      <ProductForm />
    </AdminShell>
  ),
});