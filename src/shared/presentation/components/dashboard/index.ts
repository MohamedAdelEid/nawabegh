// Layout — page shell, headers, tabs
export { DashboardBreadcrumb } from "./layout/DashboardBreadcrumb";
export type { DashboardBreadcrumbItem } from "./layout/DashboardBreadcrumb";
export { DashboardPageHeader } from "./layout/DashboardPageHeader";
export { DashboardSectionHeader } from "./layout/DashboardSectionHeader";
export { DashboardTabPage } from "./layout/DashboardTabPage";
export { DashboardTabPlaceholder } from "./layout/DashboardTabPlaceholder";

// Filters — search, selects, segmented controls
export {
  DashboardFilterSelect,
  DashboardSearchFilter,
} from "./filters/DashboardFilters";
export type { DashboardFilterOption } from "./filters/DashboardFilters";
export { DashboardFiltersPanel } from "./filters/DashboardFiltersPanel";
export { DashboardSegmentedControl } from "./filters/DashboardSegmentedControl";
export type { DashboardSegmentOption } from "./filters/DashboardSegmentedControl";

// Table — data tables, pagination
export { DashboardDataTable } from "./table/DashboardDataTable";
export type { DashboardDataTableColumn } from "./table/DashboardDataTable";
export { DashboardTableCard } from "./table/DashboardTableCard";
export { DashboardPagination } from "./table/DashboardPagination";
export { DashboardTableFooterPagination } from "./table/DashboardTableFooterPagination";

// Cards — stats, insights, badges
export { DashboardBadge } from "./cards/DashboardBadge";
export type { DashboardBadgeTone } from "./cards/DashboardBadge";
export { DashboardStatCard } from "./cards/DashboardStatCard";
export { DashboardInsightCard } from "./cards/DashboardInsightCard";

// Controls — view toggles and similar actions
export { DashboardViewToggle } from "./controls/DashboardViewToggle";
export type { DashboardViewMode } from "./controls/DashboardViewToggle";
