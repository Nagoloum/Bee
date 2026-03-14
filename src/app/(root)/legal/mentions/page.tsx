import { LegalLayout, LegalSection, LegalP, LegalUl, LegalLi, LegalBox } from "@/components/legal/legal-layout";

export const metadata = { title: "Mentions légales — BEE" };

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" lastUpdated="14 mars 2026">

      <LegalBox>
        Conformément aux dispositions légales en vigueur, voici les informations légales relatives
        à la plateforme BEE Marketplace.
      </LegalBox>

      <LegalSection title="Éditeur du site">
        <LegalUl>
          <LegalLi><strong>Nom de l'entreprise</strong> : BEE Marketplace</LegalLi>
          <LegalLi><strong>Forme juridique</strong> : Entreprise individuelle / Société en cours d'immatriculation</LegalLi>
          <LegalLi><strong>Siège social</strong> : Cameroun</LegalLi>
          <LegalLi><strong>Email</strong> : contact@bee.cm</LegalLi>
          <LegalLi><strong>Téléphone</strong> : +33 6 25 83 90 07</LegalLi>
          <LegalLi><strong>Site web</strong> : bee.cm</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="Directeur de publication">
        <LegalP>
          Le directeur de publication du site est le représentant légal de BEE Marketplace.
          Pour le contacter : contact@bee.cm
        </LegalP>
      </LegalSection>

      <LegalSection title="Hébergement">
        <LegalP>Le site BEE est hébergé par les prestataires suivants :</LegalP>
        <LegalUl>
          <LegalLi>
            <strong>Vercel Inc.</strong> (hébergement applicatif)
            — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
          </LegalLi>
          <LegalLi>
            <strong>Neon Inc.</strong> (base de données PostgreSQL)
            — Hébergement cloud sécurisé
          </LegalLi>
          <LegalLi>
            <strong>Cloudflare R2</strong> (stockage de fichiers)
            — Cloudflare, Inc., San Francisco, CA, États-Unis
          </LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <LegalP>
          L'ensemble des éléments constitutifs du site BEE.cm (textes, graphiques, logotypes,
          icônes, sons, logiciels, etc.) est la propriété exclusive de BEE Marketplace ou fait
          l'objet d'une autorisation d'utilisation.
        </LegalP>
        <LegalP>
          Toute reproduction, distribution, modification, adaptation, retransmission ou publication,
          même partielle, de ces différents éléments est strictement interdite sans l'accord exprès
          et écrit de BEE Marketplace.
        </LegalP>
      </LegalSection>

      <LegalSection title="Limitation de responsabilité">
        <LegalP>
          BEE Marketplace s'efforce d'assurer l'exactitude et la mise à jour des informations
          diffusées sur ce site. Toutefois, nous ne pouvons garantir l'exactitude, la précision
          ou l'exhaustivité des informations mises à disposition.
        </LegalP>
        <LegalP>
          BEE décline toute responsabilité en cas de dommage direct ou indirect résultant de
          l'accès au site ou de l'utilisation de ses contenus. Les liens hypertextes vers d'autres
          sites ne sauraient engager la responsabilité de BEE.
        </LegalP>
      </LegalSection>

      <LegalSection title="Droit applicable">
        <LegalP>
          Le présent site est soumis au droit camerounais. En cas de litige, les tribunaux
          camerounais seront seuls compétents.
        </LegalP>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalP>
          Pour toute question ou réclamation, contactez-nous :
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
