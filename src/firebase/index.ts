
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

import { firebaseConfig } from "./config";



export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
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


  return { firebaseApp, auth };
}

export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
} from "./provider";

export { FirebaseClientProvider } from "./client-provider";

export { useUser } from "./auth/use-user";

