import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/application/lib/cn";

interface DashboardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardBody: React.FC<DashboardBodyProps> = ({ children, className }) => {
  const pathname = usePathname();

  return (
    <main className={cn("relative min-h-[calc(100vh_-_5rem)] overflow-visible", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-10 p-4 pt-6 sm:p-6 sm:pt-8 lg:pt-10 bg-[#F6F7F7]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};
