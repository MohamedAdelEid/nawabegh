import {
  BarChart3,
  Brain,
  Code2,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const LEARNING_OUTCOME_ICONS: Record<string, LucideIcon> = {
  brain: Brain,
  ai: Brain,
  machine_learning: Brain,
  code: Code2,
  development: Code2,
  programming: Code2,
  chart: BarChart3,
  analytics: BarChart3,
  data: BarChart3,
  shield: Shield,
  ethics: Shield,
  security: Shield,
};

const DEFAULT_OUTCOME_ICON = Sparkles;

export const LEARNING_OUTCOME_COLOR_CLASSES = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
] as const;

export function getLearningOutcomeIcon(iconKey: string): LucideIcon {
  const normalized = iconKey.trim().toLowerCase().replace(/\s+/g, "_");
  return LEARNING_OUTCOME_ICONS[normalized] ?? DEFAULT_OUTCOME_ICON;
}

export function getLearningOutcomeColorClass(index: number): string {
  return (
    LEARNING_OUTCOME_COLOR_CLASSES[index % LEARNING_OUTCOME_COLOR_CLASSES.length] ??
    LEARNING_OUTCOME_COLOR_CLASSES[0]
  );
}
