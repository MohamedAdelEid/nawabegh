"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isTrueFalseQuestion } from "@/modules/student/application/lib/onboardingQuiz.utils";
import { useOnboardingQuizFlow } from "@/modules/student/application/hooks/useOnboardingQuiz";
import { OnboardingQuizError } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizError";
import { OnboardingQuizLoading } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizLoading";
import { OnboardingQuizMcqOptions } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizMcqOptions";
import { OnboardingQuizNavigation } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizNavigation";
import { OnboardingQuizProgressHeader } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizProgressHeader";
import { OnboardingQuizQuestionCard } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizQuestionCard";
import { OnboardingQuizResultsView } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizResultsView";
import { OnboardingQuizTrueFalseOptions } from "@/modules/student/presentation/components/onboarding-quiz/OnboardingQuizTrueFalseOptions";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function StudentOnboardingQuizPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    quizQuery,
    questions,
    currentQuestion,
    currentIndex,
    selections,
    selectOption,
    goNext,
    goPrevious,
    isLastQuestion,
    canGoNext,
    canSubmit,
    submitQuiz,
    submitMutation,
    submitResult,
    showReview,
    setShowReview,
  } = useOnboardingQuizFlow();

  useEffect(() => {
    if (quizQuery.data?.isCompleted && !submitResult) {
      router.replace(ROUTES.USER.STUDENT.HOME);
    }
  }, [quizQuery.data?.isCompleted, router, submitResult]);

  if (quizQuery.isLoading) {
    return <OnboardingQuizLoading />;
  }

  if (quizQuery.isError) {
    return (
      <OnboardingQuizError
        message={quizQuery.error instanceof Error ? quizQuery.error.message : undefined}
        onRetry={() => void quizQuery.refetch()}
      />
    );
  }

  if (submitResult) {
    return (
      <OnboardingQuizResultsView
        questions={questions}
        selections={selections}
        result={submitResult}
        showReview={showReview}
        onToggleReview={() => setShowReview((value) => !value)}
        onContinue={() => {
          if (submitResult.enrollmentSuccess && submitResult.starterCourseId) {
            router.replace(ROUTES.USER.STUDENT.COURSE_DETAIL(submitResult.starterCourseId));
            return;
          }
          router.replace(ROUTES.USER.STUDENT.HOME);
        }}
      />
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return <OnboardingQuizError onRetry={() => void quizQuery.refetch()} />;
  }

  const useTrueFalseLayout = isTrueFalseQuestion(currentQuestion.options);
  const selectedOptionId = selections[currentQuestion.id];

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-center border-b border-[#eef2f7] px-6 py-5">
        <Image
          src="/images/logos/main-logo.png"
          alt=""
          width={140}
          height={44}
          className="h-auto w-[120px] object-contain sm:w-[140px]"
          priority
        />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col px-6 py-10 sm:px-8 sm:py-12">
        <OnboardingQuizProgressHeader
          currentIndex={currentIndex}
          totalQuestions={questions.length}
        />

        <OnboardingQuizQuestionCard
          text={currentQuestion.text}
          variant={useTrueFalseLayout ? "flashcard" : "default"}
        />

        {useTrueFalseLayout ? (
          <OnboardingQuizTrueFalseOptions
            options={currentQuestion.options}
            selectedOptionId={selectedOptionId}
            onSelect={(optionId) => selectOption(currentQuestion.id, optionId)}
          />
        ) : (
          <OnboardingQuizMcqOptions
            options={currentQuestion.options}
            selectedOptionId={selectedOptionId}
            onSelect={(optionId) => selectOption(currentQuestion.id, optionId)}
          />
        )}

        <OnboardingQuizNavigation
          isLastQuestion={isLastQuestion}
          canGoNext={canGoNext}
          canSubmit={canSubmit}
          isSubmitting={submitMutation.isPending}
          showPrevious={currentIndex > 0}
          onNext={goNext}
          onPrevious={goPrevious}
          onSubmit={() => void submitQuiz()}
        />

        {submitMutation.isError ? (
          <p className="mt-4 text-center text-sm font-medium text-[#ff4b4b]">
            {submitMutation.error instanceof Error ? submitMutation.error.message : ""}
          </p>
        ) : null}

        {session?.user?.name ? (
          <p className="sr-only">{session.user.name}</p>
        ) : null}
      </main>
    </div>
  );
}
