"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, type MotionProps } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";

type ModalMotionProps = Pick<MotionProps, "initial" | "animate" | "exit" | "transition">;

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  panelClassName?: string;
  overlayClassName?: string;
  motion?: ModalMotionProps;
}

export function ModalShell({
  open,
  onOpenChange,
  children,
  panelClassName,
  overlayClassName,
  motion: motionProps,
}: ModalShellProps) {
  const motionConfig: ModalMotionProps = {
    initial: { opacity: 0, scale: 0.96, y: 18 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 18 },
    transition: { duration: 0.2 },
    ...motionProps,
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn("fixed inset-0 z-50 bg-black/45 backdrop-blur-sm", overlayClassName)}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                {...motionConfig}
                className={cn(
                  "fixed inset-0 z-50 m-auto h-fit w-[min(95vw,35rem)] rounded-[2rem] border border-[#EAF2FD] bg-white p-6 shadow-2xl sm:p-8",
                  panelClassName,
                )}
              >
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export const ModalClose = Dialog.Close;
export const ModalTitle = Dialog.Title;
export const ModalDescription = Dialog.Description;
