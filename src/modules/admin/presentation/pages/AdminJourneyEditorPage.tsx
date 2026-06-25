"use client";

import {
  BookOpen,
  ClipboardList,
  Languages,
  Music,
  Pencil,
  Plus,
  Sparkles,
  Table2,
  Video,
  FileText,
  Zap,
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
  JourneyStationIconId,
  JourneyStationTypeId,
} from "@/modules/admin/domain/data/journeyEditorData";
import {
  COMPLETION_RULE_OPTIONS,
  STATION_ICON_OPTIONS,
  defaultAddStationDraft,
} from "@/modules/admin/domain/data/journeyEditorData";
import { getStationCreateHref } from "@/modules/admin/domain/utils/resolveStationNavigationHref";
import {
  getJourneyEditor,
  saveJourneyChanges,
} from "@/modules/admin/infrastructure/api/journeyEditorApi";
import { getCourse } from "@/modules/admin/infrastructure/api/courseApi";
import { fetchTeacherCourseWorkspace } from "@/modules/teacher/infrastructure/api/teacherCoursesApi";
import {
  createLearningPath,
  deleteLearningPath,
  getCourseLearningPathsForEditor,
  type CourseLearningPath,
} from "@/modules/admin/infrastructure/api/learningPathsApi";
import {
  createStation,
  deleteStation,
  reorderStations,
  type CreatedStation,
} from "@/modules/admin/infrastructure/api/stationsApi";
import {
  AddLearningPathModal,
  AddStationModal,
  JourneyEditorAnimatedSection,
  JourneyEditorPageSkeleton,
  JourneyPathCard,
  type AddLearningPathDraft,
} from "@/modules/admin/presentation/components/journey-editor";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import {
  CompletionRuleType,
  StationAccessPolicy,
  StationType,
} from "@/shared/domain/enums/cms.enums";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { useLocale } from "next-intl";
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

function shouldSendCompletionThreshold(stationType: JourneyStationTypeId) {
  return THRESHOLD_STATION_TYPES.has(stationType);
}

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function stationTypeToJourneyType(stationType: number): JourneyStationTypeId {
  switch (stationType) {
    case StationType.LiveStream:
      return "liveBroadcast";
    case StationType.Flashcards:
      return "flashcard";
    case StationType.ShortQuiz:
      return "shortQuiz";
    case StationType.Challenge:
      return "challenge";
    case StationType.HelperResource:
      return "helperFile";
    default:
      return "exam";
  }
}

function journeyStationTypeToApi(stationType: JourneyStationTypeId): StationType {
  switch (stationType) {
    case "liveBroadcast":
      return StationType.LiveStream;
    case "flashcard":
      return StationType.Flashcards;
    case "shortQuiz":
    case "exam":
      return StationType.ShortQuiz;
    case "challenge":
      return StationType.Challenge;
    case "helperFile":
      return StationType.HelperResource;
    default:
      return StationType.ShortQuiz;
  }
}

