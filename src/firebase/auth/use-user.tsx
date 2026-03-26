
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
              // Auto-create user in MongoDB if not found
              console.log("useUser: MongoDB profile not found, creating...");
              await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || firebaseUser.email,
                  photoURL: firebaseUser.photoURL,
                  // Optionally set default role here if needed
                })
              });
              // Fetch again after creation
              res = await fetch(`/api/users?uid=${firebaseUser.uid}`);
              if (res.ok) {
                userData = await res.json();
              }
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
          const isAuthPage = pathname.startsWith('/login');
          if (isAuthPage && appUser.role) {
            router.push(getDashboardByRole(appUser.role));
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
