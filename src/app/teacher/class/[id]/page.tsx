import { TeacherProtectedPage } from "@/features/auth/components/TeacherProtectedPage";
import { TeacherClassClient } from "@/features/teacher/components/TeacherClassClient";

export default async function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <TeacherProtectedPage>
      <TeacherClassClient classId={id} />
    </TeacherProtectedPage>
  );
}
