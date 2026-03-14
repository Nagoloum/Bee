"use client";

import Link from "next/link";
import { ShieldCheck, Zap, Truck } from "lucide-react";

const FEATURES = [
  { icon: ShieldCheck, text: "Paiement 100% sécurisé"     },
  { icon: Zap,         text: "Livraison en 24h"           },
  { icon: Truck,       text: "500+ vendeurs vérifiés"     },
];

const TESTIMONIALS = [
  {
    text:   "BEE a transformé mon business. Je vends maintenant partout au Cameroun.",
    author: "Amina K.",
    role:   "Vendeuse — Douala",
  },
  {
    text:   "Simple, rapide, fiable. Exactement ce dont le marché camerounais avait besoin.",
    author: "Jean-Pierre M.",
    role:   "Client fidèle — Yaoundé",
  },
];

export function AuthVisualPanel() {
  return (
    <div className="relative w-full h-full bg-ink-900 flex flex-col overflow-hidden">

      {/* Background pattern */}
      <div className="absolute inset-0 bg-dots-pattern opacity-[0.07]" />

      {/* Honey glow top-right */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-72 h-72 bg-honey-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Blob image — organic shape like the screenshot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-[85%] h-[65%]"
          style={{
            clipPath: "polygon(6% 0%, 94% 0%, 100% 6%, 100% 94%, 94% 100%, 6% 100%, 0% 94%, 0% 6%)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/cameroon-market/800/600"
            alt="BEE Marketplace"
            className="w-full h-full object-cover opacity-30"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-transparent to-ink-900/80" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full px-10 py-10">

        {/* Top — Brand */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-honey-gradient flex items-center justify-center shadow-honey">
              <span className="text-xl">🐝</span>
            </div>
            <span className="font-poppins font-black text-2xl text-white tracking-tight">BEE</span>
          </div>
          <p className="text-white/40 font-inter text-sm">Le marché qui bourdonne</p>
        </div>

        {/* Center — Headline */}
        <div className="text-center px-4">
          <h2 className="font-poppins font-black text-3xl xl:text-4xl text-white leading-tight mb-4">
            Des milliers de produits,
            <br />
            <span className="text-transparent bg-clip-text bg-honey-gradient">
              à portée de main
            </span>
          </h2>
          <p className="text-white/50 font-inter text-sm leading-relaxed max-w-xs mx-auto">
            Rejoignez la communauté BEE et découvrez le meilleur du commerce en ligne camerounais.
          </p>
        </div>

        {/* Bottom — Testimonial + features */}
        <div className="space-y-6">
          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-white/80 font-inter text-sm leading-relaxed mb-3 italic">
              "{TESTIMONIALS[0].text}"
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-honey-gradient flex items-center justify-center text-[11px] font-bold text-white">
                {TESTIMONIALS[0].author[0]}
              </div>
              <div>
                <p className="text-white text-xs font-semibold font-poppins">{TESTIMONIALS[0].author}</p>
                <p className="text-white/40 text-xs font-inter">{TESTIMONIALS[0].role}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-honey-400 text-xs">★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center justify-center gap-5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-white/50 font-inter">
                <Icon size={12} className="text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
