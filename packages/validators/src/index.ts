import { z } from 'zod';

// ─── Email / Phone / Password ───────────────────
export const emailSchema = z.string().email({ message: 'Email invalide' });
export const phoneE164Schema = z
  .string()
  .regex(/^\+\d{10,15}$/, { message: 'Téléphone doit être au format E.164 (+237...)' });
export const passwordSchema = z
  .string()
  .min(12, 'Au moins 12 caractères')
  .regex(/[A-Z]/, 'Au moins 1 majuscule')
  .regex(/[0-9]/, 'Au moins 1 chiffre');

// ─── Auth ───────────────────────────────────────
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailSchema,
    phone: phoneE164Schema.optional(),
    password: passwordSchema,
    passwordConfirm: z.string(),
    role: z.enum(['CLIENT', 'VENDOR', 'DELIVERY']),
    referralCode: z.string().optional(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter les CGU' }) }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Les mots de passe ne correspondent pas',
  });
export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Product ────────────────────────────────────
export const productCreateSchema = z.object({
  name: z.string().min(3).max(240),
  description: z.string().max(5000).optional(),
  basePriceXaf: z.bigint().positive(),
  categoryIds: z.array(z.string().uuid()).min(1),
  hasVariants: z.boolean().default(false),
  negotiationEnabled: z.boolean().default(false),
  negotiationMinXaf: z.bigint().optional(),
});
export type ProductCreateInput = z.infer<typeof productCreateSchema>;

// ─── Address ────────────────────────────────────
export const addressSchema = z.object({
  label: z.string().max(60).optional(),
  recipientName: z.string().max(160),
  phoneE164: phoneE164Schema,
  region: z.string().max(80),
  city: z.string().max(80),
  neighborhood: z.string().max(120).optional(),
  street: z.string().max(240).optional(),
  landmark: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;

// ─── Checkout ───────────────────────────────────
export const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  deliveryAddressId: z.string().uuid(),
  deliveryMethod: z.enum(['SELF_PICKUP', 'VENDOR_DELIVERY', 'PLATFORM']),
  paymentMethod: z.enum(['MOMO_MTN', 'MOMO_ORANGE', 'CARD', 'WALLET']),
  couponCode: z.string().optional(),
  usePoints: z.number().int().nonnegative().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
