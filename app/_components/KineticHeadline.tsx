"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { meltIn } from "@/app/_design/motion";

interface KineticHeadlineProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function KineticHeadline({
  children,
  className,
  delay = 0,
}: KineticHeadlineProps) {
  return (
    <motion.h1
      className={className}
      variants={meltIn}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.h1>
  );
}
