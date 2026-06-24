import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export type KnowledgeCommunityCategoriesApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type KnowledgeCommunityCategoryOption = {
  id: string;
  name: string;
};

export type KnowledgeCommunityCategoriesDropdownParams = {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function extractDataArray(data: unknown): unknown[] {
  const root = asRecord(data);
  if (Array.isArray(data)) return data;
  if (Array.isArray(root?.data)) return root.data as unknown[];
  const dataNode = asRecord(root?.data);
  if (Array.isArray(dataNode?.rows)) return dataNode.rows as unknown[];
  if (Array.isArray(dataNode?.items)) return dataNode.items as unknown[];
  return [];
}

function mapCategoryOption(item: unknown): KnowledgeCommunityCategoryOption | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id"], "");
  const name = readString(record, ["name", "label", "title"], "");
  if (!id || !name) return null;
  return { id, name };
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): KnowledgeCommunityCategoriesApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;

  const detailMessage =
    readString(responseData, ["detail", "title"], "") ||
    dataEnvelope?.error?.message ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status: (typeof dataEnvelope?.status === "string" ? dataEnvelope.status : undefined) ?? "Error",
    message: typeof dataEnvelope?.message === "string" ? dataEnvelope.message : undefined,
    errorMessage: detailMessage,
    data: null,
  };
}

export async function getKnowledgeCommunityCategoriesDropdown(
  params: KnowledgeCommunityCategoriesDropdownParams = {},
): Promise<KnowledgeCommunityCategoriesApiResult<KnowledgeCommunityCategoryOption[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/knowledgeCommunity/categories/dropdown",
      params: {
        keyword: params.keyword?.trim() || undefined,
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 200,
      },
    });

    const categories = extractDataArray(response.data)
      .map((item) => mapCategoryOption(item))
      .filter((item): item is KnowledgeCommunityCategoryOption => item !== null);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: categories,
    };
  } catch (error) {
    const failed = buildErrorResult<KnowledgeCommunityCategoryOption[]>(
      error,
      "Failed to load community categories",
    );
    return { ...failed, data: failed.data ?? [] };
  }
}
