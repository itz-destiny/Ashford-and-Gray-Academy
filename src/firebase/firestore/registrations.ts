
"use client";

import { addDoc, collection, serverTimestamp, type Firestore } from "firebase/firestore";

export const registerForEvent = async (
  firestore: Firestore,
  userId: string,
  eventId: string
) => {
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  try {
    const registrationsCollection = collection(firestore, "registrations");
    await addDoc(registrationsCollection, {
      userId,
      eventId,
      registeredAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    throw error;
  }
};
