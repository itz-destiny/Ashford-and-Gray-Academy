
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { firebaseConfig } from "./config";

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
    if (!auth.config.authDomain) {
      auth.config.authDomain = "localhost";
    }
  }

  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
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
