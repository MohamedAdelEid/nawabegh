import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import {
  mapLiveChatMessageDto,
  mapLiveHandRaisedEvent,
} from "@/modules/student/domain/live-station/live-station.utils";
import type {
  LiveChatMessageDto,
  LiveHandRaisedEvent,
} from "@/modules/student/domain/live-station/live-station.types";
import { env } from "@/shared/infrastructure/config/env";
import { getToken } from "@/shared/infrastructure/http/tokenStore";

export type LiveSessionEndedEvent = {
  liveSessionId: string;
};

type ChatHandler = (message: LiveChatMessageDto) => void;
type HandHandler = (event: LiveHandRaisedEvent) => void;
type SessionEndedHandler = (event: LiveSessionEndedEvent) => void;

function resolveHubUrl(): string {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  return `${base}/hubs/live-session`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function mapSessionEnded(value: unknown): LiveSessionEndedEvent | null {
  if (typeof value === "string" && value.trim()) {
    return { liveSessionId: value.trim() };
  }
  const record = asRecord(value);
  if (!record) return null;
  const liveSessionId =
    typeof record.liveSessionId === "string"
      ? record.liveSessionId
      : typeof record.sessionId === "string"
        ? record.sessionId
        : "";
  if (!liveSessionId) return null;
  return { liveSessionId };
}

export class LiveSessionHubClient {
  private connection: HubConnection | null = null;
  private joinedSessionId: string | null = null;
  private chatHandlers = new Set<ChatHandler>();
  private handHandlers = new Set<HandHandler>();
  private endedHandlers = new Set<SessionEndedHandler>();

  onChatMessage(handler: ChatHandler): () => void {
    this.chatHandlers.add(handler);
    return () => this.chatHandlers.delete(handler);
  }

  onHandRaised(handler: HandHandler): () => void {
    this.handHandlers.add(handler);
    return () => this.handHandlers.delete(handler);
  }

  onSessionEnded(handler: SessionEndedHandler): () => void {
    this.endedHandlers.add(handler);
    return () => this.endedHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  async connect(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) return;

    await this.stopConnection();

    const connection = new HubConnectionBuilder()
      .withUrl(resolveHubUrl(), {
        accessTokenFactory: async () => (await getToken()) ?? "",
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("ReceiveChatMessage", (payload: unknown) => {
      const message = mapLiveChatMessageDto(payload);
      if (!message) return;
      this.chatHandlers.forEach((handler) => handler(message));
    });

    connection.on("ParticipantRaisedHand", (payload: unknown) => {
      const event = mapLiveHandRaisedEvent(payload);
      if (!event) return;
      this.handHandlers.forEach((handler) => handler(event));
    });

    connection.on("SessionEnded", (payload: unknown) => {
      const event = mapSessionEnded(payload);
      if (!event) return;
      this.endedHandlers.forEach((handler) => handler(event));
    });

    this.connection = connection;
    await connection.start();
  }

  async joinSession(liveSessionId: string): Promise<void> {
    const connection = this.connection;
    if (!connection || connection.state !== HubConnectionState.Connected) return;
    if (this.joinedSessionId === liveSessionId) return;

    if (this.joinedSessionId && this.joinedSessionId !== liveSessionId) {
      await this.leaveSession(this.joinedSessionId);
    }

    this.joinedSessionId = liveSessionId;
    await connection.invoke("JoinSession", liveSessionId);
  }

  async leaveSession(liveSessionId: string): Promise<void> {
    const connection = this.connection;
    if (!connection || connection.state !== HubConnectionState.Connected) return;
    try {
      await connection.invoke("LeaveSession", liveSessionId);
    } catch {
      // best-effort
    }
    if (this.joinedSessionId === liveSessionId) {
      this.joinedSessionId = null;
    }
  }

  async disconnect(): Promise<void> {
    const sessionId = this.joinedSessionId;
    if (sessionId) {
      await this.leaveSession(sessionId);
    }
    await this.stopConnection();
  }

  private async stopConnection(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    this.joinedSessionId = null;
    if (!connection) return;
    try {
      await connection.stop();
    } catch {
      // ignore
    }
  }
}
