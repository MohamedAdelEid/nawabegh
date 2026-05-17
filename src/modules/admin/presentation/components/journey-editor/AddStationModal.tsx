"use client";

import {
  BookOpen,
  FlaskConical,
  Languages,
  Music,
  Pencil,
  Plus,
  Swords,
  Table2,
  Video,
  FileText,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { ToggleSwitch } from "@/shared/presentation/components/ui/toggle-switch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paths: JourneyPath[];
  defaultPathId?: string;
  onAdd: (draft: AddStationDraft) => void;
  loading?: boolean;
}

const STATION_TYPE_OPTIONS: {
  id: JourneyStationTypeId;
  icon: React.ReactNode;
}[] = [
  { id: "helperFile", icon: <FileText className="h-5 w-5" /> },
  { id: "liveBroadcast", icon: <Video className="h-5 w-5" /> },
  { id: "challenge", icon: <Zap className="h-5 w-5" /> },
  { id: "exam", icon: <FlaskConical className="h-5 w-5" /> },
  { id: "flashcard", icon: <BookOpen className="h-5 w-5" /> },
];

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

  const update = <K extends keyof AddStationDraft>(key: K, value: AddStationDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    onAdd(draft);
    setDraft({ ...defaultAddStationDraft, pathId: defaultPathId ?? defaultAddStationDraft.pathId });
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
                onClick={() => update("type", opt.id)}
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
              {t("permissions")}
            </span>
            <div className="flex h-12 items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <span className="text-sm text-slate-600">{t("subscribersOnly")}</span>
              <ToggleSwitch
                checked={draft.isSubscribersOnly}
                onCheckedChange={(checked) => update("isSubscribersOnly", checked)}
                ariaLabel={t("subscribersOnly")}
              />
            </div>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
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
