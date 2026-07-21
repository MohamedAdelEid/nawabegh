import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { env } from "@/shared/infrastructure/config/env";
import { getToken } from "@/shared/infrastructure/http/tokenStore";

export type SchoolEventLiveHubHandlers = {
  onScoreUpdated?: (payload: unknown) => void;
  onFeedItemAdded?: (payload: unknown) => void;
  onPollResultsUpdated?: (payload: unknown) => void;
  onMatchTimerTick?: (payload: unknown) => void;
};

function hubUrl() {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  return `${base}/hubs/school-event-live`;
}

function attachHandlers(
  connection: HubConnection,
  handlers: SchoolEventLiveHubHandlers,
) {
  if (handlers.onScoreUpdated) {
    connection.on("ScoreUpdated", handlers.onScoreUpdated);
  }
  if (handlers.onFeedItemAdded) {
    connection.on("FeedItemAdded", handlers.onFeedItemAdded);
  }
  if (handlers.onPollResultsUpdated) {
    connection.on("PollResultsUpdated", handlers.onPollResultsUpdated);
  }
  if (handlers.onMatchTimerTick) {
    connection.on("MatchTimerTick", handlers.onMatchTimerTick);
  }
}

async function isHubReachable(): Promise<boolean> {
  try {
    const token = await getToken();
    const response = await fetch(`${hubUrl()}/negotiate?negotiateVersion=1`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return false;
    const payload = (await response.json()) as { connectionToken?: string; connectionId?: string };
    return Boolean(payload.connectionToken || payload.connectionId);
  } catch {
    return false;
  }
}

/**
 * Connects to the school-event live hub when available.
 * Returns `null` (never throws) if the hub/transport is unavailable so
 * the UI can keep using HTTP polling as a fallback.
 *
 * Note: enable from the hook only when NEXT_PUBLIC_SCHOOL_EVENT_LIVE_HUB=true.
 * Handshake failures on unstable hubs surface as uncaught SSE errors in Next.js.
 */
export async function connectSchoolEventLiveHub(
  eventId: number | string,
  handlers: SchoolEventLiveHubHandlers,
  options?: { signal?: AbortSignal },
): Promise<HubConnection | null> {
  if (typeof window === "undefined") return null;
  if (options?.signal?.aborted) return null;

  // Prefer Long Polling first — WebSockets/SSE handshake aborts commonly throw
  // uncaught runtime errors in Next.js even when start() is wrapped in try/catch.
  const connection = new HubConnectionBuilder()
    .withUrl(hubUrl(), {
      accessTokenFactory: async () => (await getToken()) ?? "",
      transport: HttpTransportType.LongPolling,
    })
    .configureLogging(LogLevel.None)
    .build();

  attachHandlers(connection, handlers);

  const abort = () => {
    void connection.stop().catch(() => undefined);
  };
  options?.signal?.addEventListener("abort", abort, { once: true });

  try {
    const reachable = await isHubReachable();
    if (!reachable || options?.signal?.aborted) return null;

    await connection.start();

    if (options?.signal?.aborted || connection.state !== HubConnectionState.Connected) {
      abort();
      return null;
    }

    await connection.invoke("JoinEvent", Number(eventId) || eventId);

    if (options?.signal?.aborted) {
      abort();
      return null;
    }

    return connection;
  } catch {
    abort();
    return null;
  } finally {
    options?.signal?.removeEventListener("abort", abort);
  }
}

export async function disconnectSchoolEventLiveHub(
  connection: HubConnection | null,
  eventId?: number | string,
) {
  if (!connection) return;
  try {
    if (
      eventId != null &&
      connection.state === HubConnectionState.Connected
    ) {
      await connection.invoke("LeaveEvent", Number(eventId) || eventId);
    }
  } catch {
    // ignore leave errors during teardown
  }
  try {
    await connection.stop();
  } catch {
    // ignore stop errors during teardown (includes handshake canceled)
  }
}
