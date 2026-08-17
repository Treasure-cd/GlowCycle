import type { RetailProduct } from "./RetailFit";


export const DEMO_PRODUCTS: RetailProduct[] = [
  {
    id: "niacinamide-serum",
    name: "10% Niacinamide + Zinc Serum",
    brand: "Ordinary Co.",
    ingredients: ["Niacinamide", "Zinc PCA", "Glycerin", "Panthenol"],
  },
  {
    id: "retinol-night-cream",
    name: "Renewing Retinol Night Cream",
    brand: "Lumière Labs",
    ingredients: ["Retinoids (Adapalene/Tretinoin)", "Squalane", "Shea Butter"],
  },
  {
    id: "hydrating-gel-moisturizer",
    name: "Water Gel Moisturizer",
    brand: "Aqua Base",
    ingredients: ["Hyaluronic Acid", "Glycerin", "Centella Asiatica"],
  },
];

export function getDemoProduct(id: string | null): RetailProduct | null {
  if (!id) return null;
  return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
}