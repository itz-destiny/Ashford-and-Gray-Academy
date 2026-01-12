"use client";

import { createContext, useContext } from "react";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";

export type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  storage: FirebaseStorage;
};

const FirebaseContext = createContext<FirebaseServices | null>(null);

export const FirebaseProvider = ({
  children,
  ...services
}: { children: React.ReactNode } & FirebaseServices) => {
  return (
    <FirebaseContext.Provider value={services}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useAuth = () => useFirebase().auth;
export const useStorage = () => useFirebase().storage;
