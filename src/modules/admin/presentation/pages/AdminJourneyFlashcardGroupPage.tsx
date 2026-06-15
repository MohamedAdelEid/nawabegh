"use client";

import {
  BookMarked,
  Clock,
  Eye,
  GripVertical,
  Plus,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type {
  FlashCard,
  FlashCardGroup,
  FlashcardDifficultyId,
} from "@/modules/admin/domain/data/journeyEditorData";
import {
  createFlashcardDeck,
  getFlashcardDeck,
  getFlashcardDeckIdForStation,
  type FlashcardDeck,
} from "@/modules/admin/infrastructure/api/flashcardDecksApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { DifficultyLevel } from "@/shared/domain/enums/cms.enums";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { JourneyEditorStationPageSkeleton } from "@/modules/admin/presentation/components/journey-editor";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

interface Props {
  journeyId: string;
  stationId: string;
}

const DIFFICULTY_TONE: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-rose-50 text-rose-600",
};

const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];
const STATION_DECK_STORAGE_KEY_PREFIX = "admin.flashcardDeck.station.";

const DIFFICULTY_TO_API: Record<FlashcardDifficultyId, DifficultyLevel> = {
  easy: DifficultyLevel.Easy,
  medium: DifficultyLevel.Medium,
  hard: DifficultyLevel.Hard,
};

function mapApiDifficulty(difficulty: number): FlashcardDifficultyId {
  switch (difficulty) {
    case DifficultyLevel.Easy:
      return "easy";
    case DifficultyLevel.Hard:
      return "hard";
    case DifficultyLevel.Medium:
    default:
      return "medium";
  }
}

