"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { getInitials } from "./paymentDisplay";

const NAV_ITEMS = [
  { id: "overview", href: ROUTES.ADMIN.PAYMENTS.OVERVIEW },
  { id: "transactions", href: ROUTES.ADMIN.PAYMENTS.TRANSACTIONS },
  { id: "enrollments", href: ROUTES.ADMIN.PAYMENTS.ENROLLMENTS },
  { id: "settings", href: ROUTES.ADMIN.PAYMENTS.SETTINGS },
] as const;

export function PaymentsSubNav() {
  const t = useTranslations("admin.dashboard.paymentManagement.subNav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-[0px_4px_0px_0px_#0000000D]">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.id === "enrollments" && pathname.startsWith(`${ROUTES.ADMIN.PAYMENTS.ENROLLMENTS}/`));

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              isActive
                ? "bg-[#243B5A] text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {t(item.id)}
          </Link>
        );
      })}
    </nav>
  );
}

export type PaymentPersonCellProps = {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
};

export function PaymentPersonCell({ name, email, avatarUrl }: PaymentPersonCellProps) {
  const resolvedAvatar = avatarUrl ? resolveFileUrl(avatarUrl) : null;
  const displayName = name.trim() || "—";

  return (
    <div className="flex min-w-[10rem] items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF2FF] text-sm font-bold text-[#2C4260]">
        {resolvedAvatar ? (
          <Image
            src={resolvedAvatar}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="40px"
          />
        ) : (
          getInitials(displayName)
        )}
      </div>
      <div className="min-w-0 text-right">
        <p className="truncate font-semibold text-slate-800">{displayName}</p>
        {email ? <p className="truncate text-xs text-slate-400">{email}</p> : null}
      </div>
    </div>
  );
}
