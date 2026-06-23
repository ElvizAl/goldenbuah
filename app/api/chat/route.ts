import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getCategoriesTool, searchProductsTool } from "@/lib/agent/tools";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const tools = {
  getCategories: getCategoriesTool,
  searchProducts: searchProductsTool,
};

const PRODUCT_INTENT_TERMS = [
  "alpukat",
  "anggur",
  "apel",
  "belimbing",
  "buah",
  "diet",
  "durian",
  "harga",
  "hamil",
  "imun",
  "jambu",
  "jerawat",
  "jeruk",
  "jus",
  "kelapa",
  "kelengkeng",
  "kiwi",
  "lemon",
  "mangga",
  "manggis",
  "melon",
  "nanas",
  "pepaya",
  "pir",
  "pisang",
  "produk",
  "rekomendasi",
  "sawo",
  "sehat",
  "semangka",
  "sirsak",
  "stok",
  "usia",
];

function getMessageText(message: UIMessage & { content?: unknown }) {
  if (typeof message.content === "string") return message.content;

  return (
    message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join(" ") ?? ""
  );
}

function getLatestUserMessage(messages: UIMessage[]) {
  return [...messages]
    .reverse()
    .find((message) => message.role === "user");
}

function getLatestUserMessageText(messages: UIMessage[]) {
  const latestUserMessage = getLatestUserMessage(messages);
  return latestUserMessage ? getMessageText(latestUserMessage).toLowerCase() : "";
}

function getForcedTool(userText: string) {
  if (!userText) return null;

  if (/\b(tampilkan\s+produk\s+kategori|produk\s+kategori)\b/i.test(userText)) {
    return "searchProducts" as const;
  }

  if (/\b(kategori|category|jenis buah|daftar buah|lihat kategori)\b/i.test(userText)) {
    return "getCategories" as const;
  }

  if (PRODUCT_INTENT_TERMS.some((term) => userText.includes(term))) {
    return "searchProducts" as const;
  }

  return null;
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const latestUserMessage = getLatestUserMessage(messages);
  const forcedTool = getForcedTool(getLatestUserMessageText(messages));
  const messagesForModel = latestUserMessage ? [latestUserMessage] : messages;

  const result = streamText({
    model: openrouter("google/gemini-3.1-flash-lite"),
    stopWhen: stepCountIs(3),
    system: `Kamu adalah asisten toko buah segar "Golden Buah" yang ramah dan membantu.

ATURAN:
- Selalu jawab dalam Bahasa Indonesia yang santai dan hangat.
- Jawab hanya berdasarkan pesan user terbaru. Jangan mengulang topik dari pesan sebelumnya jika user sudah bertanya hal baru.
- Ketika user bertanya tentang buah, manfaat, atau rekomendasi, berikan deskripsi singkat dan informatif, lalu gunakan tool searchProducts untuk menampilkan produk yang relevan dari toko.
- Ketika user ingin tahu kategori buah yang tersedia, gunakan tool getCategories.
- Jika user menulis "Tampilkan produk kategori [slug]", panggil searchProducts dengan categorySlug sesuai slug tersebut dan jangan panggil getCategories.
- Untuk pertanyaan rekomendasi produk, panggil tool searchProducts terlebih dahulu sebelum menulis daftar rekomendasi panjang.
- Selalu gunakan data dari tool. Jangan mengarang produk, stok, harga, slug, atau link.
- searchProducts hanya boleh dianggap cocok jika produk dikembalikan oleh database berdasarkan nama, deskripsi, atau kategori. Jangan mengubah intent umum seperti "anak usia 8 tahun", "diet", atau "imun" menjadi produk tertentu sendiri.
- Setelah tool mengembalikan produk, jangan menulis ulang daftar nama produk, harga, atau bullet link di jawaban teks. Kartu produk dari UI sudah menampilkan data itu.
- Jika produk ditemukan, cukup tulis 1 kalimat singkat seperti "Ini beberapa produk yang tersedia di Golden Buah." tanpa mengulang detail produk.
- Jika meta.matching = "recommendation_fallback_active_products", jelaskan singkat bahwa belum ada label produk yang spesifik untuk kebutuhan itu, tetapi kartu menampilkan buah yang tersedia di database Golden Buah.
- Jangan klaim sebuah produk memiliki manfaat kesehatan spesifik kecuali informasi itu ada di field description produk.
- Jika tool mengembalikan meta.source = "database", artinya produk tersebut benar-benar hasil query database.
- Format link produk adalah https://goldenbuah.vercel.app/produk/[slug]. Contoh: jika slug produk adalah "mangga", linknya adalah https://goldenbuah.vercel.app/mangga.
- Jika produk tidak ditemukan, katakan bahwa belum ada produk yang cocok di database untuk pencarian itu, lalu sarankan user mencari nama buah tertentu atau melihat kategori.
- Jangan sebut nama model AI yang kamu gunakan.

INFORMASI TOKO:
- Nama toko: Golden Buah
- Website: https://goldenbuah.vercel.app/
- Untuk mengarahkan user ke produk, gunakan URL yang dikembalikan oleh tool searchProducts.`,
    messages: await convertToModelMessages(messagesForModel),
    tools,
    prepareStep: ({ stepNumber }) => {
      if (stepNumber !== 0 || !forcedTool) return undefined;

      return {
        activeTools: [forcedTool],
        toolChoice: { type: "tool", toolName: forcedTool },
      };
    },
  });

  return result.toUIMessageStreamResponse();
}
