"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Gift, Users, TrendingUp, Loader2, Share2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/cn";

interface ReferralData {
  code: string; link: string; totalReferrals: number;
  bonusPerReferral: number; recent: Array<{ createdAt: string; status: string; bonus: number }>;
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <p className="text-sm text-muted-foreground font-inter">{label}</p>
      </div>
      <p className="font-poppins font-black text-2xl text-foreground">{value}</p>
    </div>
  );
}

export default function ReferralPage() {
  const [data,    setData]    = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState<"code" | "link" | null>(null);

  useEffect(() => {
    fetch("/api/referral")
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const copy = (type: "code" | "link") => {
    if (!data) return;
    navigator.clipboard.writeText(type === "code" ? data.code : data.link);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const share = async () => {
    if (!data) return;
    if (navigator.share) {
      await navigator.share({
        title: "Rejoins BEE Marketplace !",
        text:  `Utilise mon code ${data.code} et reçois 1 000 FCFA de bonus sur ta première commande.`,
        url:   data.link,
      });
    } else {
      copy("link");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">🐝</div>
        <h1 className="font-poppins font-black text-2xl text-foreground">Parrainage BEE</h1>
        <p className="text-muted-foreground font-inter text-sm mt-2 max-w-sm mx-auto">
          Invitez vos amis et recevez <strong className="text-primary">{formatPrice(data?.bonusPerReferral ?? 2000)}</strong> pour
          chaque filleul inscrit. Eux reçoivent <strong className="text-success-dark">1 000 FCFA</strong> de bienvenue !
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Users} label="Filleuls invités"
          value={String(data?.totalReferrals ?? 0)} color="#F6861A" />
        <StatCard icon={TrendingUp} label="Bonus gagnés"
          value={formatPrice((data?.totalReferrals ?? 0) * (data?.bonusPerReferral ?? 2000))}
          color="#22a07a" />
      </div>

      {/* Code share */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div>
          <p className="text-xs font-bold font-poppins text-muted-foreground mb-2 uppercase tracking-wider">
            Votre code de parrainage
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-cream-100 rounded-xl px-4 py-3 font-mono font-bold text-xl text-primary tracking-widest text-center border-2 border-dashed border-primary/30">
              {data?.code}
            </div>
            <button onClick={() => copy("code")}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: copied === "code" ? "rgba(34,160,122,0.1)" : "rgba(246,134,26,0.1)" }}>
              {copied === "code"
                ? <Check size={18} className="text-success-dark" />
                : <Copy size={18} className="text-primary" />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold font-poppins text-muted-foreground mb-2 uppercase tracking-wider">
            Lien de parrainage
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-cream-100 rounded-xl px-3 py-2 font-inter text-xs text-muted-foreground truncate border border-border">
              {data?.link}
            </div>
            <button onClick={() => copy("link")}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(246,134,26,0.1)" }}>
              {copied === "link" ? <Check size={14} className="text-success-dark" /> : <Copy size={14} className="text-primary" />}
            </button>
          </div>
        </div>

        <button onClick={share}
          className="w-full h-11 rounded-xl font-poppins font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{ background:"linear-gradient(135deg,#F6861A,#E5750D)" }}>
          <Share2 size={15} /> Partager maintenant
        </button>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-poppins font-bold text-base text-foreground mb-4">Comment ça marche ?</h3>
        <div className="space-y-3">
          {[
            { step:"1", text:"Partagez votre code ou lien avec vos amis", icon:"📤" },
            { step:"2", text:"Ils s'inscrivent via votre lien et reçoivent 1 000 FCFA", icon:"🎁" },
            { step:"3", text:`Vous recevez ${formatPrice(data?.bonusPerReferral ?? 2000)} dans votre wallet BEE`, icon:"💰" },
          ].map(({ step, text, icon }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-poppins font-black text-xs shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-sm font-inter text-foreground-secondary leading-relaxed">{icon} {text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent referrals */}
      {(data?.recent?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-poppins font-bold text-base text-foreground mb-4">
            Filleuls récents ({data!.recent.length})
          </h3>
          <div className="space-y-2">
            {data!.recent.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-poppins font-bold text-xs text-primary">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold font-poppins text-foreground">Filleul invité</p>
                    <p className="text-xs text-muted-foreground font-inter">
                      {new Date(r.createdAt).toLocaleDateString("fr-CM")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-poppins text-success-dark">
                    +{formatPrice(r.bonus)}
                  </p>
                  <p className="text-xs text-muted-foreground font-inter capitalize">{r.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
