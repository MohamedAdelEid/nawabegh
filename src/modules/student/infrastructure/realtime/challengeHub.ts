import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import {
  mapChallengeMatchFoundEvent,
  mapChallengeSessionEndedEvent,
} from "@/modules/student/domain/challenge-station/challenge-station.utils";
import type {
  ChallengeMatchFoundEvent,
  ChallengeSessionEndedEvent,
} from "@/modules/student/domain/challenge-station/challenge-station.types";
import { env } from "@/shared/infrastructure/config/env";
import { getToken } from "@/shared/infrastructure/http/tokenStore";

type MatchFoundHandler = (event: ChallengeMatchFoundEvent) => void;
type SessionEndedHandler = (event: ChallengeSessionEndedEvent) => void;

function resolveHubUrl(): string {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  return `${base}/hubs/challenge`;
}

export class ChallengeHubClient {
  private connection: HubConnection | null = null;
  private registeredSessionId: string | null = null;
  private matchHandlers = new Set<MatchFoundHandler>();
  private endedHandlers = new Set<SessionEndedHandler>();

  onMatchFound(handler: MatchFoundHandler): () => void {
    this.matchHandlers.add(handler);
    return () => this.matchHandlers.delete(handler);
  }

  onSessionEnded(handler: SessionEndedHandler): () => void {
    this.endedHandlers.add(handler);
    return () => this.endedHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  get connectionId(): string | null {
    return this.connection?.connectionId ?? null;
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

    connection.on("MatchFound", (payload: unknown) => {
      const event = mapChallengeMatchFoundEvent(payload);
      if (!event) return;
      this.matchHandlers.forEach((handler) => handler(event));
    });

    connection.on("SessionEnded", (payload: unknown) => {
      const event = mapChallengeSessionEndedEvent(payload);
      if (!event) return;
      this.endedHandlers.forEach((handler) => handler(event));
    });

    this.connection = connection;
    await connection.start();
  }

  async registerSession(sessionId: string): Promise<void> {
    const connection = this.connection;
    if (!connection || connection.state !== HubConnectionState.Connected) return;
    if (this.registeredSessionId === sessionId) return;
    await connection.invoke("RegisterSession", sessionId);
    this.registeredSessionId = sessionId;
  }

  async leaveSession(sessionId: string): Promise<void> {
    const connection = this.connection;
    if (!connection || connection.state !== HubConnectionState.Connected) return;
    try {
      await connection.invoke("LeaveSession", sessionId);
    } catch {
      // ignore leave errors on teardown
    }
    if (this.registeredSessionId === sessionId) {
      this.registeredSessionId = null;
    }
  }

  async disconnect(): Promise<void> {
    const sessionId = this.registeredSessionId;
    if (sessionId) {
      await this.leaveSession(sessionId);
    }
    await this.stopConnection();
  }

  private async stopConnection(): Promise<void> {
    if (!this.connection) return;
    try {
      await this.connection.stop();
    } catch {
      // ignore
    }
    this.connection = null;
    this.registeredSessionId = null;
  }
}
