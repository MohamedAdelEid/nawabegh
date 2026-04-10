export type PaginatedResponse<T> = {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
};

export type ApiError = {
  message:    string;
  statusCode: number;
  errors?:    Record<string, string[]>;
};
