"use client";

import React, { useEffect, useState } from "react";
import FidelLoader from "./FidelLoader";

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<"academic" | "fun" | null>(null);

  useEffect(() => {
    const savedMode = (localStorage.getItem("fidel-lab-mode") || "academic") as "academic" | "fun";
    setMode(savedMode);

    const duration = savedMode === "fun" ? 1800 : 1400;
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + step;
        if (nextVal >= 100) {
          clearInterval(timer);
          setTimeout(() => setVisible(false), 200);
          return 100;
        }
        return nextVal;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  if (!visible || mode === null) return null;

  const message = mode === "fun" ? "Compiling linguistic maps..." : "Initializing developer session...";

  return (
    <FidelLoader 
      layout="page" 
      mode={mode} 
      progress={progress} 
      message={message} 
    />
  );
}
