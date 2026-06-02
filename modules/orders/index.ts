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

export {
  getPaymentInfo,
  submitPaymentAction,
  adminConfirmPaymentAction,
} from "./service/payment.service";

// Components
export { OrderStatusBadge, getOrderStatusLabel } from "./components/order-status-badge";
export { OrderCard } from "./components/order-card";
export { CancelOrderButton } from "./components/cancel-order-button";
export { AdminUpdateStatusForm } from "./components/admin-update-status-form";
export { PaymentForm } from "./components/payment-form";
export { AdminPaymentConfirm } from "./components/admin-payment-confirm";
