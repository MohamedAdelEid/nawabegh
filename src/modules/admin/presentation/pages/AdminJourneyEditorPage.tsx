"use client";

import {
  BookOpen,
  FlaskConical,
  Languages,
  Music,
  Pencil,
  Plus,
  Sparkles,
  Swords,
  Table2,
  Video,
  FileText,
  Zap,
  Eye,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type {
  AddStationDraft,
  JourneyEditorData,
  JourneyPath,
  JourneyStation,
  JourneyStationCompletionRuleId,
  JourneyStationTypeId,
} from "@/modules/admin/domain/data/journeyEditorData";
import {
  COMPLETION_RULE_OPTIONS,
  STATION_ICON_OPTIONS,
  defaultAddStationDraft,
} from "@/modules/admin/domain/data/journeyEditorData";
import {
  addJourneyPath,
  addJourneyStation,
  deleteJourneyStation,
  getJourneyEditor,
  saveJourneyChanges,
} from "@/modules/admin/infrastructure/api/journeyEditorApi";
import { AddStationModal, JourneyPathCard } from "@/modules/admin/presentation/components/journey-editor";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ToggleSwitch } from "@/shared/presentation/components/ui/toggle-switch";

interface Props {
  journeyId: string;
}

const STATION_TYPE_GRID: {
  id: JourneyStationTypeId;
  icon: React.ReactNode;
}[] = [
  { id: "flashcard", icon: <BookOpen className="h-5 w-5" /> },
  { id: "liveBroadcast", icon: <Video className="h-5 w-5" /> },
  { id: "challenge", icon: <Zap className="h-5 w-5" /> },
  { id: "exam", icon: <FlaskConical className="h-5 w-5" /> },
];

