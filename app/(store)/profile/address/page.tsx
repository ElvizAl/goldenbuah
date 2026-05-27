import { getMyAddresses } from "@/modules/address/service/address.service";
import { AddressContent } from "@/modules/address/components/address-content";

export default async function AddressPage() {
  const result = await getMyAddresses();

  return <AddressContent addresses={result.data} />;
}