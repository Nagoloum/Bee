// ─── Global Types ─────────────────────────────────────────────────────────────

export type Locale = "fr" | "en";

export type UserRole = "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "DISPUTED";

export type PaymentMethod =
  | "STRIPE"
  | "MOBILE_MONEY"
  | "CASH_ON_DELIVERY"
  | "WALLET";

export type Region =
  | "CM-CE"
  | "CM-LT"
  | "CM-NO"
  | "CM-EN"
  | "CM-AD"
  | "CM-NW"
  | "CM-SW"
  | "CM-OU"
  | "CM-ES"
  | "CM-SU";

// ─── Auth session ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id:            string;
  name:          string;
  email:         string;
  image?:        string | null;
  role:          UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
}

// ─── API response wrapper ─────────────────────────────────────────────────────

export type ApiResponse<T = void> =
  | { success: true;  data: T;      error?: never }
  | { success: false; error: string; data?: never };

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items:      T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId:       string;
  variantId?:      string;
  name:            string;
  image?:          string;
  price:           number;
  quantity:        number;
  vendorId:        string;
  vendorName:      string;
  variantLabel?:   string;
  stock:           number;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?:   string;
  minPrice?:   number;
  maxPrice?:   number;
  region?:     Region;
  rating?:     number;
  inStock?:    boolean;
  isNew?:      boolean;
  sort?:       "price_asc" | "price_desc" | "rating" | "newest" | "popular";
  search?:     string;
  page?:       number;
  pageSize?:   number;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface NotificationPayload {
  type:    string;
  title:   string;
  message: string;
  link?:   string;
  data?:   Record<string, string>;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResult {
  url:  string;
  key:  string;
  size: number;
  type: string;
}

// ─── Zustand cart store ───────────────────────────────────────────────────────

export interface CartState {
  items:        CartItem[];
  couponCode?:  string;
  couponDiscount: number;

  addItem:      (item: CartItem) => void;
  removeItem:   (productId: string, variantId?: string) => void;
  updateQty:    (productId: string, variantId: string | undefined, qty: number) => void;
  clearCart:    () => void;
  applyCoupon:  (code: string, discount: number) => void;
  removeCoupon: () => void;

  getSubtotal:  () => number;
  getTotal:     () => number;
  getCount:     () => number;
}
