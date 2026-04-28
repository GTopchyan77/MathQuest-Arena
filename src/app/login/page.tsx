import { AuthForm } from "@/features/auth/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-[30px] border border-white/12 bg-slate-950/72 p-7 shadow-[0_26px_80px_rgba(2,8,23,0.5)] backdrop-blur-2xl">
        <p className="surface-label">Welcome back</p>
        <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white">Log in to your arena</h1>
        <p className="mb-7 mt-3 leading-7 text-slate-300">Continue your streak, revisit favorite puzzles, and save every new personal best.</p>
        <AuthForm mode="login" />
      </section>
    </main>
  );
}
