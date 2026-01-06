
"use client";

import { addDoc, collection, serverTimestamp, type Firestore } from "firebase/firestore";

export const enrollInCourse = async (
  firestore: Firestore,
  userId: string,
  courseId: string
) => {
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  try {
    const enrollmentsCollection = collection(firestore, "enrollments");
    await addDoc(enrollmentsCollection, {
      userId,
      courseId,
      enrolledAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    // Here you could re-throw the error or handle it as needed
    throw error;
  }
};
