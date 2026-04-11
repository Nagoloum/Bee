import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { VendorJobsClient } from "@/components/vendor/vendor-jobs-client";

export const revalidate = 0;

export default async function VendorJobsPage() {
  const session = await requireRole(["VENDOR"]);
  if (!session) redirect("/sign-in");
  return <VendorJobsClient />;
}
