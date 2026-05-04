
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter, usePathname } from 'next/navigation';

import { useAuth } from "@/firebase/provider";

export interface AppUser extends User {
  role?: string;
  // You can add any other custom user properties here
}

export const useUser = () => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("useUser: onAuthStateChanged fired. User:", firebaseUser ? firebaseUser.uid : "None");

      if (firebaseUser) {
        try {
          setLoading(true);
          // Fetch user profile from MongoDB
          let userData: any = {};
          try {
            console.log("useUser: Fetching MongoDB profile for:", firebaseUser.uid);
            let res = await fetch(`/api/users?uid=${firebaseUser.uid}`);
            if (res.ok) {
              userData = await res.json();
              console.log("useUser: MongoDB profile found:", userData.role || "No role");
            } else if (res.status === 404) {
              console.log("useUser: MongoDB profile not found.");
              // We do NOT auto-create here anymore to allow the login flow to handle it
              // especially for Google sign-in which needs profile completion.
            } else {
              console.warn("useUser: MongoDB profile fetch failed. Status:", res.status);
            }
          } catch (err) {
            console.error("useUser: Failed to fetch user profile", err);
          }

          const appUser: AppUser = {
            ...firebaseUser,
            ...userData,
            role: userData.role
          };

          setUser(appUser);
          console.log("useUser: Final user state set.");

          // Redirections logic
          const isLoginPage = pathname === '/login';
          const isCompleteProfilePage = pathname === '/login/complete-profile';
          
          if (isLoginPage) {
            if (appUser.role) {
                // If they have a role, they are fully registered
                router.push(getDashboardByRole(appUser.role));
            } else {
                // If they have no role in DB, they need to complete their profile
                const params = new URLSearchParams({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || '',
                    photoURL: firebaseUser.photoURL || ''
                });
                router.push(`/login/complete-profile?${params.toString()}`);
            }
          }

        } catch (error) {
          console.error("useUser: Error in auth processing:", error);
          setUser(firebaseUser as AppUser);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("useUser: No Firebase user, clearing state.");
        setUser(null);
        setLoading(false);
      }
    });

    function getDashboardByRole(role: string) {
      const routes: Record<string, string> = {
        instructor: '/instructor',
        admin: '/admin',
        registrar: '/registrar',
        course_registrar: '/course-registrar',
        finance: '/finance',
        student: '/dashboard'
      };
      return routes[role] || '/dashboard';
    }

    return () => unsubscribeAuth();
  }, [auth, router, pathname]);

  return { user, loading };
};
