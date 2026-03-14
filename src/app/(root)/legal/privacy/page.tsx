import { LegalLayout, LegalSection, LegalP, LegalUl, LegalLi, LegalBox } from "@/components/legal/legal-layout";

export const metadata = { title: "Politique de confidentialité — BEE" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdated="14 mars 2026">

      <LegalBox>
        BEE s'engage à protéger la vie privée de ses utilisateurs. Cette politique décrit quelles données
        nous collectons, comment nous les utilisons, et vos droits en tant qu'utilisateur.
      </LegalBox>

      <LegalSection title="1. Responsable du traitement">
        <LegalP>
          Le responsable du traitement des données personnelles est <strong>BEE Marketplace</strong>,
          opérant depuis le Cameroun.
        </LegalP>
        <LegalUl>
          <LegalLi>Email DPO : privacy@bee.cm</LegalLi>
          <LegalLi>Téléphone : +33 6 25 83 90 07</LegalLi>
          <LegalLi>Localisation : Cameroun</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <LegalP>Nous collectons les catégories de données suivantes :</LegalP>
        <LegalUl>
          <LegalLi><strong>Données d'identité</strong> : nom, prénom, adresse email, numéro de téléphone</LegalLi>
          <LegalLi><strong>Données de connexion</strong> : adresse IP, type de navigateur, pages visitées, horodatage</LegalLi>
          <LegalLi><strong>Données de transaction</strong> : historique des achats, montants, modes de paiement (sans numéros de carte)</LegalLi>
          <LegalLi><strong>Données de localisation</strong> : ville et région renseignées lors de l'inscription ou de la livraison</LegalLi>
          <LegalLi><strong>Données de communication</strong> : messages échangés via la messagerie interne, avis et commentaires</LegalLi>
          <LegalLi><strong>Données bancaires partielles</strong> : via notre prestataire Stripe (nous ne stockons jamais les numéros de carte en clair)</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="3. Finalités du traitement">
        <LegalP>Vos données sont utilisées pour :</LegalP>
        <LegalUl>
          <LegalLi>Créer et gérer votre compte utilisateur</LegalLi>
          <LegalLi>Traiter vos commandes et assurer le suivi des livraisons</LegalLi>
          <LegalLi>Sécuriser les paiements et prévenir la fraude</LegalLi>
          <LegalLi>Vous envoyer des notifications transactionnelles (confirmations, statuts)</LegalLi>
          <LegalLi>Améliorer nos services et personnaliser votre expérience</LegalLi>
          <LegalLi>Respecter nos obligations légales et réglementaires</LegalLi>
          <LegalLi>Résoudre les litiges entre acheteurs et vendeurs</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="4. Base légale du traitement">
        <LegalUl>
          <LegalLi><strong>Exécution du contrat</strong> : traitement des commandes, gestion du compte, livraison</LegalLi>
          <LegalLi><strong>Intérêt légitime</strong> : prévention de la fraude, amélioration du service, sécurité</LegalLi>
          <LegalLi><strong>Consentement</strong> : communications marketing, cookies non essentiels</LegalLi>
          <LegalLi><strong>Obligation légale</strong> : conservation de certains documents comptables et fiscaux</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="5. Partage des données">
        <LegalP>
          Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées uniquement avec :
        </LegalP>
        <LegalUl>
          <LegalLi><strong>Stripe</strong> : traitement sécurisé des paiements</LegalLi>
          <LegalLi><strong>Africa's Talking</strong> : envoi de SMS de vérification OTP</LegalLi>
          <LegalLi><strong>Resend</strong> : envoi d'emails transactionnels</LegalLi>
          <LegalLi><strong>Neon / PostgreSQL</strong> : hébergement de la base de données (données chiffrées)</LegalLi>
          <LegalLi><strong>Cloudflare R2</strong> : stockage des photos produits et documents</LegalLi>
          <LegalLi>Les vendeurs : uniquement le nom et l'adresse de livraison nécessaires à l'expédition</LegalLi>
          <LegalLi>Les autorités compétentes : sur réquisition judiciaire uniquement</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="6. Durée de conservation">
        <LegalUl>
          <LegalLi>Données de compte actif : pendant toute la durée de vie du compte</LegalLi>
          <LegalLi>Données de compte supprimé : 3 ans après la suppression (obligations légales)</LegalLi>
          <LegalLi>Données de transaction : 7 ans (obligations comptables)</LegalLi>
          <LegalLi>Logs de connexion : 12 mois maximum</LegalLi>
          <LegalLi>Cookies non essentiels : 13 mois maximum</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="7. Vos droits">
        <LegalP>
          Conformément aux réglementations applicables, vous disposez des droits suivants sur vos données :
        </LegalP>
        <LegalUl>
          <LegalLi><strong>Droit d'accès</strong> : obtenir une copie de vos données</LegalLi>
          <LegalLi><strong>Droit de rectification</strong> : corriger des données inexactes</LegalLi>
          <LegalLi><strong>Droit à l'effacement</strong> : demander la suppression de vos données</LegalLi>
          <LegalLi><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</LegalLi>
          <LegalLi><strong>Droit d'opposition</strong> : vous opposer à certains traitements</LegalLi>
          <LegalLi><strong>Droit de retrait du consentement</strong> : à tout moment pour les traitements basés sur le consentement</LegalLi>
        </LegalUl>
        <LegalP>
          Pour exercer ces droits, contactez-nous à : <strong>privacy@bee.cm</strong>
          Nous répondrons dans un délai de 30 jours.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <LegalP>
          BEE met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
          chiffrement HTTPS, mots de passe hashés avec scrypt, accès aux données restreint au personnel autorisé,
          audits de sécurité réguliers, et hébergement chez des prestataires certifiés.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Modifications">
        <LegalP>
          Nous pouvons modifier cette politique à tout moment. En cas de modification substantielle, nous vous
          notifierons par email ou via une bannière visible sur la plateforme. La date de dernière mise à jour
          est indiquée en haut de cette page.
        </LegalP>
      </LegalSection>

    </LegalLayout>
  );
}
