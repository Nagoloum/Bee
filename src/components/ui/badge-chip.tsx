import { ShieldCheck, Star, Zap, TrendingUp, Crown, Award, Truck, Package, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type BadgeType =
  | "CERTIFIED"
  | "TRUSTED_BUYER"
  | "VIP_BUYER"
  | "TOP_SELLER"
  | "BEST_VENDOR_WEEK"
  | "VERIFIED_VENDOR"
  | "FAST_SHIPPER"
  | "PREMIUM_VENDOR"
  | "BEST_PRODUCT_WEEK"
  | "TRENDING"
  | "EDITORS_CHOICE"
  | "TOP_RATED"
  | "RELIABLE_DELIVERY"
  | "TOP_DELIVERY";

interface BadgeMeta {
  label:    string;
  shortLabel: string;
  icon:     React.ElementType;
  color:    string;      // text color
  bg:       string;      // background
  border:   string;      // border color
  emoji:    string;
}

export const BADGE_META: Record<BadgeType, BadgeMeta> = {
  CERTIFIED:         { label:"Certifié",             shortLabel:"Certifié",    icon:ShieldCheck, color:"text-blue-700",    bg:"bg-blue-50",    border:"border-blue-200",  emoji:"✅" },
  TRUSTED_BUYER:     { label:"Acheteur de confiance", shortLabel:"Confiance",  icon:ThumbsUp,    color:"text-emerald-700", bg:"bg-emerald-50", border:"border-emerald-200",emoji:"👍" },
  VIP_BUYER:         { label:"Acheteur VIP",          shortLabel:"VIP",        icon:Crown,       color:"text-purple-700",  bg:"bg-purple-50",  border:"border-purple-200", emoji:"👑" },
  TOP_SELLER:        { label:"Top vendeur",           shortLabel:"Top vendeur",icon:TrendingUp,  color:"text-orange-700",  bg:"bg-orange-50",  border:"border-orange-200", emoji:"🏆" },
  BEST_VENDOR_WEEK:  { label:"Meilleur vendeur",      shortLabel:"Semaine",    icon:Award,       color:"text-yellow-700",  bg:"bg-yellow-50",  border:"border-yellow-200", emoji:"⭐" },
  VERIFIED_VENDOR:   { label:"Vendeur vérifié",       shortLabel:"Vérifié",    icon:ShieldCheck, color:"text-blue-700",    bg:"bg-blue-50",    border:"border-blue-200",  emoji:"🔵" },
  FAST_SHIPPER:      { label:"Expédition rapide",     shortLabel:"Rapide",     icon:Zap,         color:"text-cyan-700",    bg:"bg-cyan-50",    border:"border-cyan-200",   emoji:"⚡" },
  PREMIUM_VENDOR:    { label:"Vendeur Premium",       shortLabel:"Premium",    icon:Crown,       color:"text-violet-700",  bg:"bg-violet-50",  border:"border-violet-200", emoji:"💎" },
  BEST_PRODUCT_WEEK: { label:"Meilleur produit",      shortLabel:"Du moment",  icon:Star,        color:"text-amber-700",   bg:"bg-amber-50",   border:"border-amber-200",  emoji:"🌟" },
  TRENDING:          { label:"Tendance",              shortLabel:"Tendance",   icon:TrendingUp,  color:"text-pink-700",    bg:"bg-pink-50",    border:"border-pink-200",   emoji:"🔥" },
  EDITORS_CHOICE:    { label:"Coup de cœur",          shortLabel:"Coup de cœur",icon:Award,      color:"text-rose-700",   bg:"bg-rose-50",    border:"border-rose-200",   emoji:"❤️" },
  TOP_RATED:         { label:"Très bien noté",        shortLabel:"Top noté",   icon:Star,        color:"text-yellow-700",  bg:"bg-yellow-50",  border:"border-yellow-200", emoji:"⭐" },
  RELIABLE_DELIVERY: { label:"Livreur fiable",        shortLabel:"Fiable",     icon:Truck,       color:"text-green-700",   bg:"bg-green-50",   border:"border-green-200",  emoji:"🛵" },
  TOP_DELIVERY:      { label:"Top livreur",           shortLabel:"Top livreur",icon:Award,       color:"text-teal-700",    bg:"bg-teal-50",    border:"border-teal-200",   emoji:"🏅" },
};

interface BadgeChipProps {
  type:    BadgeType;
  size?:   "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function BadgeChip({ type, size = "sm", showLabel = true, className }: BadgeChipProps) {
  const meta = BADGE_META[type];
  if (!meta) return null;

  const Icon = meta.icon;

  const sizes = {
    xs: { wrap: "h-4 px-1.5 gap-0.5 text-[9px] rounded-md", icon: 9 },
    sm: { wrap: "h-5 px-2 gap-1 text-[10px] rounded-lg",    icon: 10 },
    md: { wrap: "h-6 px-2.5 gap-1 text-xs rounded-xl",      icon: 12 },
  };
  const s = sizes[size];

  return (
    <span
      title={meta.label}
      className={cn(
        "inline-flex items-center font-bold font-poppins border shrink-0",
        meta.bg, meta.color, meta.border,
        s.wrap,
        className,
      )}>
      <Icon size={s.icon} strokeWidth={2.5} />
      {showLabel && <span>{meta.shortLabel}</span>}
    </span>
  );
}

// ── BadgeList: shows multiple badges in a row ────────────────────────────

interface BadgeListProps {
  badges:    BadgeType[];
  size?:     "xs" | "sm" | "md";
  maxShow?:  number;
  className?: string;
}

export function BadgeList({ badges, size = "sm", maxShow = 3, className }: BadgeListProps) {
  if (!badges.length) return null;

  const visible = badges.slice(0, maxShow);
  const rest    = badges.length - maxShow;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map(b => (
        <BadgeChip key={b} type={b} size={size} />
      ))}
      {rest > 0 && (
        <span className="h-5 px-1.5 bg-muted text-muted-foreground text-[10px] font-bold font-poppins rounded-lg border border-border inline-flex items-center">
          +{rest}
        </span>
      )}
    </div>
  );
}
