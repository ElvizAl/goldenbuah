// Address module — barrel export

// Schema
export * from "./schema/address.schema";

// Services
export {
  getMyAddresses,
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
} from "./service/address.service";

export {
  getAllAddresses,
  adminDeleteAddress,
  adminUpdateAddress,
} from "./service/admin-address.service";

// Components
export { AddressContent } from "./components/address-content";
export { AddressList } from "./components/address-list";
export { CreateAddressDialog } from "./components/create-address-dialog";
export { EditAddressDialog } from "./components/edit-address-dialog";
export { DeleteAddressButton } from "./components/delete-address-dialog";
export { AdminEditAddressBtn } from "./components/admin-edit-address-btn";
export { AdminDeleteAddressBtn } from "./components/admin-delete-address-btn";
