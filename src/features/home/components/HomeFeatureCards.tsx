"use client";

import { Brain, Sparkles, Trophy } from "lucide-react";
import { FeatureCard } from "@/shared/components/ui/FeatureCard";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HomeFeatureCards() {
  const { user } = useAuth();

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <FeatureCard
        body="Games scale from quick recall to deeper pattern reasoning."
        href="/games"
        icon={Brain}
        title="Adaptive play"
      />
      <FeatureCard
        body="Every session can feed XP, streaks, and leaderboard momentum."
        href={user ? "/dashboard" : "/register"}
        icon={Trophy}
        title="Motivating progress"
      />
      <FeatureCard
        body="Clean responsive screens keep practice focused and rewarding."
        href="/games"
        icon={Sparkles}
        title="Premium feel"
      />
    </div>
  );
}
