
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useRouter, usePathname } from 'next/navigation';

import { useAuth, useFirestore } from "@/firebase/provider";

export interface AppUser extends User {
  role?: string;
  // You can add any other custom user properties here
}

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, `users/${firebaseUser.uid}`);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const appUser: AppUser = {
              ...firebaseUser,
              role: userData.role,
              ...userData,
            };
            setUser(appUser);

            const isAuthPage = pathname.startsWith('/login');
            if (isAuthPage) {
               if (userData.role === 'instructor') {
                router.push('/instructor');
              } else {
                router.push('/dashboard');
              }
            }

          } else {
            // Document doesn't exist yet, might be in the process of being created
            // We set the basic user and wait for the document to be created.
            setUser(firebaseUser as AppUser);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user document:", error);
          // Set basic user info even if Firestore doc fails
          setUser(firebaseUser as AppUser);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore, router, pathname]);

  return { user, loading };
};
