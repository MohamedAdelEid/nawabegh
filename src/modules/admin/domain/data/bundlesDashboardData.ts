import { CheckCircle2, Layers, PauseCircle, TrendingUp } from "lucide-react";

export const bundlesDashboardStats = [
  {
    id: "totalBundles",
    labelKey: "stats.totalBundles.label",
    icon: Layers,
    iconTone: "primary" as const,
  },
  {
    id: "activeBundles",
    labelKey: "stats.activeBundles.label",
    indicatorKey: "stats.activeBundles.indicator",
    indicatorClassName: "text-emerald-600",
    icon: CheckCircle2,
    iconTone: "success" as const,
  },
  {
    id: "inactiveBundles",
    labelKey: "stats.inactiveBundles.label",
    indicatorKey: "stats.inactiveBundles.indicator",
    indicatorClassName: "text-red-500",
    icon: PauseCircle,
    iconTone: "danger" as const,
  },
  {
    id: "averageCompletion",
    labelKey: "stats.averageCompletion.label",
    icon: TrendingUp,
    iconTone: "warning" as const,
    showProgress: true,
  },
] as const;
