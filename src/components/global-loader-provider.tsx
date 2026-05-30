"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

/**
 * Premium Global Splash Loader — pure CSS animations.
 * No framer-motion import: keeps it out of the root layout chunk.
 */
export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Keyframe definitions */}
      <style>{`
        @keyframes ag-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.99); }
          50%       { opacity: 1;   transform: scale(1);    }
        }
        @keyframes ag-sweep {
          0%   { left: -55%; }
          100% { left: 110%; }
        }
        @keyframes ag-fadein-text {
          from { opacity: 0; }
          to   { opacity: 0.4; }
        }
        @keyframes ag-fadeout {
          0%   { opacity: 1; pointer-events: auto; }
          85%  { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        @keyframes ag-content-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .ag-loader {
          animation: ag-fadeout 0.6s ease 1.55s forwards;
        }
        .ag-logo {
          animation: ag-pulse 2.2s ease-in-out infinite;
        }
        .ag-sweep {
          animation: ag-sweep 2s ease-in-out infinite;
        }
        .ag-caption {
          animation: ag-fadein-text 0.8s ease 0.3s forwards;
          opacity: 0;
        }
        .ag-content {
          animation: ag-content-in 0.8s ease 1.6s forwards;
          opacity: 0;
        }
      `}</style>

      {/* Splash overlay — only rendered client-side to avoid SSR mismatch */}
      {mounted && visible && (
        <div
          className="ag-loader fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0B1F3A" }}
        >
          {/* Gold radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.2 }}
          >
            <div
              className="absolute"
              style={{
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 500, height: 500,
                background: "#C8A96A",
                borderRadius: "50%",
                filter: "blur(160px)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center" style={{ gap: 32, maxWidth: 400, padding: "0 24px" }}>
            {/* Logo pulse */}
            <div
              className="ag-logo relative"
              style={{ width: 288, height: 80 }}
            >
              <Image
                src="/A & G2.png"
                alt="Ashford & Gray Academy"
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Sweeping gold progress bar */}
            <div
              style={{
                width: 208,
                height: 1,
                background: "rgba(255,255,255,0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                className="ag-sweep absolute top-0 bottom-0"
                style={{
                  width: "55%",
                  background: "linear-gradient(to right, transparent, #C8A96A, transparent)",
                }}
              />
            </div>

            {/* Caption */}
            <p
              className="ag-caption text-center"
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#FAF9F6",
              }}
            >
              Verifying Institutional Registry
            </p>
          </div>
        </div>
      )}

      {/* Page content fades in */}
      <div className="ag-content">
        {children}
      </div>
    </>
  );
}

