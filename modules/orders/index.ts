// Orders module — barrel export

// Schema
export * from "./schema/order.schema";

// Service / Server Actions
export {
  createOrderAction,
  getMyOrders,
  getOrderDetail,
  cancelOrderAction,
  adminGetAllOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatusAction,
} from "./service/order.service";

// Components
export { OrderStatusBadge, getOrderStatusLabel } from "./components/order-status-badge";
export { OrderCard } from "./components/order-card";
export { CancelOrderButton } from "./components/cancel-order-button";
export { AdminUpdateStatusForm } from "./components/admin-update-status-form";
