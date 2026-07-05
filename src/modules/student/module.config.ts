import type { ModuleConfig } from "@/shared/infrastructure/config/module.types";
import type { AppLocale } from "@/config/locale";

import arDashboard from "./presentation/i18n/ar/dashboard/index.json";
import enDashboard from "./presentation/i18n/en/dashboard/index.json";
import arOnboardingQuiz from "./presentation/i18n/ar/onboarding-quiz/index.json";
import enOnboardingQuiz from "./presentation/i18n/en/onboarding-quiz/index.json";
import arFriendChallenge from "./presentation/i18n/ar/friend-challenge/index.json";
import enFriendChallenge from "./presentation/i18n/en/friend-challenge/index.json";

function dashboardForLocale(locale: AppLocale) {
  return locale === "ar" ? arDashboard.dashboard : enDashboard.dashboard;
}

function onboardingQuizForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arOnboardingQuiz.onboardingQuiz
    : enOnboardingQuiz.onboardingQuiz;
}

function friendChallengeForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arFriendChallenge.friendChallenge
    : enFriendChallenge.friendChallenge;
}

export const studentModule = {
  name: "student",
  i18nNamespaces: ["dashboard", "onboardingQuiz", "friendChallenge"],
  async getMessagesForLocale(locale: AppLocale) {
    return {
      dashboard: dashboardForLocale(locale),
      onboardingQuiz: onboardingQuizForLocale(locale),
      friendChallenge: friendChallengeForLocale(locale),
    };
  },
} satisfies ModuleConfig;
