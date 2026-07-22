import {
  clampPercent,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import type {
  ParentChildDetails,
  ParentChildListItem,
} from "@/modules/parent/domain/types/parentChildren.types";
import type { ParentHomeChild } from "@/modules/parent/domain/types/parentHome.types";
import type { ParentActiveSubscription } from "@/modules/parent/domain/types/parentPayments.types";

export type ParentChildCardModel = ParentChildListItem & {
  progressPercent: number;
  points: number;
  schoolRank: number | null;
  badgesCount: number;
  subscription: ParentActiveSubscription | null;
};

export function enrichChildrenCards(params: {
  children: ParentChildListItem[];
  homeChildren?: ParentHomeChild[];
  comparisons?: Array<{
    studentUserId: string;
    badgesCount: number;
    points: number;
    progressPercent: number;
  }>;
  subscriptions?: ParentActiveSubscription[];
}): ParentChildCardModel[] {
  const homeById = new Map(
    (params.homeChildren ?? []).map((child) => [child.studentUserId, child]),
  );
  const comparisonById = new Map(
    (params.comparisons ?? []).map((child) => [child.studentUserId, child]),
  );
  const subscriptionById = new Map(
    (params.subscriptions ?? []).map((item) => [item.studentUserId, item]),
  );

  return params.children.map((child) => {
    const home = homeById.get(child.studentUserId);
    const comparison = comparisonById.get(child.studentUserId);
    return {
      ...child,
      progressPercent: clampPercent(
        comparison?.progressPercent ?? home?.progressPercent ?? 0,
      ),
      points: comparison?.points ?? home?.points ?? 0,
      schoolRank: home?.schoolRank ?? null,
      badgesCount: comparison?.badgesCount ?? 0,
      subscription: subscriptionById.get(child.studentUserId) ?? null,
    };
  });
}

export function getChildGradeLabel(
  locale: string,
  child: Pick<
    ParentChildListItem,
    "gradeNameAr" | "gradeNameEn" | "educationLevelNameAr" | "educationLevelNameEn"
  >,
): string {
  const grade = resolveLocalizedText(
    locale,
    child.gradeNameAr,
    child.gradeNameEn,
  );
  const level = resolveLocalizedText(
    locale,
    child.educationLevelNameAr,
    child.educationLevelNameEn,
  );
  return [grade, level].filter(Boolean).join(" - ");
}

export function getChildStatusTone(isActive: boolean, progressPercent: number) {
  if (!isActive) {
    return {
      badge: "bg-[#d33131] text-white",
      progress: "bg-[#d33131]",
      button: "bg-[#d33131] hover:bg-[#b82a2a]",
    };
  }
  if (progressPercent >= 80) {
    return {
      badge: "bg-[#58cc02] text-white",
      progress: "bg-[#58cc02]",
      button: "bg-[#2b415e] hover:bg-[#24384f]",
    };
  }
  if (progressPercent >= 55) {
    return {
      badge: "bg-[#c7af6d] text-white",
      progress: "bg-[#c7af6d]",
      button: "bg-[#2b415e] hover:bg-[#24384f]",
    };
  }
  return {
    badge: "bg-[#d33131] text-white",
    progress: "bg-[#d33131]",
    button: "bg-[#d33131] hover:bg-[#b82a2a]",
  };
}

export function getChildDisplayName(details: Pick<ParentChildDetails, "fullName">) {
  return details.fullName.trim() || "—";
}

export function getChildAlertTone(severity: string): {
  container: string;
  title: string;
  message: string;
} {
  if (severity === "urgent") {
    return {
      container: "bg-[rgba(255,228,228,0.5)]",
      title: "text-[#d33131]",
      message: "text-[rgba(211,49,49,0.7)]",
    };
  }
  return {
    container: "bg-[rgba(244,236,216,0.5)]",
    title: "text-[#a38f5a]",
    message: "text-[rgba(163,143,90,0.7)]",
  };
}

export function getLearningPathStatusTone(status: string): {
  badge: string;
  dot: string;
} {
  if (status === "completed") {
    return { badge: "bg-[#dcf4cb] text-[#46a302]", dot: "bg-[#58cc02]" };
  }
  if (status === "in_progress") {
    return { badge: "bg-[#e8f0ff] text-[#2b415e]", dot: "bg-[#2b415e]" };
  }
  return { badge: "bg-[#f1f3f5] text-[#94a3b8]", dot: "bg-[#cbd5e1]" };
}

export function getEstimatedLevel(details: Pick<ParentChildDetails, "estimatedLevel" | "progressPercent">) {
  if (details.estimatedLevel != null) return details.estimatedLevel;
  return Math.max(1, Math.round(clampPercent(details.progressPercent) / 8));
}
