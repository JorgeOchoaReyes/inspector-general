import React from "react";
import { motion } from "framer-motion";

export const FadeInSlide: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 1.25,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};