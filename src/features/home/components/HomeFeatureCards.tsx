"use client";

import { Brain, Sparkles, Trophy } from "lucide-react";
import { FeatureCard } from "@/shared/components/ui/FeatureCard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocale } from "@/lib/i18n/useLocale";

export function HomeFeatureCards() {
  const { user } = useAuth();
  const { t } = useLocale();

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <FeatureCard
        body={t("home.features.adaptiveBody")}
        href="/games"
        icon={Brain}
        title={t("home.features.adaptiveTitle")}
      />
      <FeatureCard
        body={t("home.features.progressBody")}
        href={user ? "/dashboard" : "/register"}
        icon={Trophy}
        title={t("home.features.progressTitle")}
      />
      <FeatureCard
        body={t("home.features.premiumBody")}
        href="/games"
        icon={Sparkles}
        title={t("home.features.premiumTitle")}
      />
    </div>
  );
}
