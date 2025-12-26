'use server';

/**
 * @fileOverview An AI agent to review live class sessions and extract key insights.
 *
 * - reviewLiveClass - A function that handles the review process.
 * - ReviewLiveClassInput - The input type for the reviewLiveClass function.
 * - ReviewLiveClassOutput - The return type for the reviewLiveClass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewLiveClassInputSchema = z.object({
  classTranscript: z
    .string()
    .describe('The transcript of the live class session.'),
});
export type ReviewLiveClassInput = z.infer<typeof ReviewLiveClassInputSchema>;

const ReviewLiveClassOutputSchema = z.object({
  summary: z.string().describe('A summary of the live class session.'),
  keyInsights: z
    .string()
    .describe('Key insights extracted from the live class session.'),
  areasForFurtherStudy: z
    .string()
    .describe('Areas identified for further study.'),
});
export type ReviewLiveClassOutput = z.infer<typeof ReviewLiveClassOutputSchema>;

export async function reviewLiveClass(
  input: ReviewLiveClassInput
): Promise<ReviewLiveClassOutput> {
  return reviewLiveClassFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewLiveClassPrompt',
  input: {schema: ReviewLiveClassInputSchema},
  output: {schema: ReviewLiveClassOutputSchema},
  prompt: `You are an AI assistant that reviews live class sessions and extracts key insights and areas for further study for students.

  Please summarize the class, identify the key insights, and suggest areas for further study based on the class transcript provided below.

  Class Transcript:
  {{classTranscript}}`,
});

const reviewLiveClassFlow = ai.defineFlow(
  {
    name: 'reviewLiveClassFlow',
    inputSchema: ReviewLiveClassInputSchema,
    outputSchema: ReviewLiveClassOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
