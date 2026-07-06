export const onboardingQuizQueryKeys = {
  all: ["student", "onboarding-quiz"] as const,
  quiz: () => [...onboardingQuizQueryKeys.all, "quiz"] as const,
  profile: (userId: string) => [...onboardingQuizQueryKeys.all, "profile", userId] as const,
};
