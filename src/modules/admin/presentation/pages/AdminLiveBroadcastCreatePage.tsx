"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  Bell,
  CalendarClock,
  Clock,
  Hourglass,
  Link2,
  Rocket,
  Save,
  SquarePlus,
  User,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {DashboardBadge, DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { cn } from "@/shared/application/lib/cn";

export function AdminLiveBroadcastCreatePage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [notifyOn, setNotifyOn] = useState(true);
  const [countdownOn, setCountdownOn] = useState(false);
  const [recordingMode, setRecordingMode] = useState<"auto" | "manual">("auto");
  const [sessionTab, setSessionTab] = useState<"upcoming" | "finished">("upcoming");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          {
            label: t("liveBroadcast.list.page.breadcrumb"),
            href: `${ROUTES.ADMIN.HOME}?tab=liveBroadcast`,
          },
          { label: t("liveBroadcast.create.page.breadcrumb") },
        ]} />
        <DashboardPageHeader
        title={t("liveBroadcast.create.page.title")}
        description={t("liveBroadcast.create.page.description")}
        action={
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl border-[var(--dashboard-border-strong)] px-6"
          >
            <Save className="ms-2 h-4 w-4" aria-hidden />
            {t("liveBroadcast.create.page.saveDraft")}
          </Button>
        }
      />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Card className="border-[var(--dashboard-border-soft)] shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 text-right">
              <div className="space-y-1">
                <div className="flex items-center justify-end gap-2 text-[var(--dashboard-primary)]">
                  <SquarePlus className="h-6 w-6" aria-hidden />
                  <h2 className="text-xl font-bold">{t("liveBroadcast.create.form.title")}</h2>
                </div>
                <p className="text-sm text-slate-500">{t("liveBroadcast.create.form.subtitle")}</p>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <Label htmlFor="lb-title">{t("liveBroadcast.create.form.sessionTitle")}</Label>
              <Input
                id="lb-title"
                placeholder={t("liveBroadcast.create.form.sessionTitlePlaceholder")}
                className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] text-right"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-right">
                <Label>{t("liveBroadcast.create.form.teacher")}</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    placeholder={t("liveBroadcast.create.form.teacherPlaceholder")}
                    className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] pr-10 text-right"
                  />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label>{t("liveBroadcast.create.form.meetingLink")}</Label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    placeholder={t("liveBroadcast.create.form.meetingLinkPlaceholder")}
                    className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] pr-10 text-right"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-right">
                <Label>{t("liveBroadcast.create.form.subject")}</Label>
                <SearchableSelect
                  value={subject}
                  onChange={setSubject}
                  options={[]}
                  placeholder={t("liveBroadcast.create.form.subjectPlaceholder")}
                  className="gap-0"
                  triggerClassName="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-3 text-right text-sm shadow-none"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label>{t("liveBroadcast.create.form.course")}</Label>
                <SearchableSelect
                  value={course}
                  onChange={setCourse}
                  options={[]}
                  placeholder={t("liveBroadcast.create.form.coursePlaceholder")}
                  className="gap-0"
                  triggerClassName="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-3 text-right text-sm shadow-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-right">
                <Label>{t("liveBroadcast.create.form.startTime")}</Label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    type="datetime-local"
                    className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] pr-10 text-right"
                  />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label>{t("liveBroadcast.create.form.duration")}</Label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    type="number"
                    defaultValue={60}
                    min={15}
                    step={5}
                    className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] pr-10 text-right"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
              <ToggleRow
                icon={Bell}
                title={t("liveBroadcast.create.form.notifyTitle")}
                description={t("liveBroadcast.create.form.notifyDescription")}
                checked={notifyOn}
                onChange={setNotifyOn}
              />
              <ToggleRow
                icon={Hourglass}
                title={t("liveBroadcast.create.form.countdownTitle")}
                description={t("liveBroadcast.create.form.countdownDescription")}
                checked={countdownOn}
                onChange={setCountdownOn}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-8 text-base font-semibold text-white"
                style={{ boxShadow: "var(--dashboard-shadow-button)" }}
              >
                <Rocket className="ms-2 h-5 w-5" aria-hidden />
                {t("liveBroadcast.create.form.submit")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="dashboard-recording-sidebar space-y-4 rounded-2xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-warning-soft)] p-5 text-right">
          <div className="flex items-start justify-end gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2 text-[var(--dashboard-gold-foreground)]">
                <Video className="h-5 w-5" aria-hidden />
                <h3 className="font-bold text-[var(--dashboard-primary)]">{t("liveBroadcast.create.recording.title")}</h3>
              </div>
              <p className="text-xs text-slate-600">{t("liveBroadcast.create.recording.hint")}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-gold)]/25 text-[var(--dashboard-gold-foreground)]">
              <Video className="h-5 w-5" aria-hidden />
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-2 hover:bg-white/40">
            <input
              type="radio"
              name="rec"
              className="mt-1"
              checked={recordingMode === "auto"}
              onChange={() => setRecordingMode("auto")}
            />
            <div>
              <p className="font-semibold text-slate-800">{t("liveBroadcast.create.recording.autoTitle")}</p>
              <p className="text-xs text-slate-600">{t("liveBroadcast.create.recording.autoDescription")}</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-2 hover:bg-white/40">
            <input
              type="radio"
              name="rec"
              className="mt-1"
              checked={recordingMode === "manual"}
              onChange={() => setRecordingMode("manual")}
            />
            <div>
              <p className="font-semibold text-slate-800">{t("liveBroadcast.create.recording.manualTitle")}</p>
              <p className="text-xs text-slate-600">{t("liveBroadcast.create.recording.manualDescription")}</p>
            </div>
          </label>
          <Button
            type="button"
            className="w-full rounded-xl bg-[var(--dashboard-gold)] font-semibold text-[var(--dashboard-primary)] hover:bg-[var(--dashboard-gold)]/90"
          >
            <Save className="ms-2 h-4 w-4" aria-hidden />
            {t("liveBroadcast.create.recording.saveSettings")}
          </Button>
        </aside>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSessionTab("upcoming")}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                sessionTab === "upcoming"
                  ? "border-b-2 border-[var(--dashboard-primary)] text-[var(--dashboard-primary)]"
                  : "text-slate-500",
              )}
            >
              {t("liveBroadcast.create.sessions.upcoming")}
            </button>
            <button
              type="button"
              onClick={() => setSessionTab("finished")}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                sessionTab === "finished"
                  ? "border-b-2 border-[var(--dashboard-primary)] text-[var(--dashboard-primary)]"
                  : "text-slate-500",
              )}
            >
              {t("liveBroadcast.create.sessions.finished")}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-rose-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden />
            {t("liveBroadcast.create.sessions.liveNow")}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SessionCardLive t={t} onEnter={() => router.push(ROUTES.ADMIN.LIVE_BROADCAST.WATCH("1"))} />
          <SessionCardUpcoming t={t} />
          <SessionCardFinished t={t} onWatch={() => router.push(ROUTES.ADMIN.LIVE_BROADCAST.WATCH("3"))} />
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 text-right">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative h-8 w-14 rounded-full transition-colors",
            checked ? "bg-[var(--dashboard-primary)]" : "bg-slate-200",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-[-0.25rem]" : "-translate-x-8",
            )}
          />
        </button>
        <Icon className="h-5 w-5 text-[var(--dashboard-primary)]" aria-hidden />
        <div>
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SessionCardLive({
  t,
  onEnter,
}: {
  t: ReturnType<typeof useTranslations>;
  onEnter: () => void;
}) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-rose-500 shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-4 p-5 text-right">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DashboardBadge tone="danger" withDot>
            {t("liveBroadcast.create.cards.liveBadge")}
          </DashboardBadge>
        </div>
        <p className="font-bold text-slate-800">{t("liveBroadcast.create.cards.liveTitle")}</p>
        <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
          <span>{t("liveBroadcast.create.cards.teacher1")}</span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
            AM
          </div>
        </div>
        <p className="text-sm text-slate-500">{t("liveBroadcast.create.cards.views")}</p>
        <Button type="button" className="w-full rounded-xl bg-rose-500 font-semibold text-white hover:bg-rose-600" onClick={onEnter}>
          {t("liveBroadcast.create.cards.enterLive")}
        </Button>
      </CardContent>
    </Card>
  );
}

