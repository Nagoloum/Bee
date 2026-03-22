import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId } from "@/lib/actions/vendor";
import { VendorSettingsClient } from "@/components/vendor/vendor-settings-client";

export default async function VendorSettingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-poppins font-black text-2xl text-foreground">Paramètres de la boutique</h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Gérez les informations de votre boutique</p>
      </div>
      <VendorSettingsClient vendor={vendor as any} />
    </div>
  );
}
