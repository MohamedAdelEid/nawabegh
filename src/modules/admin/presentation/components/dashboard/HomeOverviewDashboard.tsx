"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { getAdminHomeNavItems } from "@/modules/admin/domain/data/adminHomeNavItems";
import { getHomeNavEntranceDirection } from "@/modules/admin/domain/utils/homeNavEntrance";
import { HomeNavCard } from "@/modules/admin/presentation/components/dashboard/HomeNavCard";
import { HomeOverviewAnimatedSection } from "@/modules/admin/presentation/components/dashboard/HomeOverviewAnimatedSection";

export function HomeOverviewDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const navItems = getAdminHomeNavItems();

  return (
    <div className="space-y-8 overflow-visible">
      <HomeOverviewAnimatedSection direction="top" delay={0}>
        <DashboardPageHeader
          title={t("homeNav.title")}
          description={t("homeNav.description")}
          breadcrumbs={[{ label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME }]}
        />
      </HomeOverviewAnimatedSection>

      <section className="grid gap-4 overflow-visible sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {navItems.map((item, index) => (
          <HomeNavCard
            key={item.id}
            title={item.labelKey ? t(item.labelKey) : (item.label ?? "")}
            description={t(`homeNav.cards.${item.id}.description`)}
            href={item.href}
            icon={item.icon}
            accentIndex={index}
            entranceDirection={getHomeNavEntranceDirection(index)}
            animationDelay={0.06 + index * 0.055}
            openLabel={t("homeNav.openSection")}
            onNavigate={(href) => router.push(href)}
          />
        ))}
      </section>
    </div>
  );
}
