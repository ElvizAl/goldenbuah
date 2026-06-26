import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getCategoriesTool, searchProductsTool } from "@/lib/agent/tools";

const openrouter = createOpenAI({
  baseURL: "https://api.tokenrouter.com/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const tools = {
  getCategories: getCategoriesTool,
  searchProducts: searchProductsTool,
};

const MEMORY_USER_TURNS = 3;

const NEED_TOPIC_PATTERNS = [
  { topic: "kebutuhan:hamil", pattern: /\b(hamil|kehamilan|ibu hamil)\b/i },
  { topic: "kebutuhan:anak", pattern: /\b(anak|balita|bayi|usia\s+\d+)\b/i },
  { topic: "kebutuhan:diet", pattern: /\b(diet|turun berat|rendah kalori)\b/i },
  { topic: "kebutuhan:imun", pattern: /\b(imun|daya tahan|kekebalan)\b/i },
  { topic: "kebutuhan:jerawat", pattern: /\b(jerawat|kulit berjerawat)\b/i },
] as const;

const FRUIT_TOPIC_TERMS = [
  "alpukat",
  "anggur",
  "apel",
  "belimbing",
  "durian",
  "jambu",
  "jeruk",
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
  "sawo",
  "semangka",
  "sirsak",
] as const;

const PRODUCT_INTENT_TERMS = [
  ...FRUIT_TOPIC_TERMS,
  "buah",
  "diet",
  "harga",
  "hamil",
  "imun",
  "jerawat",
  "jus",
  "produk",
  "rekomendasi",
  "sehat",
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

function getSlidingWindowMessages(
  messages: UIMessage[],
  maxUserTurns = MEMORY_USER_TURNS,
) {
  let userTurns = 0;
  let startIndex = messages.length;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role !== "user") continue;

    userTurns += 1;
    startIndex = index;

    if (userTurns === maxUserTurns) break;
  }

  return messages.slice(startIndex);
}

function getExplicitTopics(text: string) {
  const topics = new Set<string>();
  const normalizedText = text.toLowerCase();

  for (const { topic, pattern } of NEED_TOPIC_PATTERNS) {
    if (pattern.test(normalizedText)) topics.add(topic);
  }

  const categoryMatch = normalizedText.match(
    /\b(?:kategori\s+)?(buah[-\s]+(?:import|lokal|musiman|tropis))\b/i,
  );
  if (categoryMatch) {
    topics.add(`kategori:${categoryMatch[1].replace(/\s+/g, "-")}`);
  } else if (/\b(lihat|tampilkan|daftar)\s+kategori\b/i.test(normalizedText)) {
    topics.add("kategori:daftar");
  }

  for (const fruit of FRUIT_TOPIC_TERMS) {
    if (normalizedText.includes(fruit)) topics.add(`buah:${fruit}`);
  }

  return topics;
}

function haveSharedTopic(left: Set<string>, right: Set<string>) {
  return [...left].some((topic) => right.has(topic));
}

function getTopicsByPrefix(topics: Set<string>, prefix: string) {
  return new Set([...topics].filter((topic) => topic.startsWith(prefix)));
}

function hasTopicChanged(
  latestTopics: Set<string>,
  previousTopics: Set<string>,
) {
  const latestNeeds = getTopicsByPrefix(latestTopics, "kebutuhan:");
  const previousNeeds = getTopicsByPrefix(previousTopics, "kebutuhan:");

  if (latestNeeds.size > 0 && previousNeeds.size > 0) {
    return !haveSharedTopic(latestNeeds, previousNeeds);
  }

  return !haveSharedTopic(latestTopics, previousTopics);
}

function getMessagesWithTopicReset(messages: UIMessage[]) {
  const windowMessages = getSlidingWindowMessages(messages);
  const latestUserIndex = windowMessages.findLastIndex(
    (message) => message.role === "user",
  );

  if (latestUserIndex < 0) return windowMessages;

  const latestTopics = getExplicitTopics(
    getMessageText(windowMessages[latestUserIndex]),
  );
  if (latestTopics.size === 0) return windowMessages;

  for (let index = latestUserIndex - 1; index >= 0; index -= 1) {
    if (windowMessages[index].role !== "user") continue;

    const previousTopics = getExplicitTopics(
      getMessageText(windowMessages[index]),
    );
    if (previousTopics.size === 0) continue;

    return hasTopicChanged(latestTopics, previousTopics)
      ? windowMessages.slice(latestUserIndex)
      : windowMessages;
  }

  return windowMessages;
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
  const forcedTool = getForcedTool(getLatestUserMessageText(messages));
  const messagesForModel = getMessagesWithTopicReset(messages);

  const result = streamText({
    model: openrouter("openai/gpt-5.5"),
    stopWhen: stepCountIs(3),
    system: `Kamu adalah asisten toko buah segar "Golden Buah" yang ramah dan membantu.

ATURAN:
- Selalu jawab dalam Bahasa Indonesia yang santai dan hangat.
- Kamu menerima memori sliding window yang berisi maksimal ${MEMORY_USER_TURNS} giliran user terakhir.
- Sistem otomatis membuang memori lama ketika mendeteksi topik eksplisit baru yang berbeda.
- Pesan user terbaru selalu menjadi instruksi utama. Gunakan pesan sebelumnya hanya untuk memahami referensi lanjutan seperti "yang lebih murah", "yang tadi", "tambah dua", atau "kategori itu".
- Jika pesan terbaru memperkenalkan kebutuhan, buah, atau kategori baru, anggap topik sebelumnya sudah selesai. Jangan mengulang kebutuhan atau hasil produk dari topik lama.
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
