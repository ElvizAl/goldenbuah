import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

// ─── Data Kategori ─────────────────────────────────────────────────────────
const categories = [
  {
    name: "Buah Lokal",
    slug: "buah-lokal",
    imageUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80",
  },
  {
    name: "Buah Import",
    slug: "buah-import",
    imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80",
  },
  {
    name: "Buah Musiman",
    slug: "buah-musiman",
    imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80",
  },
  {
    name: "Buah Tropis",
    slug: "buah-tropis",
    imageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80",
  },
];

// ─── Data Produk Buah ──────────────────────────────────────────────────────
const products = [
  // ── Buah Lokal ──
  {
    name: "Mangga Harum Manis",
    slug: "mangga-harum-manis",
    categorySlug: "buah-lokal",
    price: 28000,
    stock: 150,
    weight: 800,
    description:
      "Mangga harum manis pilihan dari petani lokal. Manis, harum, dan segar. Cocok dimakan langsung atau dijadikan jus.",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80",
    isActive: true,
  },
  {
    name: "Pisang Cavendish",
    slug: "pisang-cavendish",
    categorySlug: "buah-lokal",
    price: 18000,
    stock: 200,
    weight: 1000,
    description:
      "Pisang Cavendish segar berkualitas tinggi. Kaya potasium dan serat, cocok untuk camilan sehari-hari.",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",
    isActive: true,
  },
  {
    name: "Jeruk Siam Pontianak",
    slug: "jeruk-siam-pontianak",
    categorySlug: "buah-lokal",
    price: 22000,
    stock: 120,
    weight: 900,
    description:
      "Jeruk Siam Pontianak asli dengan rasa manis segar. Kaya vitamin C, cocok untuk jus atau dimakan langsung.",
    imageUrl: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&q=80",
    isActive: true,
  },
  {
    name: "Pepaya California",
    slug: "pepaya-california",
    categorySlug: "buah-lokal",
    price: 15000,
    stock: 80,
    weight: 1500,
    description:
      "Pepaya California dengan daging buah merah cerah dan rasa manis. Kaya vitamin A dan C untuk kesehatan.",
    imageUrl: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&q=80",
    isActive: true,
  },
  {
    name: "Belimbing Manis",
    slug: "belimbing-manis",
    categorySlug: "buah-lokal",
    price: 20000,
    stock: 60,
    weight: 700,
    description:
      "Belimbing manis segar dari kebun lokal. Bentuk unik, rasa menyegarkan, cocok untuk dimakan langsung atau dijadikan jus.",
    imageUrl: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&q=80",
    isActive: true,
  },
  {
    name: "Rambutan Rapiah",
    slug: "rambutan-rapiah",
    categorySlug: "buah-lokal",
    price: 25000,
    stock: 100,
    weight: 1000,
    description:
      "Rambutan Rapiah premium dengan daging tebal dan manis. Biji mudah lepas dari daging, sangat segar.",
    imageUrl: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&q=80",
    isActive: true,
  },
  {
    name: "Sawo Manila",
    slug: "sawo-manila",
    categorySlug: "buah-lokal",
    price: 30000,
    stock: 50,
    weight: 800,
    description:
      "Sawo Manila matang sempurna dengan rasa manis legit. Tekstur lembut dan aroma khas yang menggugah selera.",
    imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80",
    isActive: true,
  },

  // ── Buah Import ──
  {
    name: "Apel Fuji Jepang",
    slug: "apel-fuji-jepang",
    categorySlug: "buah-import",
    price: 65000,
    stock: 80,
    weight: 900,
    description:
      "Apel Fuji impor langsung dari Jepang. Renyah, manis, dan berair. Dikemas premium untuk menjaga kesegaran.",
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80",
    isActive: true,
  },
  {
    name: "Anggur Red Globe Chile",
    slug: "anggur-red-globe-chile",
    categorySlug: "buah-import",
    price: 85000,
    stock: 60,
    weight: 800,
    description:
      "Anggur Red Globe impor dari Chile. Biji-bijian besar, manis, dan segar. Cocok untuk hidangan buah premium.",
    imageUrl: "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=400&q=80",
    isActive: true,
  },
  {
    name: "Pir Yali China",
    slug: "pir-yali-china",
    categorySlug: "buah-import",
    price: 45000,
    stock: 70,
    weight: 1000,
    description:
      "Pir Yali dari China dengan tekstur renyah dan rasa manis segar. Populer sebagai buah premium kelas atas.",
    imageUrl: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&q=80",
    isActive: true,
  },
  {
    name: "Kiwi Green New Zealand",
    slug: "kiwi-green-new-zealand",
    categorySlug: "buah-import",
    price: 55000,
    stock: 90,
    weight: 700,
    description:
      "Kiwi hijau segar dari New Zealand. Kaya vitamin C dan serat. Rasa asam manis yang menyegarkan.",
    imageUrl: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&q=80",
    isActive: true,
  },
  {
    name: "Jeruk Navel Australia",
    slug: "jeruk-navel-australia",
    categorySlug: "buah-import",
    price: 48000,
    stock: 100,
    weight: 1000,
    description:
      "Jeruk Navel impor dari Australia dengan rasa manis tanpa biji. Kaya vitamin C, cocok untuk jus segar.",
    imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80",
    isActive: true,
  },
  {
    name: "Lemon California",
    slug: "lemon-california",
    categorySlug: "buah-import",
    price: 40000,
    stock: 120,
    weight: 800,
    description:
      "Lemon California asli dengan kandungan air yang tinggi. Aroma segar dan rasa asam yang kuat, ideal untuk minuman dan masakan.",
    imageUrl: "https://images.unsplash.com/photo-1582476308882-61efc3dd65b2?w=400&q=80",
    isActive: true,
  },

  // ── Buah Musiman ──
  {
    name: "Durian Monthong",
    slug: "durian-monthong",
    categorySlug: "buah-musiman",
    price: 120000,
    stock: 30,
    weight: 3000,
    description:
      "Durian Monthong premium dengan daging tebal, kuning keemasan, dan rasa manis creamy. Raja buah yang sesungguhnya.",
    imageUrl: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&q=80",
    isActive: true,
  },
  {
    name: "Manggis Kalimantan",
    slug: "manggis-kalimantan",
    categorySlug: "buah-musiman",
    price: 45000,
    stock: 50,
    weight: 900,
    description:
      "Manggis segar dari Kalimantan dengan daging putih bersih dan rasa manis asam yang menyegarkan. Ratu buah tropis.",
    imageUrl: "https://images.unsplash.com/photo-1582355763250-d44c4362be54?w=400&q=80",
    isActive: true,
  },
  {
    name: "Kelengkeng Itoh",
    slug: "kelengkeng-itoh",
    categorySlug: "buah-musiman",
    price: 50000,
    stock: 40,
    weight: 800,
    description:
      "Kelengkeng Itoh berukuran besar dengan daging tebal dan manis. Biji kecil, sangat cocok untuk dimakan langsung.",
    imageUrl: "https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&q=80",
    isActive: true,
  },
  {
    name: "Duku Palembang",
    slug: "duku-palembang",
    categorySlug: "buah-musiman",
    price: 35000,
    stock: 70,
    weight: 1000,
    description:
      "Duku Palembang asli dengan rasa manis legit dan sedikit asam. Kulit tipis, daging tebal, biji kecil.",
    imageUrl: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&q=80",
    isActive: true,
  },
  {
    name: "Jambu Air Madu",
    slug: "jambu-air-madu",
    categorySlug: "buah-musiman",
    price: 28000,
    stock: 80,
    weight: 600,
    description:
      "Jambu air madu dengan warna merah cerah dan rasa sangat manis. Kandungan air tinggi, sangat menyegarkan.",
    imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80",
    isActive: true,
  },

  // ── Buah Tropis ──
  {
    name: "Nanas Madu Subang",
    slug: "nanas-madu-subang",
    categorySlug: "buah-tropis",
    price: 20000,
    stock: 90,
    weight: 1200,
    description:
      "Nanas madu dari Subang dengan rasa super manis dan hampir tanpa rasa asam. Cocok untuk dimakan langsung.",
    imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80",
    isActive: true,
  },
  {
    name: "Alpukat Mentega",
    slug: "alpukat-mentega",
    categorySlug: "buah-tropis",
    price: 35000,
    stock: 70,
    weight: 1000,
    description:
      "Alpukat mentega dengan tekstur creamy dan rasa gurih. Kaya lemak sehat, cocok untuk jus, salad, atau dimakan langsung.",
    imageUrl: "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=400&q=80",
    isActive: true,
  },
  {
    name: "Kelapa Muda Hijau",
    slug: "kelapa-muda-hijau",
    categorySlug: "buah-tropis",
    price: 18000,
    stock: 150,
    weight: 2000,
    description:
      "Kelapa muda hijau segar dengan air kelapa yang manis dan menyegarkan. Daging kelapa lembut dan enak.",
    imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=80",
    isActive: true,
  },
  {
    name: "Semangka Tanpa Biji",
    slug: "semangka-tanpa-biji",
    categorySlug: "buah-tropis",
    price: 15000,
    stock: 60,
    weight: 4000,
    description:
      "Semangka tanpa biji dengan daging merah cerah dan rasa manis segar. Kadar air tinggi, sangat cocok di cuaca panas.",
    imageUrl: "https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&q=80",
    isActive: true,
  },
  {
    name: "Melon Golden",
    slug: "melon-golden",
    categorySlug: "buah-tropis",
    price: 32000,
    stock: 50,
    weight: 2500,
    description:
      "Melon Golden dengan kulit kuning keemasan dan daging putih kekuningan. Manis harum, tekstur lembut dan berair.",
    imageUrl: "https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&q=80",
    isActive: true,
  },
  {
    name: "Sirsak",
    slug: "sirsak",
    categorySlug: "buah-tropis",
    price: 25000,
    stock: 65,
    weight: 1500,
    description:
      "Sirsak segar dengan rasa manis asam yang khas. Kaya antioksidan dan serat. Cocok untuk jus atau dimakan langsung.",
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80",
    isActive: true,
  },
];

