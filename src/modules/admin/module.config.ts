import type { ModuleConfig } from "@/shared/infrastructure/config/module.types";
import type { AppLocale } from "@/config/locale";

import arDashboard from "./presentation/i18n/ar/dashboard/index.json";
import arAdManagement from "./presentation/i18n/ar/dashboard/adManagement.json";
import arCurriculumManagement from "./presentation/i18n/ar/dashboard/curriculumManagement.json";
import arExamsManagement from "./presentation/i18n/ar/dashboard/examsManagement.json";
import arBadgeManagement from "./presentation/i18n/ar/dashboard/badgeManagement.json";
import arBundleManagement from "./presentation/i18n/ar/dashboard/bundleManagement.json";
import arPaymentManagement from "./presentation/i18n/ar/dashboard/paymentManagement.json";
import arSupportTickets from "./presentation/i18n/ar/dashboard/supportTickets.json";
import arResultsAnalytics from "./presentation/i18n/ar/dashboard/resultsAnalytics.json";
import arFriendChallenges from "./presentation/i18n/ar/dashboard/friendChallenges.json";
import arOnboardingQuiz from "./presentation/i18n/ar/dashboard/onboardingQuiz.json";
import arHomeNav from "./presentation/i18n/ar/dashboard/homeNav.json";
import arHome from "./presentation/i18n/ar/dashboard/home.json";
import arNotImplemented from "./presentation/i18n/ar/dashboard/notImplemented.json";
import enDashboard from "./presentation/i18n/en/dashboard/index.json";
import enAdManagement from "./presentation/i18n/en/dashboard/adManagement.json";
import enCurriculumManagement from "./presentation/i18n/en/dashboard/curriculumManagement.json";
import enExamsManagement from "./presentation/i18n/en/dashboard/examsManagement.json";
import enBadgeManagement from "./presentation/i18n/en/dashboard/badgeManagement.json";
import enBundleManagement from "./presentation/i18n/en/dashboard/bundleManagement.json";
import enPaymentManagement from "./presentation/i18n/en/dashboard/paymentManagement.json";
import enSupportTickets from "./presentation/i18n/en/dashboard/supportTickets.json";
import enResultsAnalytics from "./presentation/i18n/en/dashboard/resultsAnalytics.json";
import enFriendChallenges from "./presentation/i18n/en/dashboard/friendChallenges.json";
import enOnboardingQuiz from "./presentation/i18n/en/dashboard/onboardingQuiz.json";
import enHomeNav from "./presentation/i18n/en/dashboard/homeNav.json";
import enHome from "./presentation/i18n/en/dashboard/home.json";
import enNotImplemented from "./presentation/i18n/en/dashboard/notImplemented.json";

function dashboardForLocale(locale: AppLocale) {
  const base = locale === "ar" ? arDashboard.dashboard : enDashboard.dashboard;
  const homeNav = locale === "ar" ? arHomeNav.homeNav : enHomeNav.homeNav;
  const home = locale === "ar" ? arHome.home : enHome.home;
  const notImplemented =
    locale === "ar" ? arNotImplemented.notImplemented : enNotImplemented.notImplemented;
  const ads = locale === "ar" ? arAdManagement.adManagement : enAdManagement.adManagement;
  const curriculum =
    locale === "ar"
      ? arCurriculumManagement.curriculumManagement
      : enCurriculumManagement.curriculumManagement;
  const exams =
    locale === "ar" ? arExamsManagement.examsManagement : enExamsManagement.examsManagement;
  const badges =
    locale === "ar" ? arBadgeManagement.badgeManagement : enBadgeManagement.badgeManagement;
  const bundles =
    locale === "ar" ? arBundleManagement.bundleManagement : enBundleManagement.bundleManagement;
  const paymentManagement =
    locale === "ar"
      ? arPaymentManagement.paymentManagement
      : enPaymentManagement.paymentManagement;
  const supportTickets =
    locale === "ar" ? arSupportTickets.supportTickets : enSupportTickets.supportTickets;
  const resultsAnalytics =
    locale === "ar"
      ? arResultsAnalytics.resultsAnalytics
      : enResultsAnalytics.resultsAnalytics;
  const friendChallenges =
    locale === "ar"
      ? arFriendChallenges.friendChallenges
      : enFriendChallenges.friendChallenges;
  const questionBankOnboardingQuiz =
    locale === "ar"
      ? arOnboardingQuiz.questionBankOnboardingQuiz
      : enOnboardingQuiz.questionBankOnboardingQuiz;
  return {
    ...base,
    home,
    homeNav,
    notImplemented,
    adManagement: ads,
    curriculumManagement: curriculum,
    examsManagement: exams,
    badgeManagement: badges,
    bundleManagement: bundles,
    paymentManagement,
    supportTickets,
    resultsAnalytics,
    friendChallenges,
    questionBankOnboardingQuiz,
  };
}

export const adminModule = {
  name: "admin",
  i18nNamespaces: ["dashboard"],
  async getMessagesForLocale(locale: AppLocale) {
    return { dashboard: dashboardForLocale(locale) };
  },
} satisfies ModuleConfig;
