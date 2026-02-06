
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
      if (firebaseUser) {
        try {
          // Fetch user profile from MongoDB
          let userData: any = {};
          try {
            const res = await fetch(`/api/users?uid=${firebaseUser.uid}`);
            if (res.ok) {
              userData = await res.json();
            }
          } catch (err) {
            console.error("Failed to fetch user profile", err);
          }

          const appUser: AppUser = {
            ...firebaseUser,
            ...userData,
            role: userData.role // Ensure we use the role from MongoDB
          };

          console.log("useUser: Profile status:", userData.role ? `Found role: ${userData.role}` : "No profile in DB");

          setUser(appUser);

          const isAuthPage = pathname.startsWith('/login');
          if (isAuthPage && appUser.role) {
            console.log("useUser: Role found, redirecting to:", appUser.role);
            if (appUser.role === 'instructor') {
              router.push('/instructor');
            } else if (appUser.role === 'admin') {
              router.push('/admin');
            } else if (appUser.role === 'registrar') {
              router.push('/registrar');
            } else if (appUser.role === 'course_registrar') {
              router.push('/course-registrar');
            } else if (appUser.role === 'finance') {
              router.push('/finance');
            } else if (appUser.role === 'student') {
              router.push('/dashboard');
            }
          } else if (isAuthPage && !appUser.role) {
            console.warn("useUser: Authenticated but no role found in DB. Waiting for profile sync...");
            // Do not redirect, let the user stay on the auth page or wait for a subsequent sync
          }

        } catch (error) {
          console.error("Error creating/fetching user:", error);
          setUser(firebaseUser as AppUser);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, router, pathname]);

  return { user, loading };
};
