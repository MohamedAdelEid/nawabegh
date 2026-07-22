"use client";

import { useTranslations } from "next-intl";

export function ParentPlaceholderPage({
  namespace,
}: {
  namespace: "children" | "payments" | "conversations" | "help";
}) {
  const t = useTranslations(`parent.dashboard.placeholders.${namespace}`);

  return (
    <div className="rounded-[20px] border border-[#e2e8f0] bg-white p-8 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <h1 className="text-2xl font-bold text-[#2b415e]">{t("title")}</h1>
      <p className="mt-2 text-sm text-[#64748b]">{t("description")}</p>
    </div>
  );
}
