import { LegalLayout, LegalSection, LegalP, LegalUl, LegalLi, LegalBox } from "@/components/legal/legal-layout";

export const metadata = { title: "Conditions Générales d'Utilisation — BEE" };

export default function CGUPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdated="14 mars 2026">

      <LegalBox>
        Ces CGU régissent l'utilisation de la plateforme BEE Marketplace accessible sur <strong>bee.cm</strong>.
        En créant un compte ou en utilisant nos services, vous acceptez ces conditions dans leur intégralité.
      </LegalBox>

      <LegalSection title="Article 1 — Présentation de la plateforme">
        <LegalP>
          BEE est une plateforme de marketplace multi-vendeurs dédiée au marché camerounais. Elle met en relation
          des acheteurs (clients), des vendeurs professionnels ou particuliers, et des livreurs indépendants.
        </LegalP>
        <LegalP>
          La plateforme est éditée et exploitée par BEE, dont le siège social est situé au Cameroun.
          Contact : <strong>contact@bee.cm</strong> — Tél : <strong>+33 6 25 83 90 07</strong>
        </LegalP>
      </LegalSection>

      <LegalSection title="Article 2 — Conditions d'accès">
        <LegalP>L'accès à BEE est ouvert à toute personne physique ou morale remplissant les conditions suivantes :</LegalP>
        <LegalUl>
          <LegalLi>Être âgé d'au moins 18 ans ou avoir l'autorisation parentale requise</LegalLi>
          <LegalLi>Disposer d'une adresse email valide</LegalLi>
          <LegalLi>Accepter les présentes conditions générales d'utilisation</LegalLi>
          <LegalLi>Se conformer aux lois et règlements en vigueur au Cameroun</LegalLi>
        </LegalUl>
        <LegalP>
          BEE se réserve le droit de refuser l'accès ou de suspendre tout compte ne respectant pas ces conditions.
        </LegalP>
      </LegalSection>

      <LegalSection title="Article 3 — Création de compte">
        <LegalP>
          Chaque utilisateur doit créer un compte personnel. Les informations fournies doivent être exactes,
          complètes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
        </LegalP>
        <LegalP>
          Trois types de comptes sont disponibles :
        </LegalP>
        <LegalUl>
          <LegalLi><strong>Compte Client</strong> : accès à l'achat de produits, suivi des commandes, wallet cashback</LegalLi>
          <LegalLi><strong>Compte Vendeur</strong> : gestion d'une boutique, publication de produits, gestion des commandes</LegalLi>
          <LegalLi><strong>Compte Livreur</strong> : prise en charge et livraison de commandes, wallet de revenus</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="Article 4 — Obligations des vendeurs">
        <LegalP>
          Les vendeurs s'engagent à :
        </LegalP>
        <LegalUl>
          <LegalLi>Ne vendre que des produits licites et conformes à la législation camerounaise</LegalLi>
          <LegalLi>Fournir des descriptions de produits exactes et non trompeuses</LegalLi>
          <LegalLi>Respecter les délais de traitement des commandes annoncés</LegalLi>
          <LegalLi>Ne pas dépasser les limites du plan d'abonnement souscrit</LegalLi>
          <LegalLi>S'acquitter des commissions de plateforme selon les tarifs en vigueur</LegalLi>
        </LegalUl>
        <LegalP>
          BEE se réserve le droit de retirer tout produit ou de suspendre tout vendeur ne respectant pas ces obligations.
        </LegalP>
      </LegalSection>

      <LegalSection title="Article 5 — Commissions et paiements">
        <LegalP>
          BEE perçoit une commission sur chaque transaction réalisée via la plateforme. Les fonds sont placés
          en escrow jusqu'à confirmation de la livraison, puis libérés vers le wallet du vendeur.
        </LegalP>
        <LegalP>
          Les livreurs perçoivent 500 FCFA par livraison réussie, crédités directement sur leur wallet.
          Les retraits sont soumis à validation par l'équipe BEE dans un délai de 48 à 72 heures ouvrables.
        </LegalP>
      </LegalSection>

      <LegalSection title="Article 6 — Responsabilités">
        <LegalP>
          BEE agit en qualité d'intermédiaire technique et ne saurait être tenue responsable de :
        </LegalP>
        <LegalUl>
          <LegalLi>La qualité, la conformité ou la sécurité des produits vendus par les vendeurs tiers</LegalLi>
          <LegalLi>Les retards de livraison indépendants de sa volonté</LegalLi>
          <LegalLi>L'utilisation frauduleuse d'un compte par un tiers</LegalLi>
          <LegalLi>Les interruptions temporaires du service pour maintenance</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="Article 7 — Propriété intellectuelle">
        <LegalP>
          Tous les éléments du site BEE (logo, design, contenus, code source) sont la propriété exclusive
          de BEE et sont protégés par le droit de la propriété intellectuelle. Toute reproduction, même
          partielle, est interdite sans autorisation écrite préalable.
        </LegalP>
        <LegalP>
          Les vendeurs conservent la propriété de leurs contenus (photos, descriptions) mais accordent à BEE
          une licence d'utilisation non exclusive pour les afficher sur la plateforme.
        </LegalP>
      </LegalSection>

      <LegalSection title="Article 8 — Résiliation">
        <LegalP>
          Vous pouvez fermer votre compte à tout moment depuis les paramètres de votre profil. BEE se réserve
          le droit de résilier tout compte sans préavis en cas de violation des présentes CGU.
        </LegalP>
      </LegalSection>

      <LegalSection title="Article 9 — Droit applicable">
        <LegalP>
          Les présentes CGU sont soumises au droit camerounais. Tout litige sera soumis aux tribunaux
          compétents du Cameroun, après tentative de règlement amiable.
        </LegalP>
      </LegalSection>

      <LegalSection title="Article 10 — Contact">
        <LegalP>
          Pour toute question relative aux présentes CGU :
        </LegalP>
        <LegalUl>
          <LegalLi>Email : contact@bee.cm</LegalLi>
          <LegalLi>Téléphone : +33 6 25 83 90 07</LegalLi>
          <LegalLi>Localisation : Cameroun</LegalLi>
        </LegalUl>
      </LegalSection>

    </LegalLayout>
  );
}
