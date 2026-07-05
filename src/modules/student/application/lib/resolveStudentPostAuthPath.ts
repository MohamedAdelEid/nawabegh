import { ROUTES } from "@/shared/infrastructure/config/routes";
import { fetchStudentProfileSummary } from "../../infrastructure/api/onboardingQuizApi";

export async function resolveStudentPostAuthPath(userId: string): Promise<string> {
  try {
    const profile = await fetchStudentProfileSummary(userId);
    if (!profile.onboardingQuizCompleted) {
      return ROUTES.USER.STUDENT.ONBOARDING_QUIZ;
    }
  } catch {
    // Fall back to dashboard when profile cannot be loaded.
  }

  return ROUTES.USER.STUDENT.HOME;
}
