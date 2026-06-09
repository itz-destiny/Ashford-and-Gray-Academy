"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";

/**
 * Maps an application role to the route the user belongs in. Used to bounce
 * unauthorized callers back to their own portal instead of trapping them on a
 * page they can't see.
 */
const PORTAL_BY_ROLE: Record<string, string> = {
    admin: "/admin",
    registrar: "/registrar",
    course_registrar: "/course-registrar",
    finance: "/finance",
    instructor: "/instructor",
    student: "/dashboard",
};

type RoleGuardProps = {
    /** Roles permitted on this route (strict — admins do NOT get implicit access). */
    allowed: ReadonlyArray<keyof typeof PORTAL_BY_ROLE>;
    children: React.ReactNode;
};

/**
 * Client-side authorization gate. Renders a small splash while the user
 * profile is loading, then either:
 *   - renders children if `user.role ∈ allowed`,
 *   - redirects to `/login` if signed-out, or
 *   - redirects to the user's own portal if signed in with a different role.
 *
 * The server-side API routes are independently protected — this guard exists
 * so the UI shell doesn't render for someone who can't use it.
 */
export function RoleGuard({ allowed, children }: RoleGuardProps) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const userRole = user?.role as keyof typeof PORTAL_BY_ROLE | undefined;
    const isAuthorized = !!userRole && allowed.includes(userRole);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            const redirectUrl = encodeURIComponent(pathname || "/");
            router.replace(`/login?redirectUrl=${redirectUrl}`);
            return;
        }
        if (!userRole) {
            // Authenticated with Firebase but no Mongo profile — complete signup.
            router.replace("/login/complete-profile");
            return;
        }
        if (!isAuthorized) {
            router.replace(PORTAL_BY_ROLE[userRole] ?? "/dashboard");
        }
    }, [loading, user, userRole, isAuthorized, pathname, router]);

    if (loading || !user || !isAuthorized) {
        return <RoleGuardSplash />;
    }

    return <>{children}</>;
}

function RoleGuardSplash() {
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
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                }}
            >
                Verifying access…
            </span>
        </div>
    );
}
