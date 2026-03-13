import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  shop: {
    title: "Boutique",
    links: [
      { href: "/products",    label: "Tous les produits" },
      { href: "/flash-sales", label: "Ventes Flash ⚡"   },
      { href: "/shops",       label: "Boutiques"         },
      { href: "/categories",  label: "Catégories"        },
    ],
  },
  sell: {
    title: "Vendre",
    links: [
      { href: "/sign-up/vendor",   label: "Ouvrir une boutique" },
      { href: "/pricing",          label: "Nos offres"           },
      { href: "/vendor/resources", label: "Ressources vendeurs"  },
      { href: "/affiliate",        label: "Affiliation"          },
    ],
  },
  deliver: {
    title: "Livrer",
    links: [
      { href: "/sign-up/delivery", label: "Devenir livreur"   },
      { href: "/delivery/pricing", label: "Offres livreurs"   },
      { href: "/delivery/faq",     label: "FAQ Livreurs"      },
    ],
  },
  company: {
    title: "BEE",
    links: [
      { href: "/about",   label: "À propos"    },
      { href: "/blog",    label: "Blog"         },
      { href: "/careers", label: "Carrières"    },
      { href: "/contact", label: "Contact"      },
    ],
  },
};

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://facebook.com",  label: "Facebook",  icon: Facebook  },
  { href: "https://twitter.com",   label: "Twitter",   icon: Twitter   },
  { href: "https://youtube.com",   label: "YouTube",   icon: Youtube   },
];

export function Footer() {
  return (
    <footer className="bg-secondary text-white mt-auto">
      {/* Top CTA band */}
      <div className="border-b border-white/10">
        <div className="container-bee py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-poppins font-bold text-xl text-white">
              Prêt à vendre sur BEE ? 🐝
            </h3>
            <p className="text-sm text-white/60 mt-1 font-inter">
              Rejoignez des centaines de vendeurs qui développent leur activité.
            </p>
          </div>
          <Link
            href="/sign-up/vendor"
            className="shrink-0 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-white font-poppins font-semibold text-sm hover:bg-primary-hover transition-colors shadow-honey"
          >
            Ouvrir ma boutique
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-bee py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-honey-gradient flex items-center justify-center">
                <span className="text-xl">🐝</span>
              </div>
              <span className="font-poppins font-black text-xl text-white">BEE</span>
            </Link>
            <p className="text-sm text-white/50 font-inter leading-relaxed mb-4">
              Le marché en ligne du Cameroun. Des milliers de produits, des centaines de vendeurs vérifiés.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-poppins font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors font-inter"
                    >
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
          <a href="mailto:contact@bee.cm" className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors font-inter group">
            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center shrink-0">
              <Mail size={14} className="text-primary" />
            </span>
            contact@bee.cm
          </a>
          <a href="tel:+237699000000" className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors font-inter group">
            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center shrink-0">
              <Phone size={14} className="text-primary" />
            </span>
            +237 699 000 000
          </a>
          <div className="flex items-center gap-3 text-sm text-white/50 font-inter">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-primary" />
            </span>
            Yaoundé & Douala, Cameroun
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-bee py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-inter">
          <p>© {new Date().getFullYear()} BEE. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/legal/cgu"      className="hover:text-white/70 transition-colors">CGU</Link>
            <Link href="/legal/privacy"  className="hover:text-white/70 transition-colors">Confidentialité</Link>
            <Link href="/legal/mentions" className="hover:text-white/70 transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
