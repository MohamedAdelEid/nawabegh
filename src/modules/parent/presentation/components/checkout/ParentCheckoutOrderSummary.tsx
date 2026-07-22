"use client";

import { BadgePercent, GraduationCap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ParentCourseSummary } from "@/modules/parent/domain/types/parentLearning.types";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import type { CheckoutSessionDto } from "@/modules/student/domain/enrollment/enrollment.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

type ParentCheckoutOrderSummaryProps = {
  course: ParentCourseSummary;
  session: CheckoutSessionDto;
  childName?: string | null;
  variant?: "default" | "activation";
};

export function ParentCheckoutOrderSummary({
  course,
  session,
  childName,
  variant = "default",
}: ParentCheckoutOrderSummaryProps) {
  const t = useTranslations("parent.dashboard.checkout");
  const locale = useLocale();
  const { pricing } = session;
  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formatMoney = (value: number) =>
    locale.startsWith("ar")
      ? `${formatter.format(value)} ${pricing.currency || "ر.ع"}`
      : `${pricing.currency || "OMR"} ${formatter.format(value)}`;

  const isActivation = variant === "activation";
  const coverUrl = resolveFileUrl(course.coverImageUrl);

  return (
    <aside className="rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]">
      <h2 className="mb-5 text-lg font-bold text-[#2b415e]">{t("summary.title")}</h2>

      <div className="mb-5 rounded-xl bg-[#f8fafc] p-4">
        <div className="flex gap-3">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="size-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-[#e2e8f0] text-[#64748b]">
              <GraduationCap className="size-6" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-bold text-[#2b415e]">{course.title}</p>
            <p className="mt-1 text-xs text-[#64748b]">
              {course.gradeName || course.subjectName}
            </p>
            {childName ? (
              <p className="mt-1 text-xs font-medium text-[#1e88e5]">
                {t("summary.forChild", { name: childName })}
              </p>
            ) : null}
          </div>
        </div>

        {course.instructorName ? (
          <div className="mt-4 flex items-center gap-2 border-t border-[#e2e8f0] pt-4">
            <ParentAvatar
              url={course.instructorImageUrl}
              name={course.instructorName}
              className="size-7"
              roundedClassName="rounded-full"
            />
            <span className="text-xs font-medium text-[#64748b]">{course.instructorName}</span>
          </div>
        ) : null}
      </div>

      <dl className="space-y-3 text-sm">
        {!isActivation ? (
          <>
            <div className="flex items-center justify-between text-[#64748b]">
              <dt>{t("summary.coursePrice")}</dt>
              <dd className="font-medium text-[#2b415e]">{formatMoney(pricing.originalPrice)}</dd>
            </div>
            {pricing.discountAmount > 0 ? (
              <div className="flex items-center justify-between text-emerald-600">
                <dt>{t("summary.discount")}</dt>
                <dd className="font-bold">-{formatMoney(pricing.discountAmount)}</dd>
              </div>
            ) : null}
            {pricing.vatAmount > 0 ? (
              <div className="flex items-center justify-between text-[#64748b]">
                <dt>{t("summary.vat", { rate: Math.round(pricing.vatRate * 100) })}</dt>
                <dd className="font-medium">{formatMoney(pricing.vatAmount)}</dd>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-[#64748b]">
              <dt>{t("summary.subscriptionPrice")}</dt>
              <dd className="font-medium line-through">{formatMoney(pricing.originalPrice)}</dd>
            </div>
            <div className="flex items-center justify-between text-[#64748b]">
              <dt>{t("summary.paymentMethod")}</dt>
              <dd className="font-bold text-emerald-600">{t("summary.activationMethod")}</dd>
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
          <dt className="text-base font-bold text-[#2b415e]">
            {isActivation ? t("summary.amountRequired") : t("summary.total")}
          </dt>
          <dd className="text-xl font-bold text-[#2b415e]">
            {formatMoney(isActivation ? 0 : pricing.finalPrice)}
          </dd>
        </div>
      </dl>

      {session.referenceNumber ? (
        <p className="mt-4 text-xs text-[#94a3b8]">
          {t("summary.reference", { value: session.referenceNumber })}
        </p>
      ) : null}

      {isActivation ? (
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-[#64748b]">
          {t("summary.activationNote")}
        </p>
      ) : (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
          <BadgePercent className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t("summary.guarantee")}
        </p>
      )}
    </aside>
  );
}
