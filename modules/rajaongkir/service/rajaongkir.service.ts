const RAJAONGKIR_BASE_URL = process.env.RAJAONGKIR_BASE_URL;
const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;

if (!RAJAONGKIR_BASE_URL) {
  throw new Error("RAJAONGKIR_BASE_URL is not defined");
}

if (!RAJAONGKIR_API_KEY) {
  throw new Error("RAJAONGKIR_API_KEY is not defined");
}

type RajaOngkirResponse<T> = {
  meta?: {
    message?: string;
    code?: number;
    status?: string;
  };
  data: T;
};

export type RajaOngkirLocation = {
  id: number | string;
  name: string;
  zip_code?: string | null;
};

// ─── In-memory cache (server-side, reset saat restart) ────────────────────
// Cukup untuk data wilayah yang jarang berubah.
// TTL 24 jam agar tidak kena rate-limit harian RajaOngkir.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Fetch helper ─────────────────────────────────────────────────────────
async function rajaOngkirFetch<T>(endpoint: string): Promise<T> {
  // Cek in-memory cache dulu
  const cached = getCached<T>(endpoint);
  if (cached !== null) {
    return cached;
  }

  const response = await fetch(`${RAJAONGKIR_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      key: RAJAONGKIR_API_KEY!,
      "Content-Type": "application/json",
    },
    // Biarkan Next.js cache juga menyimpan response ini (data wilayah jarang berubah)
    next: { revalidate: 86400 }, // 24 jam
  });

  const result = (await response.json()) as RajaOngkirResponse<T>;

  if (!response.ok) {
    console.error("RajaOngkir error:", result);
    throw new Error(result.meta?.message || "Gagal mengambil data RajaOngkir");
  }

  // Simpan ke in-memory cache
  setCached(endpoint, result.data);

  return result.data;
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function getProvinces() {
  return rajaOngkirFetch<RajaOngkirLocation[]>("/destination/province");
}

export async function getCitiesByProvince(provinceId: string) {
  return rajaOngkirFetch<RajaOngkirLocation[]>(
    `/destination/city/${provinceId}`
  );
}

export async function getDistrictsByCity(cityId: string) {
  return rajaOngkirFetch<RajaOngkirLocation[]>(
    `/destination/district/${cityId}`
  );
}

export async function getSubdistrictsByDistrict(districtId: string) {
  return rajaOngkirFetch<RajaOngkirLocation[]>(
    `/destination/sub-district/${districtId}`
  );
}

// ─── Tipe untuk Cost/Ongkir ───────────────────────────────────────────────
// Struktur response RajaOngkir Komerce: data adalah array flat
// { name, code, service, description, cost, etd }
export type CourierService = {
  name: string;   // nama kurir, e.g. "Jalur Nugraha Ekakurir (JNE)"
  code: string;   // kode kurir, e.g. "jne"
  service: string;        // kode layanan, e.g. "REG"
  description: string;    // nama layanan, e.g. "Layanan Reguler"
  cost: number;
  etd: string;    // e.g. "10 day"
};

export type CostResponse = {
  services: CourierService[];
};

/** Hitung ongkir — POST form-urlencoded, tidak di-cache */
export async function getCourierCost(params: {
  originDistrictId: string;
  destinationDistrictId: string;
  weight: number; // gram
  courier: string;
}) {
  const { originDistrictId, destinationDistrictId, weight, courier } = params;

  // RajaOngkir minimum weight is 1000 gram
  const actualWeight = Math.max(weight, 1000);

  const body = new URLSearchParams();
  body.set("origin", originDistrictId);
  body.set("destination", destinationDistrictId);
  body.set("weight", String(actualWeight));
  body.set("courier", courier);

  const response = await fetch(
    `${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`,
    {
      method: "POST",
      headers: {
        key: RAJAONGKIR_API_KEY!,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    }
  );

  const text = await response.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  try {
    result = JSON.parse(text);
  } catch {
    console.error("RajaOngkir cost raw response:", text);
    throw new Error("Response bukan JSON: " + text.slice(0, 200));
  }

  if (!response.ok) {
    console.error("RajaOngkir cost error:", result);
    throw new Error(result?.meta?.message || result?.message || "Gagal menghitung ongkir");
  }

  // data adalah array flat: [{ name, code, service, description, cost, etd }, ...]
  const services: CourierService[] = Array.isArray(result?.data) ? result.data : [];

  return { services } as CostResponse;
}

/** Hapus semua cache wilayah secara manual (misal setelah update data) */
export function clearRajaOngkirCache() {
  cache.clear();
}