// ─── Main Seed Function ────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Mulai seeding...\n");

  // Seed Kategori
  console.log("📂 Seeding kategori...");
  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        imageUrl: cat.imageUrl,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
      },
    });

    categoryMap[cat.slug] = result.id;
    console.log(`  ✅ Kategori: ${result.name} (id: ${result.id})`);
  }

  // Seed Produk
  console.log("\n🍎 Seeding produk buah...");
  for (const prod of products) {
    const categoryId = categoryMap[prod.categorySlug];

    if (!categoryId) {
      console.warn(`  ⚠️  Kategori "${prod.categorySlug}" tidak ditemukan untuk produk "${prod.name}"`);
      continue;
    }

    const result = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        categoryId,
        price: prod.price,
        stock: prod.stock,
        weight: prod.weight,
        description: prod.description,
        imageUrl: prod.imageUrl,
        isActive: prod.isActive,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        categoryId,
        price: prod.price,
        stock: prod.stock,
        weight: prod.weight,
        description: prod.description,
        imageUrl: prod.imageUrl,
        isActive: prod.isActive,
      },
    });

    console.log(`  ✅ ${result.name} — Rp ${Number(result.price).toLocaleString("id-ID")}/kg`);
  }

  console.log("\n✨ Seeding selesai!");
  console.log(`   📂 ${categories.length} kategori`);
  console.log(`   🍎 ${products.length} produk buah`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
