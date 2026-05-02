import type { UserRole, OrderStatus, PaymentMethod } from '../enums';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserDTO {
  id: string;
  email: string;
  phoneE164?: string | null;
  role: UserRole;
  isKycVerified: boolean;
  locale: string;
  createdAt: string;
}

export interface ShopDTO {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  region?: string | null;
  ratingAvg: number;
  ratingCount: number;
  badge: 'NONE' | 'FIABLE' | 'TOP_VENDOR' | 'ELITE';
}

export interface ProductDTO {
  id: string;
  shopId: string;
  slug: string;
  name: string;
  description?: string | null;
  basePriceXaf: string;   // BigInt sérialisé en string
  compareAtPriceXaf?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
  ratingAvg: number;
  saleCount: number;
  images: { url: string; altText?: string | null }[];
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalXaf: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface WalletDTO {
  id: string;
  type: 'CLIENT' | 'VENDOR' | 'DELIVERY';
  currency: 'XAF';
  balanceAvailableXaf: string;
  balancePendingXaf: string;
  balanceEscrowXaf: string;
  totalEarnedXaf: string;
}
