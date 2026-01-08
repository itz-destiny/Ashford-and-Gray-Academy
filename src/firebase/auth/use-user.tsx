
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
          // Sync user to MongoDB
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            })
          });

          let userData = {};
          if (res.ok) {
            userData = await res.json();
          }

          const appUser: AppUser = {
            ...firebaseUser,
            ...userData,
            role: (userData as any).role || 'student'
          };

          setUser(appUser);

          const isAuthPage = pathname.startsWith('/login');
          if (isAuthPage) {
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