function getDefaultCompletionRule(stationType: JourneyStationTypeId): JourneyStationCompletionRuleId {
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

function journeyCompletionRuleToApi(completionRule: JourneyStationCompletionRuleId): CompletionRuleType {
  switch (completionRule) {
    case "passScore":
      return CompletionRuleType.PassQuiz;
    case "viewAll":
      return CompletionRuleType.WatchFullVideo;
    case "unlockOnSuccess":
    case "allTasks":
    default:
      return CompletionRuleType.CompleteAllTasks;
  }
}

function completionRuleToJourneyRule(completionRule: number): JourneyStationCompletionRuleId {
  switch (completionRule) {
    case CompletionRuleType.PassQuiz:
      return "passScore";
    case CompletionRuleType.WatchFullVideo:
      return "viewAll";
    case CompletionRuleType.CompleteAllTasks:
    default:
      return "allTasks";
  }
}

function iconKeyToJourneyIcon(iconKey: string): JourneyStationIconId {
  return STATION_ICON_OPTIONS.includes(iconKey as JourneyStationIconId)
    ? (iconKey as JourneyStationIconId)
    : "book";
}

function mapCreatedStation(station: CreatedStation): JourneyStation {
  const isSubscribersOnly = station.accessPolicy === StationAccessPolicy.Subscribers;

  return {
    id: station.id,
    pathId: station.learningPathId,
    name: station.name,
    type: stationTypeToJourneyType(station.type),
    completionRule: completionRuleToJourneyRule(station.completionRule),
    completionValue: station.completionThreshold,
    icon: iconKeyToJourneyIcon(station.iconKey),
    access: isSubscribersOnly ? "subscribersOnly" : "open",
    isSubscribersOnly,
    order: station.order,
    autoUnlockOnPreviousComplete: station.autoUnlockOnPreviousComplete,
    completionThreshold: station.completionThreshold,
    pointReward: station.pointReward,
  };
}

function mapCourseLearningPaths(
  courseId: string,
  paths: CourseLearningPath[],
  courseTitle = "",
  courseDescription = "",
): JourneyEditorData {
  const orderedPaths = [...paths].sort((a, b) => a.order - b.order);
  const mappedPaths = orderedPaths.map<JourneyPath>((path) => {
    const stations = [...path.stations]
      .sort((a, b) => a.order - b.order)
      .map<JourneyStation>((station) => ({
        id: station.id,
        pathId: path.id,
        name: station.name,
        type: stationTypeToJourneyType(station.type),
        completionRule: "viewAll",
        icon: "book",
        access: "open",
        isSubscribersOnly: false,
        order: station.order,
      }));

    return {
      id: path.id,
      title: path.title,
      durationMinutes: 0,
      stations,
      isCollapsed: false,
      order: path.order,
    };
  });
  const stationCount = mappedPaths.reduce((total, path) => total + path.stations.length, 0);

  return {
    id: courseId,
    title: courseTitle || mappedPaths[0]?.title || "Journey of Excellence",
    description: courseDescription,
    paths: mappedPaths,
    stats: {
      totalPoints: 0,
      learningHours: 0,
      pathReadinessPct: stationCount > 0 ? 100 : 0,
    },
  };
}

export function AdminJourneyEditorPage({ journeyId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const locale = useLocale();

  const [data, setData] = useState<JourneyEditorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingStation, setAddingStation] = useState(false);

  const [draft, setDraft] = useState<AddStationDraft>(defaultAddStationDraft);
  const [addingPath, setAddingPath] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalPathId, setModalPathId] = useState<string | undefined>(undefined);
  const [addPathModalOpen, setAddPathModalOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      const isTeacherScope = routes.scope === "teacher";

      const [courseResult, learningPathsResult] = await Promise.all([
        isTeacherScope
          ? fetchTeacherCourseWorkspace(journeyId, locale)
              .then((course) => ({ data: course, errorMessage: null as string | null }))
              .catch((error: unknown) => ({
                data: null,
                errorMessage: error instanceof Error ? error.message : "Failed to load course",
              }))
          : getCourse(journeyId),
        getCourseLearningPathsForEditor(journeyId),
      ]);

      if (learningPathsResult.data) {
        const mappedData = mapCourseLearningPaths(
          journeyId,
          learningPathsResult.data,
          courseResult.data?.title,
          courseResult.data?.description ?? "",
        );
        setData(mappedData);
        setDraft((prev) => ({ ...prev, pathId: mappedData.paths[0]?.id ?? prev.pathId }));
        setLoading(false);
        return;
      }

      if (isTeacherScope) {
        notify.error(
          courseResult.errorMessage ??
            learningPathsResult.errorMessage ??
            t("messages.loadFailed"),
        );
        setLoading(false);
        return;
      }

      const mockResult = await getJourneyEditor(journeyId);
      if (mockResult.data) {
        setData(mockResult.data);
        setDraft((prev) => ({ ...prev, pathId: mockResult.data!.paths[0]?.id ?? prev.pathId }));
      }
      setLoading(false);
    })();
  }, [journeyId, locale, routes.scope, t]);

  const updateDraft = <K extends keyof AddStationDraft>(
    key: K,
    value: AddStationDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const createStationFromDraft = async (
    stationDraft: AddStationDraft,
  ): Promise<JourneyStation | null> => {
    if (!stationDraft.name.trim()) {
      notify.error(t("messages.stationNameRequired"));
      return null;
    }
    if (!stationDraft.pathId) {
      notify.error(t("messages.pathRequired"));
      return null;
    }

    setAddingStation(true);
    const result = await createStation({
      learningPathId: stationDraft.pathId,
      name: stationDraft.name.trim(),
      iconKey: stationDraft.icon,
      type: journeyStationTypeToApi(stationDraft.type),
      autoUnlockOnPreviousComplete: stationDraft.autoUnlockOnPreviousComplete,
      completionRule: journeyCompletionRuleToApi(stationDraft.completionRule),
      completionThreshold: shouldSendCompletionThreshold(stationDraft.type)
        ? clampPercentage(stationDraft.completionThreshold)
        : null,
      accessPolicy: stationDraft.isSubscribersOnly
        ? StationAccessPolicy.Subscribers
        : StationAccessPolicy.All,
      pointReward: Math.max(0, Number(stationDraft.pointReward) || 0),
    });
    setAddingStation(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.stationCreateError"));
      return null;
    }

    const createdStation = mapCreatedStation(result.data);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        paths: prev.paths.map((p) =>
          p.id === createdStation.pathId
            ? {
                ...p,
                stations: [...p.stations, createdStation].sort((a, b) => a.order - b.order),
              }
            : p,
        ),
      };
    });
    notify.success(t("messages.stationAdded"));
    return createdStation;
  };

  const handleCreateStation = async () => {
    const createdStation = await createStationFromDraft(draft);
    if (createdStation) {
      setDraft((prev) => ({ ...prev, name: "" }));
      const editorHref = getStationCreateHref(routes.journeyEditor, journeyId, createdStation);
      if (editorHref) {
        router.push(editorHref);
      }
    }
  };

  const handleModalAdd = async (modalDraft: AddStationDraft) => {
    const createdStation = await createStationFromDraft(modalDraft);
    if (!createdStation) return false;

    setModalOpen(false);
    const editorHref = getStationCreateHref(routes.journeyEditor, journeyId, createdStation);
    if (editorHref) {
      router.push(editorHref);
    }
    return true;
  };

  const handleDeleteStation = async (stationId: string) => {
    const result = await deleteStation(stationId);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.stationDeleteError"));
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

  const handleReorderStations = async (
    pathId: string,
    orderedIds: string[],
  ): Promise<boolean> => {
    const result = await reorderStations({ learningPathId: pathId, orderedIds });
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.stationReorderError"));
      return false;
    }

    const orderById = new Map(orderedIds.map((id, index) => [id, index + 1]));
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        paths: prev.paths.map((path) =>
          path.id === pathId
            ? {
                ...path,
                stations: [...path.stations]
                  .sort(
                    (a, b) =>
                      (orderById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
                      (orderById.get(b.id) ?? Number.MAX_SAFE_INTEGER),
                  )
                  .map((station, index) => ({ ...station, order: index + 1 })),
              }
            : path,
        ),
      };
    });
    return true;
  };

  const handleDeletePath = async (pathId: string) => {
    const result = await deleteLearningPath(pathId);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.pathDeleteError"));
      return;
    }
    const nextPaths = (data?.paths ?? []).filter((path) => path.id !== pathId);
    setData((prev) => (prev ? { ...prev, paths: nextPaths } : prev));
    setDraft((prev) =>
      prev.pathId === pathId ? { ...prev, pathId: nextPaths[0]?.id ?? "" } : prev,
    );
  };

  const handleCreatePath = async (pathDraft: AddLearningPathDraft) => {
    setAddingPath(true);
    const result = await createLearningPath({
      courseId: journeyId,
      title: pathDraft.title,
      order: pathDraft.order,
    });
    setAddingPath(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? "Failed to add path");
      return false;
    }

    const createdPath: JourneyPath = {
      id: result.data.id,
      title: result.data.title,
      durationMinutes: 0,
      stations: [],
      isCollapsed: false,
      order: result.data.order,
    };
    const shouldSelectCreatedPath =
      !data?.paths.some((path) => path.id === draft.pathId);

    setData((prev) => {
      if (!prev) return prev;
      const nextPaths = [...prev.paths, createdPath].sort((a, b) => a.order - b.order);
      return {
        ...prev,
        paths: nextPaths,
      };
    });
    setDraft((prev) => ({
      ...prev,
      pathId: shouldSelectCreatedPath ? createdPath.id : prev.pathId,
    }));
    notify.success("Path created");
    return true;
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
      <div role="status" aria-label={t("loading.editor")}>
        <JourneyEditorPageSkeleton />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-7">
      <JourneyEditorAnimatedSection>
        <DashboardPageHeader
          title={t("editor.title")}
          description={t("editor.description")}
          breadcrumbs={[
            { label: t("breadcrumbs.home"), href: routes.home },
            { label: t("breadcrumbs.journeyEditor") },
          ]}
          action={
            <div className="flex gap-3">
              <Button
                className="h-12 rounded-xl bg-[#C8AC59] px-8 text-white shadow-[0px_4px_0px_0px_#8F6C0B] hover:bg-[#B79A46]"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {t("editor.actions.saveChanges")}
              </Button>
            </div>
          }
        />
      </JourneyEditorAnimatedSection>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <JourneyEditorAnimatedSection delay={0.06} className="space-y-5">
          {data.paths.map((path) => (
            <JourneyPathCard
              key={path.id}
              journeyId={journeyId}
              path={path}
              onAddStation={openAddStationModal}
              onDeleteStation={(stationId) => void handleDeleteStation(stationId)}
              onDeletePath={(pathId) => void handleDeletePath(pathId)}
              onReorderStations={handleReorderStations}
            />
          ))}
        </JourneyEditorAnimatedSection>
        <JourneyEditorAnimatedSection delay={0.12} className="space-y-5">
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
                      onClick={() => {
                        updateDraft("type", opt.id);
                        updateDraft("completionRule", getDefaultCompletionRule(opt.id));
                        updateDraft(
                          "completionThreshold",
                          shouldSendCompletionThreshold(opt.id) ? draft.completionThreshold : 0,
                        );
                      }}
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

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5 text-right">
                  <span className="text-sm font-semibold text-slate-600">
                    {t("editor.sidebar.completionThreshold")}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.completionThreshold}
                    onChange={(e) => updateDraft("completionThreshold", Number(e.target.value))}
                    disabled={!shouldSendCompletionThreshold(draft.type)}
                    className={cn(
                      "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors",
                      !shouldSendCompletionThreshold(draft.type) && "cursor-not-allowed opacity-60",
                    )}
                  />
                </label>

                <label className="block space-y-1.5 text-right">
                  <span className="text-sm font-semibold text-slate-600">
                    {t("editor.sidebar.pointReward")}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={draft.pointReward}
                    onChange={(e) => updateDraft("pointReward", Number(e.target.value))}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                  />
                </label>
              </div>

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

              <label className="flex cursor-pointer items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">
                  {t("editor.sidebar.autoUnlock")}
                </span>
                <ToggleSwitch
                  checked={draft.autoUnlockOnPreviousComplete}
                  onCheckedChange={(checked) =>
                    updateDraft("autoUnlockOnPreviousComplete", checked)
                  }
                  ariaLabel={t("editor.sidebar.autoUnlock")}
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
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-[#2C4260] bg-[#2C4260] text-white hover:bg-[#1E3050] shadow-[0px_4px_0px_0px_#1E305080]"
                  onClick={() => setAddPathModalOpen(true)}
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
        </JourneyEditorAnimatedSection>
      </div>

      <AddStationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        paths={data.paths}
        defaultPathId={modalPathId}
        onAdd={handleModalAdd}
        loading={addingStation}
      />
      <AddLearningPathModal
        open={addPathModalOpen}
        onOpenChange={setAddPathModalOpen}
        defaultOrder={Math.max(0, ...data.paths.map((path) => path.order)) + 1}
        onAdd={handleCreatePath}
        loading={addingPath}
      />
    </div>
  );
}
