import { ProtectedPage } from "@/features/auth/components/ProtectedPage";
import { ProfileClient } from "@/features/profile/components/ProfileClient";

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <ProfileClient />
    </ProtectedPage>
  );
}
