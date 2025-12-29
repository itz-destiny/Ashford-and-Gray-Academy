
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';

import { useAuth, useFirestore } from "@/firebase/provider";

export interface AppUser extends User {
  role?: string;
  // You can add any other custom user properties here
}

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, `users/${firebaseUser.uid}`);
        const userDoc = await getDoc(userDocRef);

        let appUser: AppUser;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          appUser = {
            ...firebaseUser,
            role: userData.role,
            ...userData,
          };
          setUser(appUser);
          
          // Redirect based on role
          if (userData.role === 'instructor') {
            router.push('/instructor');
          } else {
            router.push('/dashboard');
          }

        } else {
          // This case might happen if the user document wasn't created properly
          // or for users who authenticated before the profile creation logic was in place.
          appUser = firebaseUser as AppUser;
          setUser(appUser);
          // Default redirect for users without a specific role doc
          router.push('/dashboard');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, router]);

  return { user, loading };
};
