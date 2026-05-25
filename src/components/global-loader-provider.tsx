"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Premium Global Splash Loader Provider to wow users on hard refreshes
 */
export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show splash screen for exactly 1.8s to establish the high-end brand identity
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="fixed inset-0 bg-[#0B1F3A] flex flex-col items-center justify-center z-[99999] overflow-hidden"
          >
            {/* Soft gold backdrop radial glow */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C8A96A] rounded-full blur-[160px]" />
            </div>

            <div className="relative flex flex-col items-center space-y-8 z-10 max-w-xs md:max-w-md px-6">
              {/* Logo breathing pulse */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ 
                  opacity: [0.6, 1, 0.6], 
                  scale: [0.99, 1, 0.99] 
                }}
                transition={{
                  opacity: {
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "easeInOut"
                  },
                  scale: {
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "easeInOut"
                  },
                  initial: { duration: 0.8, ease: "easeOut" }
                }}
                className="relative h-20 w-72 md:h-24 md:w-80"
              >
                <Image
                  src="/A & G2.png"
                  alt="Ashford & Gray Fusion Academy"
                  fill
                  priority
                  className="object-contain"
                />
              </motion.div>

              {/* Progress bar sweeping */}
              <div className="w-52 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.0,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent"
                />
              </div>

              {/* Verification subtext */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FAF9F6] text-center"
              >
                Verifying Institutional Registry
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main site layout content fades in beautifully */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
