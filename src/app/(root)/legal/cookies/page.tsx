import { LegalLayout, LegalSection, LegalP, LegalUl, LegalLi, LegalBox } from "@/components/legal/legal-layout";

export const metadata = { title: "Politique de cookies — BEE" };

export default function CookiesPage() {
  return (
    <LegalLayout title="Politique de cookies" lastUpdated="14 mars 2026">

      <LegalBox>
        BEE utilise des cookies et technologies similaires pour assurer le fonctionnement du site,
        améliorer votre expérience et analyser notre trafic. Cette page explique ce que sont les cookies,
        lesquels nous utilisons et comment les gérer.
      </LegalBox>

      <LegalSection title="1. Qu'est-ce qu'un cookie ?">
        <LegalP>
          Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette)
          lors de votre visite sur un site web. Il permet au site de mémoriser vos actions et préférences
          (connexion, langue, paramètres d'affichage) pendant une durée déterminée.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Cookies strictement nécessaires">
        <LegalP>
          Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.
        </LegalP>
        <LegalUl>
          <LegalLi>
            <strong>better-auth.session_token</strong> — Session d'authentification.
            Durée : 30 jours. Permet de maintenir votre connexion.
          </LegalLi>
          <LegalLi>
            <strong>bee-cart</strong> — Panier d'achat local.
            Durée : persistant (localStorage). Sauvegarde le contenu de votre panier.
          </LegalLi>
          <LegalLi>
            <strong>__Secure-*</strong> — Variantes sécurisées des cookies de session sur HTTPS.
          </LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="3. Cookies fonctionnels">
        <LegalP>
          Ces cookies améliorent votre expérience mais ne sont pas essentiels au fonctionnement du site.
        </LegalP>
        <LegalUl>
          <LegalLi>
            <strong>bee-locale</strong> — Langue préférée (fr / en).
            Durée : 12 mois.
          </LegalLi>
          <LegalLi>
            <strong>bee-theme</strong> — Thème clair ou sombre.
            Durée : 12 mois.
          </LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="4. Cookies analytiques">
        <LegalP>
          Ces cookies nous permettent de comprendre comment les visiteurs utilisent le site,
          afin d'améliorer nos services. Ils sont anonymisés.
        </LegalP>
        <LegalUl>
          <LegalLi>
            <strong>Analyse interne</strong> — Mesure des pages vues, parcours utilisateur, taux de conversion.
            Ces données ne sont pas partagées avec des tiers.
          </LegalLi>
        </LegalUl>
        <LegalP>
          <em>Note : nous n'utilisons pas Google Analytics ni aucun outil de tracking tiers invasif.</em>
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Cookies tiers">
        <LegalP>Certains de nos prestataires déposent des cookies tiers :</LegalP>
        <LegalUl>
          <LegalLi>
            <strong>Stripe</strong> — Sécurisation des paiements en ligne.
            Politique : stripe.com/privacy
          </LegalLi>
          <LegalLi>
            <strong>Google OAuth</strong> — Authentification via votre compte Google (si vous choisissez cette option).
            Politique : policies.google.com/privacy
          </LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="6. Durée de conservation">
        <LegalUl>
          <LegalLi>Cookies de session : supprimés à la fermeture du navigateur</LegalLi>
          <LegalLi>Cookies persistants : maximum 13 mois à partir du dépôt</LegalLi>
          <LegalLi>LocalStorage (panier) : conservé jusqu'à effacement manuel ou suppression du compte</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="7. Gérer vos cookies">
        <LegalP>
          Vous pouvez à tout moment modifier vos préférences de cookies depuis les paramètres
          de votre navigateur ou depuis le panneau de gestion des cookies disponible sur notre site.
        </LegalP>
        <LegalP>
          <strong>Attention :</strong> désactiver les cookies strictement nécessaires peut empêcher
          l'utilisation de certaines fonctionnalités essentielles du site (connexion, panier, paiement).
        </LegalP>
        <LegalUl>
          <LegalLi>Chrome : Paramètres → Confidentialité et sécurité → Cookies</LegalLi>
          <LegalLi>Firefox : Paramètres → Vie privée et sécurité → Cookies</LegalLi>
          <LegalLi>Safari : Préférences → Confidentialité → Bloquer les cookies</LegalLi>
          <LegalLi>Edge : Paramètres → Confidentialité, recherche et services → Cookies</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="8. Contact">
        <LegalP>Pour toute question relative à notre utilisation des cookies :</LegalP>
        <LegalUl>
          <LegalLi>Email : privacy@bee.cm</LegalLi>
          <LegalLi>Téléphone : +33 6 25 83 90 07</LegalLi>
          <LegalLi>Localisation : Cameroun</LegalLi>
        </LegalUl>
      </LegalSection>

    </LegalLayout>
  );
}
