import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  shop: {
    title: "Boutique",
    links: [
      { href:"/products",    label:"Tous les produits"   },
      { href:"/flash-sales", label:"Ventes Flash ⚡"     },
      { href:"/shops",       label:"Boutiques"           },
      { href:"/categories",  label:"Catégories"          },
    ],
  },
  partner: {
    title: "Rejoindre BEE",
    links: [
      { href:"/sign-up/vendor",   label:"🏪 Ouvrir une boutique" },
      { href:"/sign-up/delivery", label:"🛵 Devenir livreur"     },
      { href:"/pricing",          label:"Nos offres"              },
      { href:"/affiliate",        label:"Affiliation"             },
    ],
  },
  company: {
    title: "BEE",
    links: [
      { href:"/about",   label:"À propos"  },
      { href:"/blog",    label:"Blog"      },
      { href:"/careers", label:"Carrières" },
      { href:"/contact", label:"Contact"   },
    ],
  },
  legal: {
    title: "Légal",
    links: [
      { href:"/legal/cgu",      label:"CGU"                     },
      { href:"/legal/privacy",  label:"Confidentialité"         },
      { href:"/legal/mentions", label:"Mentions légales"        },
      { href:"/legal/cookies",  label:"Cookies"                 },
    ],
  },
};

const socialLinks = [
  { href:"https://instagram.com", label:"Instagram", Icon: Instagram },
  { href:"https://facebook.com",  label:"Facebook",  Icon: Facebook  },
  { href:"https://twitter.com",   label:"Twitter",   Icon: Twitter   },
  { href:"https://youtube.com",   label:"YouTube",   Icon: Youtube   },
];

// App store SVG icons (simplified)
function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-secondary text-white mt-auto">

      {/* App Store Buttons */}
      <div className="border-b border-white/10">
        <div className="container-bee py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="font-poppins font-bold text-base text-white mb-0.5">📱 BEE sur mobile</p>
            <p className="text-sm text-white/50 font-inter">Téléchargez l'app — disponible bientôt</p>
          </div>
          <div className="flex gap-3">
            <button disabled className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 opacity-60 cursor-not-allowed">
              <AppleIcon />
              <div className="text-left">
                <p className="text-[10px] text-white/60 font-inter leading-none">Bientôt sur</p>
                <p className="text-sm font-poppins font-semibold text-white leading-tight">App Store</p>
              </div>
            </button>
            <button disabled className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 opacity-60 cursor-not-allowed">
              <PlayIcon />
              <div className="text-left">
                <p className="text-[10px] text-white/60 font-inter leading-none">Bientôt sur</p>
                <p className="text-sm font-poppins font-semibold text-white leading-tight">Google Play</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-bee py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-honey-gradient flex items-center justify-center">
                <span className="text-xl">🐝</span>
              </div>
              <span className="font-poppins font-black text-xl text-white">BEE</span>
            </Link>
            <p className="text-sm text-white/50 font-inter leading-relaxed mb-5">
              Le marché en ligne du Cameroun. Des milliers de produits, des centaines de vendeurs vérifiés.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary transition-colors flex items-center justify-center">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-poppins font-semibold text-xs text-white mb-4 uppercase tracking-widest">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors font-inter">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 pt-8 border-t border-white/10 grid sm:grid-cols-3 gap-4">
          {[
            { href:"mailto:contact@bee.cm",    Icon:Mail,  text:"contact@bee.cm"   },
            { href:"tel:+237699000000",        Icon:Phone, text:"+237 699 000 000" },
            { href:"#",                        Icon:MapPin,text:"Yaoundé & Douala, CM" },
          ].map(({ href, Icon, text }) => (
            <a key={text} href={href}
              className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors font-inter group">
              <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center shrink-0">
                <Icon size={14} className="text-primary" />
              </span>
              {text}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container-bee py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30 font-inter">
          <p>© {new Date().getFullYear()} BEE Marketplace. Tous droits réservés.</p>
          <p>Fait avec 🐝 au Cameroun</p>
        </div>
      </div>
    </footer>
  );
}
