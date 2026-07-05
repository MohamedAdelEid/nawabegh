"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Minus, Plus, Send, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCreateChallengeForm,
  useFriendChallengeMutations,
} from "@/modules/student/application/hooks/useFriendChallengeHub";
import type { FriendChallengeSearchOpponent } from "@/modules/student/domain/friend-challenge/friend-challenge.types";
import { calculateWagerPoints } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";
import { FriendChallengeAvatar } from "./FriendChallengeAvatar";
import { ModalClose, ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { getSubjects } from "@/shared/infrastructure/api/subject.api";
import { cn } from "@/shared/application/lib/cn";

type FriendChallengeCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opponent: FriendChallengeSearchOpponent | null;
  onSuccess: () => void;
  onError: (error: unknown) => void;
};

export function FriendChallengeCreateModal({
  open,
  onOpenChange,
  opponent,
  onSuccess,
  onError,
}: FriendChallengeCreateModalProps) {
  const t = useTranslations("student.friendChallenge.create");
  const { form, setForm, buildPayload } = useCreateChallengeForm();
  const { createMutation } = useFriendChallengeMutations();

  const subjectsQuery = useQuery({
    queryKey: ["subjects", "friend-challenge"],
    queryFn: () => getSubjects({ pageNumber: 1, pageSize: 100 }),
    enabled: open,
  });

  useEffect(() => {
    if (opponent) {
      setForm((current) => ({ ...current, opponent }));
    }
  }, [opponent, setForm]);

  useEffect(() => {
    if (!form.challengeDate) {
      const today = new Date();
      setForm((current) => ({
        ...current,
        challengeDate: today.toISOString().slice(0, 10),
      }));
    }
  }, [form.challengeDate, setForm]);

  const wager = calculateWagerPoints(form.questionCount);
  const selectedSubjectId = form.subjectId;

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;
    try {
      await createMutation.mutateAsync(payload);
      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  const opponentName = form.opponent?.fullName ?? "";

  return (
    <ModalShell open={open} onOpenChange={onOpenChange} panelClassName="w-[min(95vw,42rem)]">
      <div className="flex flex-col items-center gap-6">
        <ModalClose className="absolute end-6 top-6 rounded-full p-2 text-[#64748b] hover:bg-[#f1f5f9]">
          <X className="size-4" />
        </ModalClose>

        {form.opponent ? (
          <FriendChallengeAvatar opponent={form.opponent} size="md" />
        ) : null}

        <div className="text-center">
          <ModalTitle className="text-2xl font-bold text-[#2b415e]">
            {opponentName ? t("title", { name: opponentName }) : t("challengeName")}
          </ModalTitle>
          <p className="mt-1 text-sm text-[#64748b]">{t("subtitle")}</p>
        </div>

        <div className="w-full space-y-5 text-start">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#2b415e]">{t("challengeName")}</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder={t("challengeNamePlaceholder")}
              className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-start outline-none focus:border-[#c7af6d]"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#2b415e]">{t("subjectLabel")}</span>
            <div className="grid grid-cols-2 gap-3">
              {(subjectsQuery.data ?? []).slice(0, 4).map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, subjectId: subject.id }))}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-sm font-bold transition",
                    selectedSubjectId === subject.id
                      ? "border-[#2b415e] text-[#2b415e]"
                      : "border-[#e2e8f0] text-[#64748b]",
                  )}
                >
                  {subject.nameAr || subject.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#2b415e]">{t("difficultyLabel")}</span>
            <div className="flex rounded-xl bg-[#f1f5f9] p-1">
              {([0, 1, 2] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, difficulty: value }))}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-bold transition",
                    form.difficulty === value
                      ? "bg-white text-[#2b415e] shadow-sm"
                      : "text-[#64748b]",
                  )}
                >
                  {t(`difficulty.${value === 0 ? "easy" : value === 2 ? "hard" : "medium"}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-[#2b415e]">{t("questionCount")}</span>
              <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] px-3 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      questionCount: Math.max(5, current.questionCount - 1),
                    }))
                  }
                  className="rounded-lg bg-[#f1f5f9] p-2"
                >
                  <Minus className="size-4" />
                </button>
                <span className="flex-1 text-center font-bold">{form.questionCount}</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      questionCount: Math.min(20, current.questionCount + 1),
                    }))
                  }
                  className="rounded-lg bg-[#f1f5f9] p-2"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-[#2b415e]">{t("wagerLabel")}</span>
              <div className="rounded-xl bg-[#f4ecd8] px-4 py-3 text-center font-bold text-[#a38f5a]">
                {wager}
                <p className="mt-1 text-xs font-normal text-[#64748b]">
                  {t("wagerHint", { count: form.questionCount })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#2b415e]">{t("date")}</span>
              <input
                type="date"
                value={form.challengeDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, challengeDate: event.target.value }))
                }
                className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-start"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#2b415e]">{t("time")}</span>
              <input
                type="time"
                value={form.startTime.slice(0, 5)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startTime: `${event.target.value}:00`,
                  }))
                }
                className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-start"
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          disabled={createMutation.isPending || !buildPayload()}
          onClick={() => void handleSubmit()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c7af6d] py-4 text-lg font-bold text-white shadow-[0_4px_0_#a38f5a] disabled:opacity-60"
        >
          {createMutation.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              {t("submit")}
              <Send className="size-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-sm font-semibold text-[#64748b]"
        >
          {t("cancel")}
        </button>
      </div>
    </ModalShell>
  );
}
