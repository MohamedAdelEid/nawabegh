"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { userManagementParentIcon } from "@/modules/admin/domain/data/userManagementDetailsData";
import {
  getParentUserDetail,
  linkParentStudent,
  searchParentsByKeyword,
  unlinkParentStudent,
  type UserManagementListRow,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import verify from "@/modules/admin/presentation/assets/icons/verify.svg";
import { cn } from "@/shared/application/lib/cn";
import { notify } from "@/shared/application/lib/toast";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export type LinkedParentCardProps = {
  studentUserId: string;
  initialParentUserId?: string;
  title: string;
  parentType: string;
  fallbackName: string;
  fallbackPhone: string;
  noParentMessage: string;
  loadingMessage: string;
  changeLabel: string;
  unlinkLabel: string;
  note: string;
  onParentChanged?: () => void;
};

export function LinkedParentCard({
  studentUserId,
  initialParentUserId,
  title,
  parentType,
  fallbackName,
  fallbackPhone,
  noParentMessage,
  loadingMessage,
  changeLabel,
  unlinkLabel,
  note,
  onParentChanged,
}: LinkedParentCardProps) {
  const t = useTranslations("admin.dashboard");
  const Icon = userManagementParentIcon;

  const [linkedParentId, setLinkedParentId] = useState(initialParentUserId ?? "");
  const [isChangingParent, setIsChangingParent] = useState(false);
  const [isLoadingParent, setIsLoadingParent] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [linkingParentId, setLinkingParentId] = useState<string | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [parentName, setParentName] = useState(fallbackName);
  const [parentPhone, setParentPhone] = useState(fallbackPhone);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<UserManagementListRow[]>([]);

  const showSearch = !linkedParentId || isChangingParent;

  const loadParent = useCallback(
    async (parentUserId: string) => {
      setIsLoadingParent(true);
      const result = await getParentUserDetail(parentUserId);
      if (result.data) {
        setParentName(result.data.fullName || fallbackName);
        setParentPhone(result.data.phoneNumber || fallbackPhone);
      } else {
        setParentName(fallbackName);
        setParentPhone(fallbackPhone);
      }
      setIsLoadingParent(false);
    },
    [fallbackName, fallbackPhone],
  );

  useEffect(() => {
    setLinkedParentId(initialParentUserId ?? "");
    setIsChangingParent(false);
  }, [initialParentUserId]);

  useEffect(() => {
    if (!linkedParentId) {
      setParentName(noParentMessage);
      setParentPhone("—");
      return;
    }

    void loadParent(linkedParentId);
  }, [linkedParentId, loadParent, noParentMessage]);

  useEffect(() => {
    if (!showSearch) {
      setSearchResults([]);
      return;
    }

    const keyword = searchKeyword.trim();
    if (keyword.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = window.setTimeout(async () => {
      const result = await searchParentsByKeyword(keyword);
      setSearchResults(result.data?.rows ?? []);
      setIsSearching(false);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchKeyword, showSearch]);

  const handleLinkParent = async (parentUserId: string) => {
    if (linkingParentId) return;

    setLinkingParentId(parentUserId);
    const result = await linkParentStudent({
      parentUserId,
      studentUserId,
    });

    if (result.data) {
      notify.success(result.message ?? t("userManagement.details.parent.linkSuccess"));
      setLinkedParentId(parentUserId);
      setIsChangingParent(false);
      setSearchKeyword("");
      setSearchResults([]);
      onParentChanged?.();
    } else {
      notify.error(result.errorMessage ?? t("userManagement.details.parent.linkError"));
    }

    setLinkingParentId(null);
  };

  const handleUnlinkParent = async () => {
    if (!linkedParentId || isUnlinking) return;

    setIsUnlinking(true);
    const result = await unlinkParentStudent({
      parentUserId: linkedParentId,
      studentUserId,
    });

    if (result.data) {
      notify.success(result.message ?? t("userManagement.details.parent.unlinkSuccess"));
      setLinkedParentId("");
      setIsChangingParent(false);
      setSearchKeyword("");
      setSearchResults([]);
      onParentChanged?.();
    } else {
      notify.error(result.errorMessage ?? t("userManagement.details.parent.unlinkError"));
    }

    setIsUnlinking(false);
  };

  return (
    <Card
      className="rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>
          <DashboardBadge tone="warning">{parentType}</DashboardBadge>
        </div>

        {showSearch ? (
          <div className="space-y-4 rounded-[1.5rem] bg-[#F8FAFC] p-5">
            <p className="text-right text-sm text-slate-500">
              {linkedParentId
                ? t("userManagement.details.parent.changeSearchHint")
                : noParentMessage}
            </p>
            <div className="relative">
              <input
                type="search"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder={t("userManagement.details.parent.searchPlaceholder")}
                className="h-14 w-full rounded-2xl border border-[var(--dashboard-border-soft)] bg-white pr-4 pl-12 text-right text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-[var(--dashboard-gold)] focus:ring-2 focus:ring-[var(--dashboard-gold)]/20"
              />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("userManagement.details.parent.searching")}
              </div>
            ) : null}

            {!isSearching && searchKeyword.trim().length >= 2 && searchResults.length === 0 ? (
              <p className="text-center text-sm text-slate-400">
                {t("userManagement.details.parent.noSearchResults")}
              </p>
            ) : null}

            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {searchResults.map((parent) => {
                  const isRowLinking = linkingParentId === parent.id;
                  const isAnotherRowLinking =
                    linkingParentId !== null && linkingParentId !== parent.id;

                  return (
                    <button
                      key={parent.id}
                      type="button"
                      disabled={isAnotherRowLinking}
                      aria-busy={isRowLinking}
                      onClick={() => void handleLinkParent(parent.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-2xl border bg-white p-4 text-right transition-colors",
                        isRowLinking
                          ? "border-[var(--dashboard-gold)] bg-[#fffdf7]"
                          : "border-slate-100 hover:border-[var(--dashboard-gold)] hover:bg-[#fffdf7]",
                        isAnotherRowLinking && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-semibold text-slate-800">{parent.fullName}</p>
                        <p dir="ltr" className="text-xs text-slate-500">
                          {parent.phoneNumber}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--dashboard-gold)]">
                        {isRowLinking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("userManagement.details.parent.linking")}
                          </>
                        ) : (
                          t("userManagement.details.parent.linkAction")
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {linkedParentId && isChangingParent ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl border-slate-200"
                onClick={() => {
                  setIsChangingParent(false);
                  setSearchKeyword("");
                  setSearchResults([]);
                }}
              >
                {t("userManagement.addUser.shared.actions.cancel")}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[1.5rem] p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-400">
                <Icon className="h-10 w-10" aria-hidden />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-800">
                  {isLoadingParent ? loadingMessage : parentName}
                </h3>
                <p dir="ltr" className="flex items-center gap-2 text-sm text-slate-500">
                  {isLoadingParent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    parentPhone
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-16 cursor-pointer rounded-lg border-none bg-[#F1F5F9] text-lg text-[#334155] hover:bg-[#F1F5F9] hover:text-[#334155]"
                onClick={() => setIsChangingParent(true)}
              >
                {changeLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isUnlinking}
                className="h-16 cursor-pointer rounded-lg border-none bg-rose-50 text-lg text-rose-500 hover:bg-rose-50 hover:text-rose-500"
                onClick={() => void handleUnlinkParent()}
              >
                {isUnlinking ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("userManagement.details.parent.unlinking")}
                  </span>
                ) : (
                  unlinkLabel
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-2xl border border-[#DCF4CB] bg-[#DCF4CB4D] px-4 py-3 text-right text-sm text-[#46A302]">
          <img src={verify.src} alt="verify" className="h-4 w-4" />
          {note}
        </div>
      </CardContent>
    </Card>
  );
}
