import type React from "react";
import { motion } from "framer-motion";

interface MobileOverlayProps {
  onClick: () => void;
}

export const MobileOverlay: React.FC<MobileOverlayProps> = ({ onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-[2px]"
      onClick={onClick}
    />
  );
};
