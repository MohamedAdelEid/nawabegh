export type SupportTicketsFilterState = {
  search: string;
  status: string;
  priority: string;
};

export const DEFAULT_SUPPORT_TICKETS_FILTERS: SupportTicketsFilterState = {
  search: "",
  status: "all",
  priority: "all",
};
