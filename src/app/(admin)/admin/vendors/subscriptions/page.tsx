import { AdminGrantSubscription } from "@/components/admin/admin-grant-subscription";

export default function AdminGrantSubscriptionPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-poppins font-black text-2xl text-white mb-6">
        Abonnements gratuits
      </h1>
      <AdminGrantSubscription />
    </div>
  );
}
