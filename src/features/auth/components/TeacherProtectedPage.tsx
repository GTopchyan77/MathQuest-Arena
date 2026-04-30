"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";
import { Button } from "@/shared/components/ui/Button";
import { ProtectedPage } from "@/features/auth/components/ProtectedPage";

export function TeacherProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPage>
      <TeacherRoleGate>{children}</TeacherRoleGate>
    </ProtectedPage>
  );
}

function TeacherRoleGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await getCurrentProfile(user.id);
        if (!active) return;

        setIsTeacher(profile?.role === "teacher");
      } catch (error) {
        console.error("[teacher access] Failed to load current profile.", error);
        if (!active) return;
        setIsTeacher(false);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRole();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return <main className="mx-auto max-w-7xl px-4 py-16 text-lg font-bold text-ink/70">Checking teacher access...</main>;
  }

  if (!isTeacher) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-black text-ink">Teacher access required</h1>
          <p className="mt-3 leading-7 text-ink/64">
            This classroom view is only available to teacher accounts. Student and player accounts can keep using the main MathQuest
            dashboard.
          </p>
          <Button className="mt-6" href="/dashboard" variant="secondary">
            Back to dashboard
          </Button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
