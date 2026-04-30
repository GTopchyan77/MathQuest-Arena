import { TeacherProtectedPage } from "@/features/auth/components/TeacherProtectedPage";
import { TeacherDashboardClient } from "@/features/teacher/components/TeacherDashboardClient";

export default function TeacherPage() {
  return (
    <TeacherProtectedPage>
      <TeacherDashboardClient />
    </TeacherProtectedPage>
  );
}
