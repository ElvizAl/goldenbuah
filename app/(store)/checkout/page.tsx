import { redirect } from "next/navigation";
import { getUser } from "@/modules/auth/auth-session";
import { getMyCart } from "@/modules/cart/service/cart.service";
import { getMyAddresses } from "@/modules/address/service/address.service";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [cartResult, addressResult] = await Promise.all([
    getMyCart(),
    getMyAddresses(),
  ]);

  const cart = cartResult.data;

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const addresses = addressResult.data ?? [];

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const totalWeight = cart.items.reduce(
    (acc, item) => acc + item.product.weight * item.quantity,
    0
  );

  // Baca dari server env (bukan NEXT_PUBLIC) agar selalu akurat
  const originDistrictId = process.env.ORIGIN_DISTRICT_ID ?? "455";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>
      <CheckoutForm
        cart={cart}
        addresses={addresses}
        subtotal={subtotal}
        totalWeight={totalWeight}
        userName={user.name}
        originDistrictId={originDistrictId}
      />
    </div>
  );
}
