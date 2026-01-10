
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
            // Do NOT default to student if role is missing. 
            // If missing, it means profile isn't synced yet (signup race condition).
            role: userData.role
          };

          setUser(appUser);

          const isAuthPage = pathname.startsWith('/login');
          if (isAuthPage && appUser.role) {
            // Only redirect if we effectively know the role
            if (appUser.role === 'instructor') {
              router.push('/instructor');
            } else if (appUser.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
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
