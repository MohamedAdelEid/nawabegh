"use client";

import {
  BookOpen,
  ClipboardList,
  FlaskConical,
  Languages,
  Music,
  Pencil,
  Plus,
  Table2,
  Video,
  FileText,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type {
  AddStationDraft,
  JourneyPath,
  JourneyStationCompletionRuleId,
  JourneyStationIconId,
  JourneyStationTypeId,
} from "@/modules/admin/domain/data/journeyEditorData";
import {
  COMPLETION_RULE_OPTIONS,
  STATION_ICON_OPTIONS,
  defaultAddStationDraft,
} from "@/modules/admin/domain/data/journeyEditorData";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { ToggleSwitch } from "@/shared/presentation/components/ui/toggle-switch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paths: JourneyPath[];
  defaultPathId?: string;
  onAdd: (draft: AddStationDraft) => Promise<boolean> | boolean;
  loading?: boolean;
}

const STATION_TYPE_OPTIONS: {
  id: JourneyStationTypeId;
  icon: React.ReactNode;
}[] = [
  { id: "liveBroadcast", icon: <Video className="h-5 w-5" /> },
  { id: "flashcard", icon: <BookOpen className="h-5 w-5" /> },
  { id: "shortQuiz", icon: <ClipboardList className="h-5 w-5" /> },
  { id: "challenge", icon: <Zap className="h-5 w-5" /> },
  { id: "helperFile", icon: <FileText className="h-5 w-5" /> },
];

const THRESHOLD_STATION_TYPES = new Set<JourneyStationTypeId>([
  "liveBroadcast",
  "flashcard",
]);

function shouldUseCompletionThreshold(stationType: JourneyStationTypeId) {
  return THRESHOLD_STATION_TYPES.has(stationType);
}

function getDefaultCompletionRule(
  stationType: JourneyStationTypeId,
): JourneyStationCompletionRuleId {
  switch (stationType) {
    case "liveBroadcast":
    case "flashcard":
      return "viewAll";
    case "shortQuiz":
      return "passScore";
    case "challenge":
    case "helperFile":
    default:
      return "allTasks";
  }
}

const ICON_MAP: Record<JourneyStationIconId, React.ReactNode> = {
  plus: <Plus className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  language: <Languages className="h-5 w-5" />,
  table: <Table2 className="h-5 w-5" />,
  edit: <Pencil className="h-5 w-5" />,
  flask: <FlaskConical className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
};

export function AddStationModal({
  open,
  onOpenChange,
  paths,
  defaultPathId,
  onAdd,
  loading,
}: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.addStationModal");
  const tEditor = useTranslations("admin.dashboard.journeyEditor.editor");

  const [draft, setDraft] = useState<AddStationDraft>({
    ...defaultAddStationDraft,
    pathId: defaultPathId ?? defaultAddStationDraft.pathId,
  });

  useEffect(() => {
    if (!open) return;
    setDraft((prev) => ({
      ...prev,
      pathId: defaultPathId ?? paths[0]?.id ?? prev.pathId,
    }));
  }, [defaultPathId, open, paths]);

  const update = <K extends keyof AddStationDraft>(key: K, value: AddStationDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateType = (stationType: JourneyStationTypeId) => {
    setDraft((prev) => ({
      ...prev,
      type: stationType,
      completionRule: getDefaultCompletionRule(stationType),
      completionThreshold: shouldUseCompletionThreshold(stationType) ? prev.completionThreshold : 0,
    }));
  };

  const handleAdd = async () => {
    const created = await onAdd(draft);
    if (created) {
      setDraft({
        ...defaultAddStationDraft,
        pathId: defaultPathId ?? paths[0]?.id ?? defaultAddStationDraft.pathId,
      });
    }
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[#2C4260]/30"
      panelClassName="w-[min(95vw,36rem)] p-7"
    >
      <ModalTitle className="mb-5 text-xl font-bold text-slate-800 text-right">
        {t("title")}
      </ModalTitle>

      <div className="space-y-5">
        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("stationName")}</span>
          <input
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t("stationNamePlaceholder")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
          />
        </label>

        <div className="space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("stationType")}</span>
          <div className="grid grid-cols-5 gap-2">
            {STATION_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateType(opt.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-xs font-semibold transition-colors",
                  draft.type === opt.id
                    ? "border-[#2C4260] bg-[#2C4260] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300",
                )}
              >
                {opt.icon}
                <span className="text-center leading-tight">
                  {tEditor(`stationTypes.${opt.id}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("iconPicker")}</span>
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {STATION_ICON_OPTIONS.map((iconId) => (
              <button
                key={iconId}
                type="button"
                onClick={() => update("icon", iconId)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  draft.icon === iconId
                    ? "bg-[#2C4260] text-white"
                    : "text-slate-500 hover:bg-slate-200",
                )}
              >
                {ICON_MAP[iconId]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-600">
              {t("completionRule")}
            </span>
            <select
              value={draft.completionRule}
              onChange={(e) =>
                update("completionRule", e.target.value as JourneyStationCompletionRuleId)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
            >
              {COMPLETION_RULE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {tEditor(`completionRules.${opt.id}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-600">
              {t("completionThreshold")}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={draft.completionThreshold}
              onChange={(e) => update("completionThreshold", Number(e.target.value))}
              disabled={!shouldUseCompletionThreshold(draft.type)}
              className={cn(
                "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors",
                !shouldUseCompletionThreshold(draft.type) && "cursor-not-allowed opacity-60",
              )}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-600">
              {t("pointReward")}
            </span>
            <input
              type="number"
              min={0}
              value={draft.pointReward}
              onChange={(e) => update("pointReward", Number(e.target.value))}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
            />
          </label>

          <label className="block space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-600">
              {t("permissions")}
            </span>
            <div className="flex h-12 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <ToggleSwitch
                checked={draft.isSubscribersOnly}
                onCheckedChange={(checked) => update("isSubscribersOnly", checked)}
                ariaLabel={t("subscribersOnly")}
              />
              <span className="text-sm text-slate-600">{t("subscribersOnly")}</span>
            </div>
          </label>
        </div>

        <label className="flex h-12 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
          <ToggleSwitch
            checked={draft.autoUnlockOnPreviousComplete}
            onCheckedChange={(checked) => update("autoUnlockOnPreviousComplete", checked)}
            ariaLabel={t("autoUnlock")}
          />
          <span className="text-sm font-semibold text-slate-600">{t("autoUnlock")}</span>
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            {t("cancel")}
          </button>
          <Button
            className="flex-1 h-12 rounded-2xl bg-[#2C4260] text-white hover:bg-[#1E3050] shadow-[0px_4px_0px_0px_#1E305080]"
            onClick={handleAdd}
            disabled={loading}
          >
            {t("addStation")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
