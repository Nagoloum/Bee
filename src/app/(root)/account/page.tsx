import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { AccountClient } from "@/components/auth/account-client";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/account");

  return <AccountClient user={session.user as any} />;
}
