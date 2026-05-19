"use client";

import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import {
  BookOpen,
  FlaskConical,
  GripVertical,
  Lock,
  LockOpen,
  Pencil,
  Plus,
  Trash2,
  Music,
  Languages,
  Table2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { JourneyStation } from "@/modules/admin/domain/data/journeyEditorData";
import { cn } from "@/shared/application/lib/cn";

interface Props {
  station: JourneyStation;
  editorHref: string | null;
  onNavigate?: () => void;
  dragActivatorRef?: (element: HTMLElement | null) => void;
  dragHandleAttributes?: DraggableAttributes;
  dragHandleListeners?: DraggableSyntheticListeners;
  onDelete?: (stationId: string) => void;
}

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  plus: <Plus className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  language: <Languages className="h-5 w-5" />,
  table: <Table2 className="h-5 w-5" />,
  edit: <Pencil className="h-5 w-5" />,
  flask: <FlaskConical className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
};

const TYPE_BG: Record<string, string> = {
  flashcard: "bg-amber-50 text-amber-600",
  liveBroadcast: "bg-blue-50 text-blue-600",
  shortQuiz: "bg-rose-50 text-rose-600",
  challenge: "bg-purple-50 text-purple-600",
  exam: "bg-rose-50 text-rose-600",
  helperFile: "bg-slate-50 text-slate-600",
};

const ICON_BG: Record<string, string> = {
  flashcard: "bg-amber-100",
  liveBroadcast: "bg-blue-100",
  shortQuiz: "bg-rose-100",
  challenge: "bg-purple-100",
  exam: "bg-rose-100",
  helperFile: "bg-slate-100",
};

export function JourneyStationCard({
  station,
  editorHref,
  onNavigate,
  dragActivatorRef,
  dragHandleAttributes,
  dragHandleListeners,
  onDelete,
}: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.editor");

  const typeLabel = t(`stationTypes.${station.type}`);
  const stationIcon = ICON_COMPONENTS[station.icon] ?? ICON_COMPONENTS.edit;
  const iconBg = ICON_BG[station.type] ?? "bg-slate-100";
  const typeBg = TYPE_BG[station.type] ?? "bg-slate-50 text-slate-600";

  const accessLabel = t(`station.accessBadge.${station.access}`);
  const isOpen = station.access === "open";

  const completionLabel = (() => {
    if (station.completionRule === "passScore" && typeof station.completionValue === "number") {
      return t("station.completionBadge.passScore", { value: station.completionValue });
    }
    if (station.completionRule === "unlockOnSuccess") {
      return t("station.completionBadge.unlockOnSuccess");
    }
    return null;
  })();

  const showNotHandled = editorHref === null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-shadow",
        editorHref && onNavigate && "hover:shadow-md",
      )}
    >
      <button
        type="button"
        ref={dragActivatorRef}
        className="touch-none rounded-lg p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
        aria-label={t("station.dragHandleAria")}
        data-sortable-handle
        {...dragHandleAttributes}
        {...dragHandleListeners}
      >
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab" />
      </button>

      <div
        role={editorHref && onNavigate ? "button" : undefined}
        tabIndex={editorHref && onNavigate ? 0 : undefined}
        className={cn(
          "flex min-w-0 flex-1 cursor-default items-center gap-3 text-right",
          editorHref && onNavigate && "cursor-pointer rounded-xl outline-none hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-[#C8AC59]/40",
        )}
        onClick={() => {
          if (editorHref && onNavigate) onNavigate();
        }}
        onKeyDown={(e) => {
          if (!editorHref || !onNavigate) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onNavigate();
          }
        }}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconBg,
          )}
        >
          {stationIcon}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                typeBg,
              )}
            >
              {typeLabel}
            </span>
            {showNotHandled ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
                {t("station.notHandledBadge")}
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm font-bold text-slate-800">{station.name}</p>
          {completionLabel ? (
            <span className="text-xs text-slate-400">{completionLabel}</span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2" data-station-action>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isOpen
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-50 text-slate-500",
          )}
        >
          {isOpen ? (
            <LockOpen className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          {isOpen ? accessLabel : null}
        </span>

        <div className="flex gap-1">
          {editorHref && onNavigate ? (
            <button
              type="button"
              title={t("station.openEditorHint")}
              aria-label={t("station.openEditorHint")}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(station.id);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
