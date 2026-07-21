"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectionQuality, Room, RoomEvent, Track } from "livekit-client";
import { LiveSessionRuntimeMode } from "@/modules/student/domain/progress/progress.enums";
import { StudentStationProgressStatus } from "@/modules/student/domain/progress/progress.enums";
import type {
  LiveChatMessageDto,
  LiveClassroomPanel,
  LiveParticipantDto,
  LiveStationCompletionResultDto,
  LiveStationInfoDto,
  LiveStationJoinResultDto,
  LiveStationPhase,
} from "@/modules/student/domain/live-station/live-station.types";
import {
  appendChatMessage,
  canJoinLive,
  mergeHandRaiseIntoParticipants,
  phaseForRuntimeMode,
} from "@/modules/student/domain/live-station/live-station.utils";
import {
  completeLiveStationRecording,
  getLiveStationChatMessages,
  getLiveStationParticipants,
  getLiveStationRecordingProgress,
  getStudentLiveStationInfo,
  joinStudentLiveStation,
  raiseLiveStationHand,
  saveLiveStationRecordingProgress,
  sendLiveStationChatMessage,
} from "@/modules/student/infrastructure/api/liveStation.api";
import { LiveSessionHubClient } from "@/modules/student/infrastructure/realtime/liveSessionHub";

type UseLiveStationOptions = {
  stationId: string;
  courseId?: string | null;
  learningPathId?: string | null;
};

