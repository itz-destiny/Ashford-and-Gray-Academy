
"use client";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { initializeFirebase } from ".";

const { app, auth, firestore } = initializeFirebase();

const googleProvider = new GoogleAuthProvider();

// Function to create or update user profile in Firestore
const updateUserProfileInFirestore = async (user: any, additionalData: any = {}) => {
  if (!user) return;

  const userRef = doc(firestore, `users/${user.uid}`);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();
    try {
      // Ensure role is explicitly set, default to 'student' if not provided
      const role = additionalData.role || 'student';
      await setDoc(userRef, {
        name: displayName || additionalData.name, // Use name from form if available
        email,
        photoURL,
        createdAt,
        ...additionalData,
        role, // Make sure role is saved
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
};

// Sign up with Email and Password
export const signUpWithEmail = async (email, password, additionalData) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update Firebase Auth profile
    await updateProfile(user, { displayName: additionalData.name });

    // Create user document in Firestore
    await updateUserProfileInFirestore(user, { ...additionalData });
    
    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

// Sign in with Email and Password
export const signInWithEmail = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
     const userDocRef = doc(firestore, `users/${user.uid}`);
     const userDoc = await getDoc(userDocRef);
     if (userDoc.exists()) {
        return { user: { ...user, ...userDoc.data() } };
     }
    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

// Sign in/up with Google
export const signInWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    // For Google sign-in, we can default the role to 'student'
    // or you can create a UI to ask for role after they sign up.
    await updateUserProfileInFirestore(user, { role: 'student' });

    const userDocRef = doc(firestore, `users/${user.uid}`);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { ...user, ...userDoc.data() };
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return null;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
