"use client";

import {
  BookMarked,
  Clock,
  Eye,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { FlashCardGroup } from "@/modules/admin/domain/data/journeyEditorData";
import {
  deleteFlashCard,
  getFlashCardGroup,
} from "@/modules/admin/infrastructure/api/journeyEditorApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface Props {
  journeyId: string;
  stationId: string;
}

const DIFFICULTY_TONE: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-rose-50 text-rose-600",
};

export function AdminJourneyFlashcardGroupPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor");
  const router = useRouter();
  const [group, setGroup] = useState<FlashCardGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleBack, setVisibleBack] = useState<Set<string>>(new Set());

  useEffect(() => {
    void (async () => {
      const result = await getFlashCardGroup(stationId);
      if (result.data) setGroup(result.data);
      setLoading(false);
    })();
  }, [stationId]);

  const toggleBack = (cardId: string) => {
    setVisibleBack((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleDelete = async (cardId: string) => {
    const result = await deleteFlashCard(cardId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    setGroup((prev) =>
      prev
        ? {
            ...prev,
            cards: prev.cards.filter((c) => c.id !== cardId),
            totalCards: prev.totalCards - 1,
          }
        : prev,
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
      </div>
    );
  }

  if (!group) return null;

  const difficultyLabel = t(`flashcardGroup.difficulty.${group.avgDifficulty}`);

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("flashcardGroup.title", { title: group.title })}
        description={t("flashcardGroup.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          {
            label: t("breadcrumbs.journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          { label: t("breadcrumbs.flashcardGroup") },
        ]}
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
            >
              {t("flashcardGroup.actions.publish")}
            </Button>
            <Button
              className="h-12 rounded-xl bg-[#C8AC59] px-8 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() =>
                router.push(ROUTES.ADMIN.JOURNEY_EDITOR.FLASHCARD_ADD(journeyId, stationId))
              }
            >
              <Plus className="h-4 w-4" />
              {t("flashcardGroup.actions.addCard")}
            </Button>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[1.5rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <BookMarked className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{t("flashcardGroup.stats.totalCards")}</p>
              <p className="text-2xl font-bold text-slate-800">
                {group.totalCards}
                <span className="mr-1 text-sm font-medium text-slate-400">
                  {t("flashcardGroup.stats.card")}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{t("flashcardGroup.stats.avgDifficulty")}</p>
              <p className="text-2xl font-bold text-slate-800">{difficultyLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <Clock className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{t("flashcardGroup.stats.reviewTime")}</p>
              <p className="text-2xl font-bold text-slate-800">
                {group.reviewTimeMin}
                <span className="mr-1 text-sm font-medium text-slate-400">
                  {t("flashcardGroup.stats.minute")}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card list */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-[#C8AC59]" />
          <h2 className="font-bold text-slate-800">
            {t("flashcardGroup.cardList")}
            <span className="mr-2 text-slate-400">({group.totalCards})</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.cards.map((card) => (
            <div
              key={card.id}
              className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      DIFFICULTY_TONE[card.difficulty] ?? "bg-slate-50 text-slate-500",
                    )}
                  >
                    {t(`flashcardGroup.difficulty.${card.difficulty}`)}
                  </span>
                  <span className="text-xs text-slate-400">{card.reviewTimeSec}s</span>
                </div>
                <GripVertical className="h-4 w-4 text-slate-300" />
              </div>

              <p className="mb-1 font-semibold text-slate-800 leading-snug">
                {card.front}
              </p>
              {visibleBack.has(card.id) ? (
                <p className="text-sm text-slate-500 leading-relaxed">{card.back}</p>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex gap-2 justify-between w-full">
                  <button
                    type="button"
                    onClick={() => toggleBack(card.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#C8AC59] hover:text-[#B79A46] transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t("flashcardGroup.cardActions.viewAnswer")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(card.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {/* <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button> */}
                </div>
              </div>
            </div>
          ))}

          {/* Add new card placeholder */}
          <button
            type="button"
            onClick={() =>
              router.push(ROUTES.ADMIN.JOURNEY_EDITOR.FLASHCARD_ADD(journeyId, stationId))
            }
            className={cn(
              "flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-slate-200",
              "text-sm font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]",
            )}
          >
            <Plus className="h-6 w-6" />
            {t("flashcardGroup.addNewCard")}
          </button>
        </div>
      </div>
    </div>
  );
}
