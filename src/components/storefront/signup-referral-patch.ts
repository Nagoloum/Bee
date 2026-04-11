"use client";

/**
 * PATCH pour src/app/(auth)/sign-up/page.tsx (ou sign-up/client/page.tsx)
 *
 * Ajoutez cet import :
 *   import { processReferralAfterSignup } from "@/lib/actions/referral-client";
 *
 * Dans la fonction onSubmit/handleSignup, APRÈS que l'inscription ait réussi
 * et que vous ayez le userId du nouvel utilisateur, ajoutez :
 *
 *   await processReferralAfterSignup(newUser.id);
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Cette fonction lit le code depuis sessionStorage et appelle l'API.
 */

export async function processReferralAfterSignup(newUserId: string) {
  try {
    const refCode = sessionStorage.getItem("bee_ref_code");
    if (!refCode) return;

    // Appel API qui déclenche processReferral() côté serveur
    const res = await fetch("/api/referral/process", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ newUserId, refCode }),
    });

    if (res.ok) {
      sessionStorage.removeItem("bee_ref_code");
      console.log("[referral] Processed successfully");
    }
  } catch (err) {
    console.error("[referral] Error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// EXEMPLE — comment intégrer dans votre page signup existante :
// ─────────────────────────────────────────────────────────────────────────
//
// const handleSignup = async (data: SignupForm) => {
//   setLoading(true);
//   try {
//     const result = await authClient.signUp.email({
//       email:    data.email,
//       password: data.password,
//       name:     data.name,
//     });
//
//     if (result.data?.user?.id) {
//       // ✅ PATCH — Traiter le parrainage
//       await processReferralAfterSignup(result.data.user.id);
//     }
//
//     router.push("/");
//   } catch (err) { ... }
//   finally { setLoading(false); }
// };

export {};
