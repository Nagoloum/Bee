"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? "BEE Marketplace <noreply@bee.cm>";

// Format FCFA
function fcfa(n: number) {
  return new Intl.NumberFormat("fr-CM").format(n) + " FCFA";
}

// ─── ORDER CONFIRMATION ────────────────────────────────────────────────────

interface OrderConfirmationData {
  clientName:   string;
  clientEmail:  string;
  orderNumber:  string;
  items:        Array<{ name: string; quantity: number; unitPrice: number }>;
  subtotal:     number;
  deliveryFee:  number;
  discount:     number;
  total:        number;
  deliveryAddress: { fullName: string; phone: string; city?: string; address?: string };
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  const itemsHtml = data.items
    .map(i => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe0;font-family:Inter,sans-serif;font-size:14px;color:#2d2417;">
          ${i.name} × ${i.quantity}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe0;text-align:right;font-family:Inter,sans-serif;font-size:14px;color:#2d2417;font-weight:600;">
          ${fcfa(i.unitPrice * i.quantity)}
        </td>
      </tr>
    `).join("");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#F6861A,#E5750D);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <h1 style="margin:0;font-family:Poppins,sans-serif;font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
            🐝 BEE
          </h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Marketplace Cameroun</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;">
          <h2 style="margin:0 0 8px;font-family:Poppins,sans-serif;font-size:22px;font-weight:800;color:#2d2417;">
            Commande confirmée ✓
          </h2>
          <p style="margin:0 0 24px;color:#6b5b47;font-size:15px;">
            Bonjour <strong>${data.clientName}</strong>, votre commande a bien été reçue !
          </p>

          <!-- Order number -->
          <div style="background:#faf7f2;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a08060;font-weight:600;letter-spacing:1px;">NUMÉRO DE COMMANDE</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:20px;font-weight:700;color:#F6861A;">${data.orderNumber}</p>
          </div>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            ${itemsHtml}
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="font-size:13px;color:#6b5b47;padding:3px 0;">Sous-total</td>
              <td style="font-size:13px;color:#6b5b47;text-align:right;padding:3px 0;">${fcfa(data.subtotal)}</td>
            </tr>
            ${data.discount > 0 ? `
            <tr>
              <td style="font-size:13px;color:#22a07a;padding:3px 0;">Réduction</td>
              <td style="font-size:13px;color:#22a07a;text-align:right;padding:3px 0;">-${fcfa(data.discount)}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size:13px;color:#6b5b47;padding:3px 0;">Livraison</td>
              <td style="font-size:13px;color:#6b5b47;text-align:right;padding:3px 0;">${fcfa(data.deliveryFee)}</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:800;font-family:Poppins,sans-serif;color:#2d2417;padding:8px 0 3px;border-top:2px solid #f0ebe0;">TOTAL</td>
              <td style="font-size:16px;font-weight:800;font-family:Poppins,sans-serif;color:#F6861A;text-align:right;padding:8px 0 3px;border-top:2px solid #f0ebe0;">${fcfa(data.total)}</td>
            </tr>
          </table>

          <!-- Delivery -->
          <div style="background:#f0fdf8;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#22a07a;letter-spacing:1px;">ADRESSE DE LIVRAISON</p>
            <p style="margin:0;font-size:14px;color:#2d2417;font-weight:600;">${data.deliveryAddress.fullName}</p>
            <p style="margin:2px 0 0;font-size:13px;color:#6b5b47;">${data.deliveryAddress.phone}</p>
            ${data.deliveryAddress.city ? `<p style="margin:2px 0 0;font-size:13px;color:#6b5b47;">${data.deliveryAddress.city}${data.deliveryAddress.address ? " — " + data.deliveryAddress.address : ""}</p>` : ""}
          </div>

          <!-- CTA -->
          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
              style="display:inline-block;background:linear-gradient(135deg,#F6861A,#E5750D);color:#fff;font-family:Poppins,sans-serif;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
              Suivre ma commande →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#faf7f2;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a08060;">
            BEE Marketplace · Cameroun · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#F6861A;">bee.cm</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from:    FROM,
    to:      data.clientEmail,
    subject: `✅ Commande ${data.orderNumber} confirmée — BEE`,
    html,
  });
}

// ─── ORDER STATUS UPDATE ───────────────────────────────────────────────────

const STATUS_INFO: Record<string, { emoji: string; label: string; detail: string; color: string }> = {
  CONFIRMED:   { emoji:"✅", label:"Commande confirmée",  detail:"Le vendeur a accepté votre commande et commence à la préparer.",  color:"#22a07a" },
  PREPARING:   { emoji:"📦", label:"En préparation",      detail:"Votre commande est en cours de préparation par le vendeur.",       color:"#f97316" },
  READY:       { emoji:"🚚", label:"Prête à l'envoi",     detail:"Votre commande est prête et attend d'être prise en charge par le livreur.", color:"#9b7fff" },
  IN_TRANSIT:  { emoji:"🛵", label:"En route",            detail:"Votre colis est en route ! Le livreur se dirige vers vous.",      color:"#22d3a5" },
  DELIVERED:   { emoji:"🎉", label:"Livrée !",            detail:"Votre commande a été livrée. Nous espérons qu'elle vous donne entière satisfaction.", color:"#F6861A" },
  CANCELLED:   { emoji:"❌", label:"Annulée",             detail:"Votre commande a été annulée. Contactez-nous si vous pensez à une erreur.", color:"#f87171" },
};

interface StatusUpdateData {
  clientName:  string;
  clientEmail: string;
  orderNumber: string;
  status:      string;
  orderId:     string;
}

export async function sendOrderStatusUpdate(data: StatusUpdateData) {
  const info = STATUS_INFO[data.status];
  if (!info) return; // don't email for internal statuses

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <tr><td style="background:linear-gradient(135deg,#F6861A,#E5750D);border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
          <p style="margin:0;font-family:Poppins,sans-serif;font-size:28px;font-weight:900;color:#fff;">🐝 BEE</p>
        </td></tr>

        <tr><td style="background:#fff;padding:40px 32px;text-align:center;">
          <div style="font-size:52px;margin-bottom:16px;">${info.emoji}</div>
          <h2 style="margin:0 0 12px;font-family:Poppins,sans-serif;font-size:24px;font-weight:800;color:#2d2417;">
            ${info.label}
          </h2>
          <p style="margin:0 0 24px;color:#6b5b47;font-size:15px;line-height:1.6;">
            Bonjour <strong>${data.clientName}</strong>,<br/>${info.detail}
          </p>

          <div style="background:#faf7f2;border-radius:12px;padding:14px;margin-bottom:28px;display:inline-block;">
            <p style="margin:0;font-size:12px;color:#a08060;font-weight:600;">COMMANDE</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:18px;font-weight:700;color:${info.color};">${data.orderNumber}</p>
          </div>

          <div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}"
              style="display:inline-block;background:linear-gradient(135deg,#F6861A,#E5750D);color:#fff;font-family:Poppins,sans-serif;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
              Voir ma commande →
            </a>
          </div>
        </td></tr>

        <tr><td style="background:#faf7f2;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a08060;">
            BEE Marketplace · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#F6861A;">bee.cm</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from:    FROM,
    to:      data.clientEmail,
    subject: `${info.emoji} Commande ${data.orderNumber} — ${info.label}`,
    html,
  });
}
