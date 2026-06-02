"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RegistrationInitialData } from "@/modules/auth/domain/types/registration.types";
import { RegistrationLayout } from "@/modules/auth/presentation/components/registration/RegistrationLayout";
import { AccountStep } from "@/modules/auth/presentation/components/registration/steps/AccountStep";
import { ContactStep } from "@/modules/auth/presentation/components/registration/steps/ContactStep";
import { StudyStep } from "@/modules/auth/presentation/components/registration/steps/StudyStep";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: "easeOut" as const },
};

type RegisterPageProps = {
  initial: RegistrationInitialData;
};

export function RegisterPage({ initial }: RegisterPageProps) {
  const currentStep = useRegistrationStore((state) => state.currentStep);

  return (
    <RegistrationLayout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={currentStep} {...stepMotion}>
          {currentStep === "account" ? <AccountStep initial={initial} /> : null}
          {currentStep === "study" ? <StudyStep /> : null}
          {currentStep === "contact" ? <ContactStep /> : null}
        </motion.div>
      </AnimatePresence>
    </RegistrationLayout>
  );
}
