"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { configured, loading, user } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <main className="mx-auto max-w-7xl px-4 py-16 text-lg font-bold text-ink/70">Loading your arena...</main>;
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-black text-ink">Supabase setup needed</h1>
          <p className="mt-3 leading-7 text-ink/64">
            Add your Supabase URL and anon key to `.env.local`, then run the schema in `supabase/schema.sql` to enable auth and saved progress.
          </p>
          <Button className="mt-6" href="/games" variant="secondary">
            Preview games
          </Button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-black text-ink">Log in to continue</h1>
          <p className="mt-3 leading-7 text-ink/64">Your dashboard, profile, and saved scores are connected to your MathQuest account.</p>
          <Button asChild className="mt-6">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Log in</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
