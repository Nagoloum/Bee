"use client";

import { useState } from "react";
import { Copy, Share2, Check, Users, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface ReferralSectionProps {
  userId:   string;
  userName: string;
  role:     string;
  stats?: {
    totalReferrals:   number;
    pendingReferrals: number;
    earnedBonus:      number;
    pendingBonus:     number;
  };
}

export function ReferralSection({ userId, userName, role, stats }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "https://bee.cm";
  const roleSlug   = role === "VENDOR" ? "vendor" : role === "DELIVERY" ? "delivery" : "";
  const refPath    = roleSlug ? `/sign-up/${roleSlug}` : "/sign-up";
  const referralLink = `${baseUrl}${refPath}?ref=${userId}`;

  const defaultStats = stats ?? {
    totalReferrals:   0,
    pendingReferrals: 0,
    earnedBonus:      0,
    pendingBonus:     0,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Rejoins BEE avec moi !",
        text:  `${userName} t'invite à rejoindre BEE Marketplace. Crée ton compte et reçois une récompense !`,
        url:   referralLink,
      });
    } else {
      copyLink();
    }
  };

  const rewardLabel = role === "VENDOR"
    ? "50% sur votre 1er abonnement + boost visibilité"
    : role === "DELIVERY"
    ? "500 FCFA bonus à la 1ère livraison de votre filleul"
    : "1 livraison gratuite par parrainage réussi";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift size={18} className="text-primary" />
            Mon programme de parrainage
          </CardTitle>
          <Badge variant="default" size="sm">🎁 Actif</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Reward info */}
        <div className="bg-honey-50 border border-honey-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-honey-700 font-poppins uppercase tracking-wide mb-1">Votre récompense</p>
          <p className="text-sm font-semibold text-foreground font-inter">{rewardLabel}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:"Parrainages totaux",   value:defaultStats.totalReferrals,   icon:Users,     color:"text-primary"      },
            { label:"En attente",           value:defaultStats.pendingReferrals,  icon:TrendingUp,color:"text-warning-dark"  },
            { label:"Bonus gagnés",         value:`${defaultStats.earnedBonus} FCFA`,  icon:Gift, color:"text-success-dark"  },
            { label:"Bonus en cours",       value:`${defaultStats.pendingBonus} FCFA`, icon:Gift, color:"text-muted-foreground"},
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-muted rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={color} />
                <span className="text-xs text-muted-foreground font-inter">{label}</span>
              </div>
              <p className={cn("font-poppins font-bold text-base", color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Link */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground font-poppins uppercase tracking-wider mb-2">
            Votre lien de parrainage
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-2xl border border-border">
            <p className="flex-1 text-xs font-mono text-foreground truncate">{referralLink}</p>
            <button onClick={copyLink}
              className={cn(
                "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                copied ? "bg-success text-white" : "bg-white border border-border hover:border-primary hover:text-primary"
              )}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Share button */}
        <Button onClick={shareLink} fullWidth leftIcon={<Share2 size={16} />} variant="outline">
          Partager mon lien de parrainage
        </Button>

        <p className="text-xs text-muted-foreground font-inter text-center leading-relaxed">
          Partagez ce lien sur WhatsApp, Facebook ou par SMS.
          Votre identifiant est unique et vous permet d'être reconnu.
        </p>
      </CardContent>
    </Card>
  );
}
