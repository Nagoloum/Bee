// Enums partagés web/mobile/api (miroir du schema.prisma)

export const UserRole = {
  CLIENT: 'CLIENT',
  VENDOR: 'VENDOR',
  DELIVERY: 'DELIVERY',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  READY: 'READY',
  PICKED_UP: 'PICKED_UP',
  IN_DELIVERY: 'IN_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  MOMO_MTN: 'MOMO_MTN',
  MOMO_ORANGE: 'MOMO_ORANGE',
  CARD: 'CARD',
  WALLET: 'WALLET',
  SPLIT: 'SPLIT',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const DeliveryStatus = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE_PICKUP: 'EN_ROUTE_PICKUP',
  PICKED_UP: 'PICKED_UP',
  EN_ROUTE_DROPOFF: 'EN_ROUTE_DROPOFF',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const KycStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
} as const;
export type KycStatus = (typeof KycStatus)[keyof typeof KycStatus];
