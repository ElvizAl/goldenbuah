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

async function rajaOngkirFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${RAJAONGKIR_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      key: RAJAONGKIR_API_KEY!,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const result = (await response.json()) as RajaOngkirResponse<T>;

  if (!response.ok) {
    console.error("RajaOngkir error:", result);
    throw new Error(result.meta?.message || "Gagal mengambil data RajaOngkir");
  }

  return result.data;
}

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