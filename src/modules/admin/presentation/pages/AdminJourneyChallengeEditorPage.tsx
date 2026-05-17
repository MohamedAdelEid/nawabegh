"use client";

import {
  Eye,
  FileUp,
  Lock,
  Save,
  Sparkles,
  Swords,
  Timer,
  Zap,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { ChallengeStation, ChallengeTypeId, FlashcardDifficultyId } from "@/modules/admin/domain/data/journeyEditorData";
import { getChallengeStation, saveChallengeStation } from "@/modules/admin/infrastructure/api/journeyEditorApi";
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

const QUESTIONS_COUNT_OPTIONS = [5, 10, 15, 20] as const;
const DURATION_OPTIONS = [5, 8, 10, 15, 20] as const;
const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];

const CHALLENGE_TYPES: {
  id: ChallengeTypeId;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: "timeChallenge", icon: <Timer className="h-7 w-7" />, color: "text-blue-500" },
  { id: "shortQuiz", icon: <ClipboardList className="h-7 w-7" />, color: "text-slate-600" },
  { id: "speedChallenge", icon: <Zap className="h-7 w-7" />, color: "text-amber-500" },
];

export function AdminJourneyChallengeEditorPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.challengeEditor");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();

  const [station, setStation] = useState<ChallengeStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const result = await getChallengeStation(stationId);
      if (result.data) setStation(result.data);
      setLoading(false);
    })();
  }, [stationId]);

  const update = <K extends keyof ChallengeStation>(key: K, value: ChallengeStation[K]) => {
    setStation((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!station) return;
    setSaving(true);
    const result = await saveChallengeStation(stationId, station);
    setSaving(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success("Challenge saved");
  };

  if (loading || !station) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
      </div>
    );
  }

  const typeInfo = CHALLENGE_TYPES.find((c) => c.id === station.challengeType);

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: ROUTES.ADMIN.HOME },
          {
            label: tBc("journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          { label: tBc("challengeEditor") },
        ]}
        action={
          <Button
            className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {t("actions.saveChallenge")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Left sidebar summary */}
        <aside className="space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-bold">{t("sidebar.title")}</h2>

              <div className="space-y-2">
                {[
                  {
                    label: t("sidebar.type"),
                    value: t(`types.${station.challengeType}`),
                  },
                  {
                    label: t("sidebar.questionsCount"),
                    value: `${station.questionsCount} ${t("sidebar.questions")}`,
                  },
                  {
                    label: t("sidebar.time"),
                    value: `${station.durationMin} ${t("sidebar.minutes")}`,
                  },
                  {
                    label: t("sidebar.level"),
                    value: t(`difficulty.${station.difficulty}`),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                    <span className="font-semibold text-white">{value}</span>
                    <span className="text-xs text-white/60">{label}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="h-11 w-full gap-2 rounded-2xl border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Eye className="h-4 w-4" />
                {t("actions.previewChallenge")}
              </Button>
              <Button
                className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {t("actions.saveAndPublish")}
              </Button>

              {/* Locked badge */}
              <div className="flex items-center justify-end gap-2 rounded-xl bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-200">
                <Lock className="h-3.5 w-3.5" />
                {t("sidebar.locked")}
              </div>

              {/* AI note */}
              <div className="flex items-start gap-2 rounded-xl bg-[#C8AC59]/20 p-3 text-xs text-[#C8AC59]">
                <Sparkles className="h-4 w-4 shrink-0" />
                {t("sidebar.aiNote")}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {/* Challenge type */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="text-right font-bold text-slate-800">{t("sections.type")}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {CHALLENGE_TYPES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update("challengeType", opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-[1.5rem] border-2 p-6 text-center transition-colors",
                      station.challengeType === opt.id
                        ? "border-[#2C4260] bg-[#EEF2FB]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300",
                    )}
                  >
                    <span className={opt.color}>{opt.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800">{t(`types.${opt.id}`)}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {t(`types.${opt.id}Description`)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="flex items-center gap-2 text-right font-bold text-slate-800">
                <Swords className="h-4 w-4 text-slate-400" />
                {t("sections.settings")}
              </h2>

              <div className="space-y-3 text-right">
                <p className="text-sm font-semibold text-slate-600">
                  {t("settings.questionsCount")}
                </p>
                <div className="flex gap-3">
                  {QUESTIONS_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => update("questionsCount", count)}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-colors",
                        station.questionsCount === count
                          ? "bg-[#2C4260] text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    {t("settings.duration")}
                  </p>
                  <div className="relative">
                    <Timer className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      value={station.durationMin}
                      onChange={(e) => update("durationMin", Number(e.target.value) as ChallengeStation["durationMin"])}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                    >
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    {t("settings.difficulty")}
                  </p>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update("difficulty", d)}
                        className={cn(
                          "flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors",
                          station.difficulty === d
                            ? "bg-[#2C4260] text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {t(`difficulty.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File upload */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="text-right text-sm font-bold text-slate-700">
                <span className="ml-2 text-slate-400">02.</span>
                {t("sections.sources")}
              </h3>

              <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.mp4" className="hidden" />

              {station.sourceFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "sourceFiles",
                          station.sourceFiles.filter((f) => f.id !== file.id),
                        )
                      }
                      className="rounded-full bg-slate-200 p-0.5 text-slate-500 hover:bg-rose-100 hover:text-rose-500"
                    >
                      ×
                    </button>
                    <span className="text-xs text-emerald-500">تم الرفع بنجاح</span>
                    <span className="text-xs text-slate-400">{file.sizeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                      <FileUp className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]"
              >
                <FileUp className="h-8 w-8" />
                <p className="font-semibold">{t("upload.drag")}</p>
                <p className="text-xs">
                  {t("upload.formats")} · {t("upload.maxSize")}
                </p>
              </button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