export function useLiveStation({
  stationId,
  courseId,
  learningPathId,
}: UseLiveStationOptions) {
  const [phase, setPhase] = useState<LiveStationPhase>("loading");
  const [info, setInfo] = useState<LiveStationInfoDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<LiveStationJoinResultDto | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [chatMessages, setChatMessages] = useState<LiveChatMessageDto[]>([]);
  const [participants, setParticipants] = useState<LiveParticipantDto[]>([]);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [panel, setPanel] = useState<LiveClassroomPanel>("chat");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [camEnabled, setCamEnabled] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(
    ConnectionQuality.Unknown,
  );
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const [completionResult, setCompletionResult] =
    useState<LiveStationCompletionResultDto | null>(null);

  const roomRef = useRef<Room | null>(null);
  const hubRef = useRef<LiveSessionHubClient | null>(null);
  const leavingRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<LiveStationPhase>(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const ensureRoom = useCallback(() => {
    if (!roomRef.current) {
      roomRef.current = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
    }
    return roomRef.current;
  }, []);

  const ensureHub = useCallback(() => {
    if (!hubRef.current) {
      hubRef.current = new LiveSessionHubClient();
    }
    return hubRef.current;
  }, []);

  const loadParticipants = useCallback(async () => {
    try {
      const list = await getLiveStationParticipants(stationId);
      setParticipants(list);
    } catch {
      // non-blocking
    }
  }, [stationId]);

  const loadChatHistory = useCallback(async () => {
    try {
      const page = await getLiveStationChatMessages(stationId);
      setChatMessages(page.items);
    } catch {
      // non-blocking
    }
  }, [stationId]);

  const loadInfo = useCallback(
    async (silent = false) => {
      if (!silent) {
        setPhase("loading");
        setErrorMessage(null);
      }

      try {
        const nextInfo = await getStudentLiveStationInfo(stationId);
        setInfo(nextInfo);

        if (nextInfo.studentProgressStatus === StudentStationProgressStatus.Locked) {
          setPhase("locked");
          stopPolling();
          return nextInfo;
        }

        const currentPhase = phaseRef.current;
        const isTerminal =
          nextInfo.runtimeMode === LiveSessionRuntimeMode.Recorded ||
          nextInfo.runtimeMode === LiveSessionRuntimeMode.EndedWithoutRecording;

        if (currentPhase === "classroom" && !isTerminal && silent) {
          return nextInfo;
        }

        if (currentPhase !== "classroom") {
          setPhase(phaseForRuntimeMode(nextInfo.runtimeMode));
        }

        stopPolling();
        if (nextInfo.runtimeMode === LiveSessionRuntimeMode.Upcoming) {
          pollRef.current = setInterval(() => {
            void loadInfo(true);
          }, 30_000);
        } else if (
          nextInfo.runtimeMode === LiveSessionRuntimeMode.Live &&
          phaseRef.current !== "classroom"
        ) {
          pollRef.current = setInterval(() => {
            void loadInfo(true);
          }, 45_000);
        } else if (nextInfo.runtimeMode === LiveSessionRuntimeMode.EndedWithoutRecording) {
          pollRef.current = setInterval(() => {
            void loadInfo(true);
          }, 60_000);
        }

        if (nextInfo.runtimeMode === LiveSessionRuntimeMode.Recorded) {
          try {
            const progress = await getLiveStationRecordingProgress(stationId);
            setResumeSeconds(progress.lastPositionSeconds);
          } catch {
            setResumeSeconds(0);
          }
        }

        return nextInfo;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load live station";
        const locked =
          /مقفلة|locked|لا يمكنك عرض/i.test(message) ||
          message.toLowerCase().includes("forbidden");
        if (!silent) {
          setErrorMessage(message);
          setPhase(locked ? "locked" : "error");
        }
        return null;
      }
    },
    [stationId, stopPolling],
  );

  const leaveClassroom = useCallback(async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setIsLeaving(true);

    const hub = hubRef.current;
    const room = roomRef.current;
    const sessionId = joinResult?.liveSessionId ?? info?.liveSessionId ?? null;

    try {
      if (hub && sessionId) {
        await hub.leaveSession(sessionId);
      }
      await hub?.disconnect();
    } catch {
      // best-effort
    }

    try {
      await room?.disconnect();
    } catch {
      // best-effort
    }

    setJoinResult(null);
    setMicEnabled(false);
    setCamEnabled(false);
    setIsReconnecting(false);
    setIsLeaving(false);
    leavingRef.current = false;

    const refreshed = await loadInfo(true);
    if (refreshed) {
      setPhase(phaseForRuntimeMode(refreshed.runtimeMode));
    } else {
      setPhase("overview");
    }
  }, [info?.liveSessionId, joinResult?.liveSessionId, loadInfo]);

  const joinLive = useCallback(async () => {
    if (!info || !canJoinLive(info)) return;
    setIsJoining(true);
    setErrorMessage(null);

    try {
      const credentials = await joinStudentLiveStation(stationId);
      setJoinResult(credentials);

      const room = ensureRoom();
      const hub = ensureHub();

      await room.connect(credentials.wsUrl, credentials.token);
      await room.localParticipant.setMicrophoneEnabled(false);
      await room.localParticipant.setCameraEnabled(false);
      setMicEnabled(false);
      setCamEnabled(false);

      await hub.connect();
      await hub.joinSession(credentials.liveSessionId);

      await Promise.all([loadChatHistory(), loadParticipants()]);

      setPanel("chat");
      setIsFullscreen(false);
      setPhase("classroom");
      stopPolling();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join live session";
      setErrorMessage(message);
      try {
        await roomRef.current?.disconnect();
      } catch {
        // ignore
      }
      try {
        await hubRef.current?.disconnect();
      } catch {
        // ignore
      }
    } finally {
      setIsJoining(false);
    }
  }, [
    ensureHub,
    ensureRoom,
    info,
    loadChatHistory,
    loadParticipants,
    stationId,
    stopPolling,
  ]);

  const sendChat = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const message = await sendLiveStationChatMessage(stationId, trimmed);
      setChatMessages((prev) => appendChatMessage(prev, message));
    },
    [stationId],
  );

  const toggleRaiseHand = useCallback(async () => {
    const next = !hasRaisedHand;
    setHasRaisedHand(next);
    try {
      const event = await raiseLiveStationHand(stationId, next);
      if (event) {
        setHasRaisedHand(event.raised);
        setParticipants((prev) => mergeHandRaiseIntoParticipants(prev, event));
      }
      await loadParticipants();
    } catch (error) {
      setHasRaisedHand(!next);
      throw error;
    }
  }, [hasRaisedHand, loadParticipants, stationId]);

  const toggleMicrophone = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }, [micEnabled]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !camEnabled;
    await room.localParticipant.setCameraEnabled(next);
    setCamEnabled(next);
  }, [camEnabled]);

  const saveRecordingProgress = useCallback(
    async (seconds: number) => {
      setResumeSeconds(seconds);
      try {
        await saveLiveStationRecordingProgress(stationId, Math.floor(seconds));
      } catch {
        // non-blocking
      }
    },
    [stationId],
  );

  const completeRecording = useCallback(
    async (percentageCompleted: number) => {
      const result = await completeLiveStationRecording(
        stationId,
        percentageCompleted,
      );
      setCompletionResult(result);
      await loadInfo(true);
      return result;
    },
    [loadInfo, stationId],
  );

  // Initial load
  useEffect(() => {
    void loadInfo(false);
    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per station
  }, [stationId]);

  // Room + hub listeners while in classroom
  useEffect(() => {
    if (phase !== "classroom") return;

    const room = ensureRoom();
    const hub = ensureHub();

    const onQuality = (quality: ConnectionQuality) => {
      setConnectionQuality(quality);
    };
    const onReconnecting = () => setIsReconnecting(true);
    const onReconnected = () => setIsReconnecting(false);
    const onDisconnected = () => {
      if (leavingRef.current) return;
      setIsReconnecting(true);
    };

    room.on(RoomEvent.ConnectionQualityChanged, onQuality);
    room.on(RoomEvent.Reconnecting, onReconnecting);
    room.on(RoomEvent.Reconnected, onReconnected);
    room.on(RoomEvent.Disconnected, onDisconnected);

    const offChat = hub.onChatMessage((message) => {
      setChatMessages((prev) => appendChatMessage(prev, message));
    });
    const offHand = hub.onHandRaised((event) => {
      setParticipants((prev) => mergeHandRaiseIntoParticipants(prev, event));
      // Reflect own hand if identity matches join display — best effort via participants refresh
      void loadParticipants();
    });
    const offEnded = hub.onSessionEnded(async (event) => {
      const currentId = joinResult?.liveSessionId ?? info?.liveSessionId;
      if (
        currentId &&
        event.liveSessionId &&
        event.liveSessionId !== currentId
      ) {
        return;
      }
      await leaveClassroom();
    });

    const participantsPoll = setInterval(() => {
      void loadParticipants();
    }, 20_000);

    return () => {
      room.off(RoomEvent.ConnectionQualityChanged, onQuality);
      room.off(RoomEvent.Reconnecting, onReconnecting);
      room.off(RoomEvent.Reconnected, onReconnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
      offChat();
      offHand();
      offEnded();
      clearInterval(participantsPoll);
    };
  }, [
    ensureHub,
    ensureRoom,
    info?.liveSessionId,
    joinResult?.liveSessionId,
    leaveClassroom,
    loadParticipants,
    phase,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leavingRef.current = true;
      stopPolling();
      void hubRef.current?.disconnect();
      void roomRef.current?.disconnect();
    };
  }, [stopPolling]);

  return {
    stationId,
    courseId: courseId ?? null,
    learningPathId: learningPathId ?? null,
    phase,
    info,
    errorMessage,
    joinResult,
    isJoining,
    isLeaving,
    chatMessages,
    participants,
    hasRaisedHand,
    panel,
    setPanel,
    isFullscreen,
    setIsFullscreen,
    micEnabled,
    camEnabled,
    connectionQuality,
    isReconnecting,
    resumeSeconds,
    completionResult,
    room: roomRef.current,
    getRoom: ensureRoom,
    loadInfo,
    joinLive,
    leaveClassroom,
    sendChat,
    toggleRaiseHand,
    toggleMicrophone,
    toggleCamera,
    loadParticipants,
    saveRecordingProgress,
    completeRecording,
    canJoin: info ? canJoinLive(info) : false,
  };
}

