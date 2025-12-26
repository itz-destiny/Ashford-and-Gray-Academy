'use server';
/**
 * @fileOverview An AI agent that summarizes live class sessions.
 *
 * - summarizeLiveClass - A function that handles the summarization process.
 * - SummarizeLiveClassInput - The input type for the summarizeLiveClass function.
 * - SummarizeLiveClassOutput - The return type for the summarizeLiveClass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLiveClassInputSchema = z.object({
  liveClassTranscript: z
    .string()
    .describe('The transcript of the live class session.'),
});
export type SummarizeLiveClassInput = z.infer<typeof SummarizeLiveClassInputSchema>;

const SummarizeLiveClassOutputSchema = z.object({
  summary: z.string().describe('The summary of the live class session.'),
});
export type SummarizeLiveClassOutput = z.infer<typeof SummarizeLiveClassOutputSchema>;

export async function summarizeLiveClass(input: SummarizeLiveClassInput): Promise<SummarizeLiveClassOutput> {
  return summarizeLiveClassFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLiveClassPrompt',
  input: {schema: SummarizeLiveClassInputSchema},
  output: {schema: SummarizeLiveClassOutputSchema},
  prompt: `You are an AI assistant designed to summarize live class sessions for students.

  Please provide a concise and informative summary of the following live class transcript:

  Transcript:
  {{liveClassTranscript}}
  `,
});

const summarizeLiveClassFlow = ai.defineFlow(
  {
    name: 'summarizeLiveClassFlow',
    inputSchema: SummarizeLiveClassInputSchema,
    outputSchema: SummarizeLiveClassOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
