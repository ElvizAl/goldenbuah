import { tool } from "ai";
import { z } from "zod";
import prisma from "@/shared/lib/prisma";

const STORE_URL = "https://goldenbuah.vercel.app/produk";

const QUERY_STOP_WORDS = new Set([
  "apa",
  "buah",
  "buat",
  "cari",
  "cocok",
  "dan",
  "dengan",
  "di",
  "dong",
  "mau",
  "produk",
  "rekomendasi",
  "segar",
  "saya",
  "tampilkan",
  "untuk",
  "yang",
]);

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  stock: true,
  imageUrl: true,
  description: true,
  category: { select: { name: true, slug: true } },
} as const;

function getSearchTerms(query?: string) {
  if (!query) return [];

  const normalized = query.toLowerCase().trim();
  const terms = new Set<string>();

  if (normalized.length > 2 && !QUERY_STOP_WORDS.has(normalized)) {
    terms.add(normalized);
  }

  for (const token of normalized.split(/[^a-z0-9]+/i)) {
    if (token.length > 2 && !QUERY_STOP_WORDS.has(token)) {
      terms.add(token);
    }
  }

  return [...terms];
}

function isRecommendationQuery(query?: string) {
  if (!query) return false;

  const normalized = query.toLowerCase();

  return [
    "anak",
    "balita",
    "cocok",
    "diet",
    "hamil",
    "imun",
    "jerawat",
    "kesehatan",
    "rekomendasi",
    "sehat",
    "tahun",
    "usia",
    "vitamin",
  ].some((term) => normalized.includes(term));
}

/** Tool 1: ambil semua kategori buah */
export const getCategoriesTool = tool({
  description:
    "Ambil semua kategori produk buah. Panggil ketika user ingin tahu kategori apa saja yang tersedia di toko.",
  inputSchema: z.object({}),
  execute: async () => {
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true, name: true, imageUrl: true },
      orderBy: { name: "asc" },
    });
    return { categories };
  },
});

/** Tool 2: cari produk buah berdasarkan query atau slug kategori */
export const searchProductsTool = tool({
  description:
    "Cari produk buah berdasarkan kata kunci (query) atau slug kategori. Selalu sertakan slug produk dalam hasil. " +
    "Panggil ketika user bertanya tentang buah tertentu, rekomendasi buah, atau ingin melihat produk dalam kategori tertentu.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Kata kunci pencarian, misal: mangga, apel, buah untuk anak, buah untuk diet"),
    categorySlug: z
      .string()
      .optional()
      .describe("Slug kategori, misal: buah-tropis, buah-impor"),
    limit: z.number().min(1).max(12).default(6),
  }),
  execute: async ({ query, categorySlug, limit }) => {
    const searchTerms = getSearchTerms(query);

    let matching = "name_description_or_category";
    let products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(searchTerms.length > 0
          ? {
              OR: searchTerms.flatMap((term) => [
                { name: { contains: term, mode: "insensitive" as const } },
                { description: { contains: term, mode: "insensitive" as const } },
                { category: { name: { contains: term, mode: "insensitive" as const } } },
              ]),
            }
          : {}),
      },
      select: PRODUCT_SELECT,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (products.length === 0 && isRecommendationQuery(query)) {
      matching = "recommendation_fallback_active_products";
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          stock: { gt: 0 },
          ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        },
        select: PRODUCT_SELECT,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    }

    return {
      meta: {
        source: "database",
        matching,
        query: query ?? null,
        categorySlug: categorySlug ?? null,
        searchTerms,
      },
      products: products.map((product) => ({
        ...product,
        price: Number(product.price),
        url: `${STORE_URL}/${product.slug}`,
      })),
    };
  },
});
