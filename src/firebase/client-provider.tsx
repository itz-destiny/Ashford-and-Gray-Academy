"use client";

import { useEffect, useState } from "react";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

import { FirebaseProvider, type FirebaseServices } from "@/firebase/provider";
import { initializeFirebase } from ".";

type FirebaseClientProviderProps = {
  children: React.ReactNode;
};

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] =
    useState<FirebaseServices | null>(null);

  useEffect(() => {
    const services = initializeFirebase();
    setFirebaseServices(services);
  }, []);

  if (!firebaseServices) {
    // You can render a loading spinner here
    return null;
  }

  return <FirebaseProvider {...firebaseServices}>{children}</FirebaseProvider>;
}
