"use server";

import {
  getCitiesByProvince,
  getCourierCost,
  getDistrictsByCity,
  getProvinces,
  getSubdistrictsByDistrict,
} from "@/modules/rajaongkir/service/rajaongkir.service";

export async function getProvincesAction() {
  try {
    const data = await getProvinces();

    return {
      success: true,
      message: "Provinsi berhasil dimuat.",
      data,
    };
  } catch (error) {
    console.error("Get provinces error:", error);

    return {
      success: false,
      message: "Gagal memuat provinsi.",
      data: [],
    };
  }
}

export async function getCitiesAction(provinceId: string) {
  if (!provinceId) {
    return {
      success: false,
      message: "Province ID wajib diisi.",
      data: [],
    };
  }

  try {
    const data = await getCitiesByProvince(provinceId);

    return {
      success: true,
      message: "Kota berhasil dimuat.",
      data,
    };
  } catch (error) {
    console.error("Get cities error:", error);

    return {
      success: false,
      message: "Gagal memuat kota.",
      data: [],
    };
  }
}

export async function getDistrictsAction(cityId: string) {
  if (!cityId) {
    return {
      success: false,
      message: "City ID wajib diisi.",
      data: [],
    };
  }

  try {
    const data = await getDistrictsByCity(cityId);

    return {
      success: true,
      message: "Kecamatan berhasil dimuat.",
      data,
    };
  } catch (error) {
    console.error("Get districts error:", error);

    return {
      success: false,
      message: "Gagal memuat kecamatan.",
      data: [],
    };
  }
}

export async function getSubdistrictsAction(districtId: string) {
  if (!districtId) {
    return {
      success: false,
      message: "District ID wajib diisi.",
      data: [],
    };
  }

  try {
    const data = await getSubdistrictsByDistrict(districtId);

    return {
      success: true,
      message: "Kelurahan berhasil dimuat.",
      data,
    };
  } catch (error) {
    console.error("Get subdistricts error:", error);

    return {
      success: false,
      message: "Gagal memuat kelurahan.",
      data: [],
    };
  }
}

export async function getCourierCostAction(params: {
  originDistrictId: string;
  destinationDistrictId: string;
  weight: number;
  courier: string;
}) {
  if (!params.originDistrictId || !params.destinationDistrictId) {
    return {
      success: false,
      message: "Origin dan destination wajib diisi.",
      data: null,
    };
  }

  try {
    const data = await getCourierCost(params);

    return {
      success: true,
      message: "Ongkir berhasil dihitung.",
      data,
    };
  } catch (error) {
    console.error("Get courier cost error:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghitung ongkir.",
      data: null,
    };
  }
}
