"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLiveStation } from "@/modules/student/application/hooks/useLiveStation";
import { LiveStationClassroom } from "./LiveStationClassroom";
import { LiveStationJoinModal } from "./LiveStationJoinModal";
import { LiveStationRecordedView } from "./LiveStationRecordedView";
import { LiveStationSkeleton } from "./LiveStationSkeleton";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";

type LiveStationDashboardProps = {
  stationId: string;
  courseId?: string | null;
  learningPathId?: string | null;
};

export function LiveStationDashboard({
  stationId,
  courseId,
  learningPathId,
}: LiveStationDashboardProps) {
  const t = useTranslations("student.dashboard.liveStation");
  const router = useRouter();
  const session = useLiveStation({ stationId, courseId, learningPathId });

  const backToJourney = () => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (learningPathId) params.set("pathId", learningPathId);
    const query = params.toString();
    router.push(
      query
        ? `${ROUTES.USER.STUDENT.JOURNEY}?${query}`
        : ROUTES.USER.STUDENT.JOURNEY,
    );
  };

  const openAttachments = () => {
    const attachments = session.info?.attachments ?? [];
    const first = attachments[0];
    if (!first) {
      notify.info(t("attachments.empty"));
      return;
    }
    window.open(first.fileUrl, "_blank", "noopener,noreferrer");
  };

  if (session.phase === "loading") {
    return <LiveStationSkeleton />;
  }

  if (session.phase === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f6f7f7] p-6">
        <ApiFailureAlert
          message={session.errorMessage}
          fallbackMessage={t("errors.load")}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={backToJourney}>
            {t("actions.back")}
          </Button>
          <Button type="button" onClick={() => void session.loadInfo(false)}>
            {t("actions.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (session.phase === "locked") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f6f7f7] p-6 text-center">
        <p className="max-w-md text-lg font-bold text-[#2c4260]">{t("locked.title")}</p>
        <p className="max-w-md text-sm text-slate-500">{t("locked.description")}</p>
        <Button type="button" onClick={backToJourney}>
          {t("actions.back")}
        </Button>
      </div>
    );
  }

  if (session.phase === "ended") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f6f7f7] p-6 text-center">
        <p className="max-w-md text-lg font-bold text-[#2c4260]">{t("ended.title")}</p>
        <p className="max-w-md text-sm text-slate-500">{t("ended.description")}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={backToJourney}>
            {t("actions.back")}
          </Button>
          <Button type="button" onClick={() => void session.loadInfo(false)}>
            {t("actions.refresh")}
          </Button>
        </div>
      </div>
    );
  }

  if (session.phase === "recorded" && session.info) {
    return (
      <LiveStationRecordedView
        info={session.info}
        resumeSeconds={session.resumeSeconds}
        onSaveProgress={session.saveRecordingProgress}
        onComplete={async (percentage) => {
          await session.completeRecording(percentage);
          notify.success(t("recorded.completed"));
        }}
        onBack={backToJourney}
      />
    );
  }

  if (session.phase === "classroom" && session.info) {
    return (
      <LiveStationClassroom
        info={session.info}
        joinResult={session.joinResult}
        room={session.getRoom()}
        chatMessages={session.chatMessages}
        participants={session.participants}
        panel={session.panel}
        isFullscreen={session.isFullscreen}
        hasRaisedHand={session.hasRaisedHand}
        micEnabled={session.micEnabled}
        camEnabled={session.camEnabled}
        connectionQuality={session.connectionQuality}
        isReconnecting={session.isReconnecting}
        isLeaving={session.isLeaving}
        onSetPanel={session.setPanel}
        onSetFullscreen={session.setIsFullscreen}
        onLeave={() => void session.leaveClassroom()}
        onRaiseHand={() => {
          void session.toggleRaiseHand().catch((error) => {
            notify.error(
              error instanceof Error ? error.message : t("errors.raiseHand"),
            );
          });
        }}
        onToggleMic={() => {
          void session.toggleMicrophone().catch((error) => {
            notify.error(
              error instanceof Error ? error.message : t("errors.media"),
            );
          });
        }}
        onToggleCam={() => {
          void session.toggleCamera().catch((error) => {
            notify.error(
              error instanceof Error ? error.message : t("errors.media"),
            );
          });
        }}
        onSendChat={async (body) => {
          try {
            await session.sendChat(body);
          } catch (error) {
            notify.error(
              error instanceof Error ? error.message : t("errors.chat"),
            );
          }
        }}
      />
    );
  }

  // overview
  return (
    <div className="relative min-h-dvh bg-[#f6f7f7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(44,66,96,0.12),_transparent_55%)]" />
      {session.info ? (
        <LiveStationJoinModal
          info={session.info}
          isJoining={session.isJoining}
          canJoin={session.canJoin}
          onJoin={() => void session.joinLive()}
          onClose={backToJourney}
          onViewAttachments={openAttachments}
        />
      ) : (
        <LiveStationSkeleton />
      )}
      {session.errorMessage ? (
        <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-lg">
          <ApiFailureAlert
            message={session.errorMessage}
            fallbackMessage={t("errors.join")}
          />
        </div>
      ) : null}
    </div>
  );
}
