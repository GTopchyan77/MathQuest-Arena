import { notFound } from "next/navigation";
import { TeacherClassClient } from "@/features/teacher/components/TeacherClassClient";
import { getTeacherClassById } from "@/lib/teacherData";

export default async function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!getTeacherClassById(id)) {
    notFound();
  }

  return <TeacherClassClient classId={id} />;
}
