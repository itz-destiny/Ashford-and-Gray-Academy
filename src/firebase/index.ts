
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";

import { firebaseConfig } from "./config";
import { useCollection } from "./firestore/use-collection";
import { useDoc } from "./firestore/use-doc";


let firestoreInstance: Firestore | null = null;

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const appName = "default";
  let firebaseApp;
  if (!getApps().some(app => app.name === appName)) {
    firebaseApp = initializeApp(firebaseConfig, appName);
  } else {
    firebaseApp = getApp(appName);
  }
  
  const auth = getAuth(firebaseApp);
  // This is a workaround for the "auth/unauthorized-domain" error
  // which can occur in some development environments.
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    auth.tenantId = null;
    auth.useDeviceLanguage();
    // Directly setting the authDomain on the config is not the recommended path
    // The previous attempts were not effective. The primary fix remains ensuring
    // 'localhost' is in the Firebase Console's authorized domains list.
    // The code above helps reset any cached state that might interfere.
  }

  if (!firestoreInstance) {
    const db = getFirestore(firebaseApp);
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firestore persistence failed: multiple tabs open.');
      } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        console.warn('Firestore persistence not available in this browser.');
      }
    });
    firestoreInstance = db;
  }
  
  return { firebaseApp, auth, firestore: firestoreInstance };
}

export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from "./provider";

export { FirebaseClientProvider } from "./client-provider";

export { useUser } from "./auth/use-user";

export { useCollection, useDoc };
