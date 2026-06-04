/**
 * Returns Tailwind class strings for a category badge based on its name/slug.
 * Works for both featured-product-section and product-grid.
 */
export function getCategoryBadgeClass(nameOrSlug: string): string {
  const s = (nameOrSlug ?? "").toLowerCase();

  if (s.includes("lokal"))   return "bg-green-600 hover:bg-green-600 text-white border-none";
  if (s.includes("import"))  return "bg-orange-500 hover:bg-orange-500 text-white border-none";
  if (s.includes("musiman")) return "bg-sky-500   hover:bg-sky-500   text-white border-none";
  if (s.includes("tropis"))  return "bg-violet-500 hover:bg-violet-500 text-white border-none";

  // Fallback: deterministic color based on first char code
  const colors = [
    "bg-pink-500 hover:bg-pink-500 text-white border-none",
    "bg-teal-500 hover:bg-teal-500 text-white border-none",
    "bg-indigo-500 hover:bg-indigo-500 text-white border-none",
    "bg-rose-500 hover:bg-rose-500 text-white border-none",
  ];
  const idx = (s.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}
