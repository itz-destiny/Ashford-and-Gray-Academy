"use server";

import { reviewLiveClass } from "@/ai/flows/review-live-class";
import { z } from "zod";

const reviewSchema = z.object({
  transcript: z.string().min(1, "Transcript cannot be empty."),
});

type ReviewState = {
  data?: {
    summary: string;
    keyInsights: string;
    areasForFurtherStudy: string;
  };
  message: string;
  errors?: {
    transcript?: string[];
  }
};

export async function generateReview(
  prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {

  const validatedFields = reviewSchema.safeParse({
    transcript: formData.get("transcript"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await reviewLiveClass({
      classTranscript: validatedFields.data.transcript,
    });
    return { data: result, message: "Success" };
  } catch (error) {
    console.error(error);
    return { message: "An error occurred while generating the review." };
  }
}
