import Pusher from "pusher";

/**
 * Instance Pusher serveur — à importer dans les routes API.
 * Destination : src/lib/pusher.ts
 */
export const pusherServer = new Pusher({
  appId:   process.env.PUSHER_APP_ID!,
  key:     process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret:  process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
  useTLS:  true,
});

/**
 * Émet un événement Pusher vers un canal utilisateur.
 * Non-bloquant — les erreurs sont loguées mais ne font pas crasher la route.
 */
export async function pushToUser(
  userId: string,
  event: string,
  data: Record<string, any>
) {
  try {
    await pusherServer.trigger(`user-${userId}`, event, data);
  } catch (err) {
    console.error(`[pusher] Failed to push ${event} to user-${userId}:`, err);
  }
}

/**
 * Événements disponibles :
 *
 * "new-order"         → vendeur : nouvelle commande reçue
 * "order-status"      → client  : statut commande mis à jour
 * "location-update"   → client  : position livreur en temps réel
 * "dispute-opened"    → admin   : nouveau litige ouvert
 * "badge-awarded"     → user    : nouveau badge reçu
 * "withdrawal-update" → vendeur : statut retrait mis à jour
 */
