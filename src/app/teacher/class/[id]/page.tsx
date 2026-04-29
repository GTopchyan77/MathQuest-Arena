import { notFound } from "next/navigation";
import { TeacherClassClient } from "@/features/teacher/components/TeacherClassClient";
import { getTeacherClassById, getTeacherClasses } from "@/lib/teacherData";

export default async function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teacherClass = getTeacherClassById(id) ?? (id === "1" ? getTeacherClasses()[0] : null);

  if (!teacherClass) {
    notFound();
  }

  return <TeacherClassClient classId={teacherClass.id} />;
}
