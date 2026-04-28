import { ProtectedPage } from "@/features/auth/components/ProtectedPage";
import { DashboardClient } from "@/features/dashboard/components/DashboardClient";

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <DashboardClient />
    </ProtectedPage>
  );
}
