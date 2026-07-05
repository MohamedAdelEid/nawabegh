"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { AccountTypeId } from "@/modules/auth/domain/types/account-type.types";

type AccountTypeCardProps = {
  typeId: AccountTypeId;
  iconSrc: string;
  iconBgClass: string;
  selected: boolean;
  onSelect: (typeId: AccountTypeId) => void;
};

export function AccountTypeCard({
  typeId,
  iconSrc,
  iconBgClass,
  selected,
  onSelect,
}: AccountTypeCardProps) {
  const t = useTranslations("auth.accountType.cards");

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(typeId)}
      aria-pressed={selected}
      className={cn(
        "relative flex h-[300px] w-full max-w-[304px] flex-col items-center px-4 pb-6 pt-8 text-center transition-shadow sm:w-[304px]",
        "rounded-[20px] border-2 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-primary)] focus-visible:ring-offset-2",
        selected
          ? "border-[var(--dashboard-gold)] shadow-[0_8px_0_0_var(--dashboard-gold)]"
          : "border-transparent shadow-[0_8px_0_0_rgba(0,0,0,0.05)]",
      )}
    >
      {selected ? (
        <span className="absolute start-4 top-4 rounded-full bg-[var(--dashboard-gold)] px-3 py-1 text-xs font-bold text-[#021c37]">
          {t("selectedBadge")}
        </span>
      ) : null}

      <div
        className={cn(
          "mb-6 flex size-24 items-center justify-center rounded-full",
          iconBgClass,
        )}
      >
        <Image
          src={iconSrc}
          alt=""
          width={44}
          height={42}
          className="h-auto w-11 object-contain"
          aria-hidden
        />
      </div>

      <h3 className="mb-3 text-2xl font-bold text-[var(--dashboard-primary)]">
        {t(`${typeId}.title`)}
      </h3>

      <p className="max-w-[226px] text-sm leading-[1.625] text-slate-500">
        {t(`${typeId}.description`)}
      </p>
    </motion.button>
  );
}
