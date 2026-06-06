export type PaginatedQueryParams = {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
};

export function paginatedParams(
  params?: PaginatedQueryParams,
): Record<string, string | number> {
  return {
    keyword: params?.keyword ?? " ",
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 200,
  };
}