export function AdminJourneyEditorPage({ journeyId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor");
  const router = useRouter();

  const [data, setData] = useState<JourneyEditorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingStation, setAddingStation] = useState(false);

  const [draft, setDraft] = useState<AddStationDraft>(defaultAddStationDraft);
  const [newPathName, setNewPathName] = useState("");
  const [addingPath, setAddingPath] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalPathId, setModalPathId] = useState<string | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      const result = await getJourneyEditor(journeyId);
      if (result.data) {
        setData(result.data);
        setDraft((prev) => ({ ...prev, pathId: result.data!.paths[0]?.id ?? prev.pathId }));
      }
      setLoading(false);
    })();
  }, [journeyId]);

  const updateDraft = <K extends keyof AddStationDraft>(
    key: K,
    value: AddStationDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleCreateStation = async () => {
    if (!draft.name.trim()) {
      notify.error("Station name is required");
      return;
    }
    setAddingStation(true);
    const result = await addJourneyStation(journeyId, draft);
    setAddingStation(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? "Failed to add station");
      return;
    }
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        paths: prev.paths.map((p) =>
          p.id === draft.pathId
            ? { ...p, stations: [...p.stations, result.data!] }
            : p,
        ),
      };
    });
    setDraft((prev) => ({ ...prev, name: "" }));
    notify.success("Station added");
  };

  const handleModalAdd = async (modalDraft: AddStationDraft) => {
    setAddingStation(true);
    const result = await addJourneyStation(journeyId, modalDraft);
    setAddingStation(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? "Failed to add station");
      return;
    }
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        paths: prev.paths.map((p) =>
          p.id === modalDraft.pathId
            ? { ...p, stations: [...p.stations, result.data!] }
            : p,
        ),
      };
    });
    setModalOpen(false);
    notify.success("Station added");
  };

  const handleDeleteStation = async (stationId: string) => {
    const result = await deleteJourneyStation(stationId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        paths: prev.paths.map((p) => ({
          ...p,
          stations: p.stations.filter((s) => s.id !== stationId),
        })),
      };
    });
  };

  const handleCreatePath = async () => {
    if (!newPathName.trim()) return;
    setAddingPath(true);
    const result = await addJourneyPath(journeyId, newPathName);
    setAddingPath(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? "Failed to add path");
      return;
    }
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, paths: [...prev.paths, result.data!] };
    });
    setNewPathName("");
    notify.success("Path created");
  };

  const handleSave = async () => {
    setSaving(true);
    await saveJourneyChanges(journeyId);
    setSaving(false);
    notify.success("Changes saved");
  };

  const openAddStationModal = (pathId: string) => {
    setModalPathId(pathId);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("editor.title")}
        description={t("editor.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.journeyEditor") },
        ]}
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 px-6 border-2 border-[#2B415E] rounded-xl shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => router.push(ROUTES.ADMIN.HOME + "?tab=journeyEditor")}
            >
              <Eye className="h-4 w-4" />
              {t("editor.actions.previewJourney")}
            </Button>
            <Button
              className="h-12 rounded-xl bg-[#C8AC59] px-8 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {t("editor.actions.saveChanges")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-5">
          {data.paths.map((path) => (
            <JourneyPathCard
              key={path.id}
              journeyId={journeyId}
              path={path}
              onAddStation={openAddStationModal}
              onDeleteStation={(stationId) => void handleDeleteStation(stationId)}
            />
          ))}
        </main>
        <aside className="space-y-5">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {t("editor.sidebar.title")}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {t("editor.sidebar.subtitle")}
                </p>
              </div>

              <label className="block space-y-1.5 text-right">
                <span className="text-sm font-semibold text-slate-600">
                  {t("editor.sidebar.stationName")}
                </span>
                <input
                  value={draft.name}
                  onChange={(e) => updateDraft("name", e.target.value)}
                  placeholder={t("editor.sidebar.stationNamePlaceholder")}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
              </label>

              <div className="space-y-1.5 text-right">
                <span className="text-sm font-semibold text-slate-600">
                  {t("editor.sidebar.stationType")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {STATION_TYPE_GRID.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateDraft("type", opt.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-xs font-semibold transition-colors",
                        draft.type === opt.id
                          ? "border-[#2C4260] bg-[#2C4260] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300",
                      )}
                    >
                      {opt.icon}
                      {t(`editor.stationTypes.${opt.id}`)}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-1.5 text-right">
                <span className="text-sm font-semibold text-slate-600">
                  {t("editor.sidebar.completionRule")}
                </span>
                <select
                  value={draft.completionRule}
                  onChange={(e) =>
                    updateDraft(
                      "completionRule",
                      e.target.value as JourneyStationCompletionRuleId,
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                >
                  {COMPLETION_RULE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {t(`editor.completionRules.${opt.id}`)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5 text-right">
                <span className="text-sm font-semibold text-slate-600">
                  {t("editor.sidebar.path")}
                </span>
                <select
                  value={draft.pathId}
                  onChange={(e) => updateDraft("pathId", e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                >
                  {data.paths.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">
                  {t("editor.sidebar.subscribersOnly")}
                </span>
                <ToggleSwitch
                  checked={draft.isSubscribersOnly}
                  onCheckedChange={(checked) => updateDraft("isSubscribersOnly", checked)}
                  ariaLabel={t("editor.sidebar.subscribersOnly")}
                />
              </label>

              <Button
                className="h-12 w-full rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
                onClick={() => void handleCreateStation()}
                disabled={addingStation}
              >
                {t("editor.sidebar.createStation")}
              </Button>

              <div className="space-y-2">
                <input
                  value={newPathName}
                  onChange={(e) => setNewPathName(e.target.value)}
                  placeholder={t("editor.sidebar.newPathPlaceholder")}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-[#2C4260] bg-[#2C4260] text-white hover:bg-[#1E3050] shadow-[0px_4px_0px_0px_#1E305080]"
                  onClick={() => void handleCreatePath()}
                  disabled={addingPath}
                >
                  {t("editor.sidebar.createPath")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Journey Statistics */}
          <Card className="rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C8AC59]" />
                <h2 className="font-bold">{t("editor.sidebar.stats.title")}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-center">
                  <p className="text-2xl font-bold text-[#C8AC59]">
                    {data.stats.totalPoints}
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">
                    {t("editor.sidebar.stats.points")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 text-center">
                  <p className="text-2xl font-bold text-[#C8AC59]">
                    {data.stats.learningHours}
                    <span className="text-sm"> {t("editor.sidebar.stats.hours")}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">
                    {t("editor.sidebar.stats.learningTime")}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-white/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-white/70">
                    {t("editor.sidebar.stats.pathReadiness")}
                  </span>
                  <span className="text-sm font-bold">
                    {data.stats.pathReadinessPct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[#C8AC59] transition-all duration-500"
                    style={{ width: `${data.stats.pathReadinessPct}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <AddStationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        paths={data.paths}
        defaultPathId={modalPathId}
        onAdd={(d) => void handleModalAdd(d)}
        loading={addingStation}
      />
    </div>
  );
}
