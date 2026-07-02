type TableQueryLike = {
  isPending: boolean;
  isFetching: boolean;
  isLoading: boolean;
  data: unknown;
};

export function keepPreviousTableData<T>(previousData: T | undefined): T | undefined {
  return previousData;
}

export function getTableQueryState(query: TableQueryLike) {
  const isInitialLoading = query.isPending && !query.data;
  const isTableRefetching = query.isFetching && !query.isPending;

  return {
    isInitialLoading,
    isTableRefetching,
    isLoading: isInitialLoading,
    isRefetching: isTableRefetching,
  };
}