export type UseLiveStationReturn = ReturnType<typeof useLiveStation>;

/** Prefer screen-share track, else first remote camera. */
export function pickPrimaryVideoPublication(room: Room | null) {
  if (!room) return null;
  for (const participant of room.remoteParticipants.values()) {
    for (const pub of participant.trackPublications.values()) {
      if (
        pub.kind === Track.Kind.Video &&
        pub.source === Track.Source.ScreenShare &&
        pub.track
      ) {
        return { participant, publication: pub };
      }
    }
  }
  for (const participant of room.remoteParticipants.values()) {
    for (const pub of participant.trackPublications.values()) {
      if (
        pub.kind === Track.Kind.Video &&
        pub.source === Track.Source.Camera &&
        pub.track
      ) {
        return { participant, publication: pub };
      }
    }
  }
  return null;
}

export function pickHostCameraPublication(
  room: Room | null,
  hostIdentity?: string | null,
) {
  if (!room) return null;
  const remotes = [...room.remoteParticipants.values()];
  const host =
    (hostIdentity
      ? remotes.find((p) => p.identity === hostIdentity)
      : null) ?? remotes[0];
  if (!host) return null;
  for (const pub of host.trackPublications.values()) {
    if (
      pub.kind === Track.Kind.Video &&
      pub.source === Track.Source.Camera &&
      pub.track
    ) {
      return { participant: host, publication: pub };
    }
  }
  return null;
}
