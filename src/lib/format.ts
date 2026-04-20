export function formatINR(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Price on enquiry";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "Price on enquiry";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function buildWhatsAppLink(
  phone: string,
  productName: string,
  productUrl: string,
) {
  const cleaned = phone.replace(/\D/g, "");
  const message =
    `Hello! I'm interested in *${productName}* (1g gold).\n\n` +
    `Product link: ${productUrl}\n\n` +
    `Could you share availability and final price? Thank you.`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}