function SessionCardUpcoming({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <Card className="shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-4 p-5 text-right">
        <DashboardBadge tone="info">{t("liveBroadcast.create.cards.upcomingBadge")}</DashboardBadge>
        <p className="font-bold text-slate-800">{t("liveBroadcast.create.cards.upcomingTitle")}</p>
        <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
          <span>{t("liveBroadcast.create.cards.teacher2")}</span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
            SK
          </div>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" aria-hidden />
          {t("liveBroadcast.create.cards.remaining")}
        </p>
      </CardContent>
    </Card>
  );
}

function SessionCardFinished({
  t,
  onWatch,
}: {
  t: ReturnType<typeof useTranslations>;
  onWatch: () => void;
}) {
  return (
    <Card className="border-[var(--dashboard-border-strong)] border-dashed opacity-90 shadow-none">
      <CardContent className="space-y-4 p-5 text-right">
        <DashboardBadge tone="neutral">{t("liveBroadcast.create.cards.finishedBadge")}</DashboardBadge>
        <p className="font-bold text-slate-500 line-through">{t("liveBroadcast.create.cards.finishedTitle")}</p>
        <p className="text-sm font-medium text-emerald-600">
          <span className="me-1">✓</span>
          {t("liveBroadcast.create.cards.recordingLinked")}
        </p>
        <button
          type="button"
          role="link"
          className="text-sm font-semibold text-[var(--dashboard-primary)] hover:underline"
          onClick={onWatch}
        >
          {t("liveBroadcast.create.cards.watchRecording")}
        </button>
      </CardContent>
    </Card>
  );
}
