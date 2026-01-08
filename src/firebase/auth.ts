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
import { initializeFirebase } from ".";

const { app, auth } = initializeFirebase();

const googleProvider = new GoogleAuthProvider();

// Sign up with Email and Password
export const signUpWithEmail = async (email, password, additionalData) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: additionalData.name });

    // Note: additionalData (role, etc.) must be saved to DB by the caller

    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

// Sign in with Email and Password
export const signInWithEmail = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

// Sign in/up with Google
export const signInWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
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
