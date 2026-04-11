import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { userVerifications, userBadges } from "@/lib/db/schema/badges";
import { users, deliveryAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { VerificationPanel } from "@/components/ui/verification-panel";
import { BadgeChip, BadgeList, BadgeType } from "@/components/ui/badge-chip";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { Settings, Package, Wallet, MapPin } from "lucide-react";

export const revalidate = 0;

export default async function ClientProfilePage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = (session.user as any).id;

  // Fetch verification status + badges in parallel
  const [verifRows, badgeRows, addressRows] = await Promise.all([
    db.select().from(userVerifications).where(eq(userVerifications.userId, userId)).limit(1),
    db.select().from(userBadges)
      .where(eq(userBadges.userId, userId))
      .where(eq(userBadges.isActive, true)),
    db.select().from(deliveryAddresses)
      .where(eq(deliveryAddresses.userId, userId))
      .where(eq(deliveryAddresses.isDefault, true))
      .limit(1),
  ]);

  const verif   = verifRows[0];
  const badges  = badgeRows.map(b => b.type as BadgeType);
  const address = addressRows[0];

  const user     = session.user as any;
  const isCertified = verif?.emailVerified && verif?.phoneVerified;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-bee max-w-2xl space-y-6">

        {/* ── Header profil ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-border p-6">
          <div className="flex items-start gap-4">
            <Avatar name={user.name ?? "U"} size="xl" color="honey" />
            <div className="flex-1 min-w-0">
              <h1 className="font-poppins font-black text-xl text-foreground">
                {user.name}
              </h1>
              <p className="text-sm text-muted-foreground font-inter">{user.email}</p>

              {/* Badges */}
              {badges.length > 0 && (
                <BadgeList badges={badges} size="sm" maxShow={4} className="mt-2" />
              )}

              {/* Statut certifié */}
              {isCertified ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <BadgeChip type="CERTIFIED" size="sm" />
                </div>
              ) : (
                <p className="text-xs font-inter text-amber-600 mt-2">
                  Vérifiez votre email et téléphone pour obtenir le badge Certifié
                </p>
              )}
            </div>
            <Link href="/account/settings"
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-border hover:bg-muted transition-colors shrink-0">
              <Settings size={14} className="text-muted-foreground" />
            </Link>
          </div>

          {/* Adresse par défaut */}
          {address && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <MapPin size={13} className="text-muted-foreground shrink-0" />
              <p className="text-xs font-inter text-muted-foreground">
                {address.street}, {address.city}, {address.region}
              </p>
            </div>
          )}
        </div>

        {/* ── Liens rapides ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/orders",  icon: Package, label: "Mes commandes" },
            { href: "/wallet",  icon: Wallet,  label: "Mon portefeuille" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:bg-cream-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-primary" />
              </div>
              <p className="font-poppins font-semibold text-sm text-foreground">{label}</p>
            </Link>
          ))}
        </div>

        {/* ── Vérification email + téléphone ─────────────────────────── */}
        <div className="bg-white rounded-3xl border border-border p-6">
          <h2 className="font-poppins font-bold text-base text-foreground mb-4">
            Vérification du compte
          </h2>
          <VerificationPanel
            userId={userId}
            emailVerified={verif?.emailVerified ?? (session.user as any).emailVerified ?? false}
            phoneVerified={verif?.phoneVerified ?? (session.user as any).phoneVerified ?? false}
            userEmail={session.user.email ?? ""}
            userPhone={(session.user as any).phone ?? ""}
          />
        </div>

      </div>
    </div>
  );
}