function getStoredDeckId(stationId: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${STATION_DECK_STORAGE_KEY_PREFIX}${stationId}`);
}

function storeDeckId(stationId: string, deckId: string) {
  window.localStorage.setItem(`${STATION_DECK_STORAGE_KEY_PREFIX}${stationId}`, deckId);
}

function clearStoredDeckId(stationId: string) {
  window.localStorage.removeItem(`${STATION_DECK_STORAGE_KEY_PREFIX}${stationId}`);
}

function mapDeckToGroup(deck: FlashcardDeck): FlashCardGroup {
  const cards: FlashCard[] = deck.flashcards
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((card) => ({
      id: card.id,
      groupId: deck.id,
      front: card.front,
      back: card.back,
      difficulty: mapApiDifficulty(card.difficulty),
      reviewTimeSec: card.reviewSeconds,
      imageUrl: card.imageUrl || undefined,
    }));

  const reviewTimeMin = Math.ceil(
    cards.reduce((total, card) => total + card.reviewTimeSec, 0) / 60,
  );

  return {
    id: deck.id,
    stationId: deck.stationId,
    title: deck.title,
    subject: "",
    totalCards: cards.length,
    avgDifficulty: mapApiDifficulty(deck.averageDifficulty),
    reviewTimeMin,
    completionPct: 0,
    cards,
  };
}

export function AdminJourneyFlashcardGroupPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const searchParams = useSearchParams();
  const deckIdFromUrl = searchParams.get("deckId")?.trim() || null;
  const [group, setGroup] = useState<FlashCardGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleBack, setVisibleBack] = useState<Set<string>>(new Set());
  const [createDeckOpen, setCreateDeckOpen] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDifficulty, setDeckDifficulty] = useState<FlashcardDifficultyId>("medium");
  const [creatingDeck, setCreatingDeck] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      let deckId = deckIdFromUrl ?? getStoredDeckId(stationId);
      if (!deckId) {
        const stationDeckResult = await getFlashcardDeckIdForStation(stationId);
        deckId = stationDeckResult.data;
      }
      if (!deckId) {
        setGroup(null);
        setCreateDeckOpen(true);
        setLoading(false);
        return;
      }

      const result = await getFlashcardDeck(deckId);
      if (result.data) {
        storeDeckId(stationId, result.data.id);
        setGroup(mapDeckToGroup(result.data));
        setCreateDeckOpen(false);
      } else {
        clearStoredDeckId(stationId);
        setGroup(null);
        setCreateDeckOpen(true);
        if (result.errorMessage && result.status !== "NotFound") {
          notify.error(result.errorMessage);
        }
      }
      setLoading(false);
    })();
  }, [deckIdFromUrl, stationId]);

  const toggleBack = (cardId: string) => {
    setVisibleBack((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleCreateDeck = async () => {
    if (!deckTitle.trim()) {
      notify.error(t("flashcardGroup.createDeckModal.titleRequired"));
      return;
    }
    setCreatingDeck(true);
    const result = await createFlashcardDeck({
      stationId,
      title: deckTitle.trim(),
      averageDifficulty: DIFFICULTY_TO_API[deckDifficulty],
      aiCardCount: 0,
      aiReviewSeconds: 0,
      aiDifficulty: 0,
      aiSourceFileUrl: "",
    });
    setCreatingDeck(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("flashcardGroup.createDeckModal.createError"));
      return;
    }

    storeDeckId(stationId, result.data.id);
    setGroup({
      id: result.data.id,
      stationId: result.data.stationId || stationId,
      title: result.data.title,
      subject: "",
      totalCards: 0,
      avgDifficulty: deckDifficulty,
      reviewTimeMin: 0,
      completionPct: 0,
      cards: [],
    });
    setCreateDeckOpen(false);
    router.replace(routes.journeyEditor.FLASHCARD_GROUP(journeyId, stationId, result.data.id));
    notify.success(t("flashcardGroup.createDeckModal.createSuccess"));
  };

  const handleDelete = (cardId: string) => {
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
    return <JourneyEditorStationPageSkeleton />;
  }

  const activeGroup: FlashCardGroup = group ?? {
    id: "",
    stationId,
    title: t("flashcardGroup.emptyTitle"),
    subject: "",
    totalCards: 0,
    avgDifficulty: deckDifficulty,
    reviewTimeMin: 0,
    completionPct: 0,
    cards: [],
  };
  const difficultyLabel = t(`flashcardGroup.difficulty.${activeGroup.avgDifficulty}`);
  const addCardHref = group
    ? routes.journeyEditor.FLASHCARD_ADD(journeyId, stationId, group.id)
    : null;

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("flashcardGroup.title", { title: activeGroup.title })}
        description={t("flashcardGroup.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: routes.home },
          {
            label: t("breadcrumbs.journeyEditor"),
            href: routes.journeyEditor.EDITOR(journeyId),
          },
          { label: t("breadcrumbs.flashcardGroup") },
        ]}
        action={
          <div className="flex gap-3">
            {/* <Button
              variant="outline"
              className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
            >
              {t("flashcardGroup.actions.publish")}
            </Button> */}
            <Button
              className="h-12 rounded-xl bg-[#C8AC59] px-8 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => addCardHref && router.push(addCardHref)}
              disabled={!addCardHref}
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
                {activeGroup.totalCards}
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
                {activeGroup.reviewTimeMin}
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
            <span className="mr-2 text-slate-400">({activeGroup.totalCards})</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeGroup.cards.map((card) => (
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
            onClick={() => addCardHref && router.push(addCardHref)}
            disabled={!addCardHref}
            className={cn(
              "flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-slate-200",
              "text-sm font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]",
              !addCardHref && "cursor-not-allowed opacity-60 hover:border-slate-200 hover:text-slate-400",
            )}
          >
            <Plus className="h-6 w-6" />
            {t("flashcardGroup.addNewCard")}
          </button>
        </div>
      </div>

      <ModalShell
        open={createDeckOpen}
        onOpenChange={(open) => {
          if (!open && !group) return;
          setCreateDeckOpen(open);
        }}
        overlayClassName="bg-[#2C4260]/30"
        // panelClassName="w-[min(95vw,32rem)] p-7"
      >
        <ModalTitle className="mb-1 text-xl font-bold text-slate-800 text-right">
          {t("flashcardGroup.createDeckModal.title")}
        </ModalTitle>
        <ModalDescription className="mb-5 text-sm text-slate-500 text-right">
          {t("flashcardGroup.createDeckModal.description")}
        </ModalDescription>

        <div className="space-y-5">
          <label className="block space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-600">
              {t("flashcardGroup.createDeckModal.deckTitle")}
            </span>
            <input
              value={deckTitle}
              onChange={(event) => setDeckTitle(event.target.value)}
              placeholder={t("flashcardGroup.createDeckModal.deckTitlePlaceholder")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none transition-colors focus:border-[#C8AC59]"
            />
          </label>

          <div className="space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-600">
              {t("flashcardGroup.createDeckModal.difficulty")}
            </span>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setDeckDifficulty(difficulty)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                    deckDifficulty === difficulty
                      ? "bg-[#C8AC59] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {t(`flashcardGroup.difficulty.${difficulty}`)}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="h-12 w-full rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
            onClick={() => void handleCreateDeck()}
            disabled={creatingDeck}
          >
            {creatingDeck ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            {t("flashcardGroup.createDeckModal.create")}
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}
