import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  RegistrationAccountData,
  RegistrationContactData,
  RegistrationStepId,
  RegistrationStudyData,
  RegistrationVerificationState,
} from "@/modules/auth/domain/types/registration.types";

const STEP_ORDER: RegistrationStepId[] = ["account", "study", "contact"];

const STORAGE_KEY = "nawabegh:student-registration";

type RegistrationState = {
  currentStep: RegistrationStepId;
  account: Partial<RegistrationAccountData>;
  study: Partial<RegistrationStudyData>;
  contact: Partial<RegistrationContactData>;
  completedSteps: RegistrationStepId[];
  verification: RegistrationVerificationState | null;
};

type RegistrationActions = {
  updateAccount: (data: Partial<RegistrationAccountData>) => void;
  updateStudy: (data: Partial<RegistrationStudyData>) => void;
  updateContact: (data: Partial<RegistrationContactData>) => void;
  setVerification: (verification: RegistrationVerificationState | null) => void;
  markStepCompleted: (stepId: RegistrationStepId) => void;
  nextStep: () => RegistrationStepId | null;
  previousStep: () => RegistrationStepId | null;
  goToStep: (stepId: RegistrationStepId) => boolean;
  isStepCompleted: (stepId: RegistrationStepId) => boolean;
  canNavigateToStep: (stepId: RegistrationStepId) => boolean;
  reset: () => void;
};

export type RegistrationStore = RegistrationState & RegistrationActions;

const initialState: RegistrationState = {
  currentStep: "account",
  account: {},
  study: {},
  contact: {},
  completedSteps: [],
  verification: null,
};

function getStepIndex(stepId: RegistrationStepId): number {
  return STEP_ORDER.indexOf(stepId);
}

function prerequisitesMet(
  stepId: RegistrationStepId,
  completedSteps: RegistrationStepId[],
): boolean {
  const targetIndex = getStepIndex(stepId);
  for (let index = 0; index < targetIndex; index += 1) {
    const prerequisite = STEP_ORDER[index];
    if (prerequisite && !completedSteps.includes(prerequisite)) {
      return false;
    }
  }
  return true;
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateAccount: (data) =>
        set((state) => ({ account: { ...state.account, ...data } })),

      updateStudy: (data) =>
        set((state) => ({ study: { ...state.study, ...data } })),

      updateContact: (data) =>
        set((state) => ({ contact: { ...state.contact, ...data } })),

      setVerification: (verification) => set({ verification }),

      markStepCompleted: (stepId) =>
        set((state) => {
          if (state.completedSteps.includes(stepId)) return state;
          return { completedSteps: [...state.completedSteps, stepId] };
        }),

      isStepCompleted: (stepId) => get().completedSteps.includes(stepId),

      canNavigateToStep: (stepId) =>
        prerequisitesMet(stepId, get().completedSteps),

      goToStep: (stepId) => {
        if (!get().canNavigateToStep(stepId)) return false;
        set({ currentStep: stepId });
        return true;
      },

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = getStepIndex(currentStep);
        const next = STEP_ORDER[currentIndex + 1];
        if (!next) return null;
        set({ currentStep: next });
        return next;
      },

      previousStep: () => {
        const { currentStep } = get();
        const currentIndex = getStepIndex(currentStep);
        const previous = STEP_ORDER[currentIndex - 1];
        if (!previous) return null;
        set({ currentStep: previous });
        return previous;
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        account: state.account,
        study: state.study,
        contact: state.contact,
        completedSteps: state.completedSteps,
        verification: state.verification,
      }),
    },
  ),
);

export const REGISTRATION_STEP_ORDER = STEP_ORDER;
