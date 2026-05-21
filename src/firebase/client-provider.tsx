"use client";

import { useEffect, useState } from "react";

import { FirebaseProvider, type FirebaseServices } from "@/firebase/provider";
import { initializeFirebase } from ".";

type FirebaseClientProviderProps = {
    children: React.ReactNode;
};

type State =
    | { kind: "loading" }
    | { kind: "ready"; services: FirebaseServices }
    | { kind: "error"; message: string };

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
    const [state, setState] = useState<State>({ kind: "loading" });

    useEffect(() => {
        try {
            const services = initializeFirebase();
            setState({ kind: "ready", services });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to initialise Firebase.";
            // Surface the failure in the browser console so the cause shows up
            // in dev tools and Sentry.
            console.error("FirebaseClientProvider: initialisation failed.", err);
            setState({ kind: "error", message });
        }
    }, []);

    if (state.kind === "loading") {
        // Minimal SSR-safe loading splash. No Tailwind classes here — keeps
        // this independent of styling failures and avoids hydration drift.
        return (
            <div
                style={{
                    display: "flex",
                    minHeight: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0B1F3A",
                    color: "#C8A96A",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                }}
            >
                Loading
            </div>
        );
    }

    if (state.kind === "error") {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#0B1F3A",
                    color: "white",
                    padding: "48px 24px",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                <div style={{ maxWidth: 640, margin: "0 auto" }}>
                    <h1 style={{ fontSize: 28, marginBottom: 16 }}>
                        The app failed to start
                    </h1>
                    <p style={{ color: "#94a3b8", lineHeight: 1.6, marginBottom: 24 }}>
                        Firebase could not initialise. The most common cause is missing or
                        invalid <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables.
                        Check <code>.env.local</code> (in dev) or the Vercel env settings
                        (in production) and restart the server.
                    </p>
                    <pre
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fca5a5",
                            padding: 16,
                            borderRadius: 8,
                            fontSize: 13,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {state.message}
                    </pre>
                </div>
            </div>
        );
    }

    return <FirebaseProvider {...state.services}>{children}</FirebaseProvider>;
}
