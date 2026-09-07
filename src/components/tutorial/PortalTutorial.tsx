"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";

export type TourStep = Step;

// Replay entry point used by every portal's "Replay Tutorial" sidebar link:
// `{portalHome}?tour=1`. Kept as a named export so sidebars don't hardcode
// the query string shape.
export const TOUR_QUERY_PARAM = "tour";

/**
 * Renders the guided walkthrough for one portal. Auto-starts once per user
 * (persisted server-side via `hasSeenTutorial`, not localStorage, so it
 * follows them across devices) and can be re-triggered any time by visiting
 * the portal's home route with `?tour=1`.
 */
export function PortalTutorial({ steps }: { steps: TourStep[] }) {
    return (
        <Suspense fallback={null}>
            <PortalTutorialInner steps={steps} />
        </Suspense>
    );
}

function PortalTutorialInner({ steps }: { steps: TourStep[] }) {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [run, setRun] = useState(false);

    const forcedReplay = searchParams.get(TOUR_QUERY_PARAM) === "1";

    useEffect(() => {
        if (userLoading || !user) return;
        if (forcedReplay || !user.hasSeenTutorial) {
            // Let the portal's own layout/sidebar finish mounting before
            // Joyride tries to measure target elements.
            const t = setTimeout(() => setRun(true), 300);
            return () => clearTimeout(t);
        }
    }, [userLoading, user, forcedReplay]);

    const markSeen = useCallback(() => {
        if (!user?.uid || !user?.email) return;
        apiFetch('/api/users', {
            method: 'POST',
            body: JSON.stringify({ uid: user.uid, email: user.email, hasSeenTutorial: true }),
        }).catch(() => null);
    }, [user]);

    const handleEvent = useCallback((data: EventData) => {
        if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
            setRun(false);
            markSeen();
            if (forcedReplay) {
                router.replace(pathname);
            }
        }
    }, [markSeen, forcedReplay, router, pathname]);

    if (userLoading || !user) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            scrollToFirstStep
            onEvent={handleEvent}
            locale={{ last: 'Done' }}
            options={{
                buttons: ['back', 'skip', 'primary'],
                showProgress: true,
                primaryColor: '#0B1F3A',
                textColor: '#0B1F3A',
                zIndex: 10000,
            }}
            styles={{
                buttonPrimary: { backgroundColor: '#0B1F3A', borderRadius: 0, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' },
                buttonBack: { color: '#0B1F3A' },
                buttonSkip: { color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' },
                tooltip: { borderRadius: 0 },
                tooltipTitle: { fontFamily: 'serif', fontSize: 20, color: '#0B1F3A' },
            }}
        />
    );
}
