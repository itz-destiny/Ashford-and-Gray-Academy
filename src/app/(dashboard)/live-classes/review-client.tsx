"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generateReview } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { mockLiveClassTranscript } from "@/lib/data";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate Review
    </Button>
  );
}

export function LiveClassReviewer() {
  const initialState = { message: "", data: undefined, errors: undefined };
  const [state, dispatch] = useFormState(generateReview, initialState);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form action={dispatch}>
        <Card>
          <CardHeader>
            <CardTitle>Generate AI Review</CardTitle>
            <CardDescription>
              Paste a class transcript below to get a summary, key insights, and areas for further study.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="transcript"
              placeholder="Enter class transcript here..."
              className="min-h-[300px] font-mono text-sm"
              defaultValue={mockLiveClassTranscript}
            />
            {state.errors?.transcript &&
              state.errors.transcript.map((error: string) => (
                <p className="text-sm font-medium text-destructive mt-2" key={error}>
                  {error}
                </p>
              ))}
          </CardContent>
          <CardFooter className="justify-between">
            <SubmitButton />
            {state.message === "Success" && !state.errors && (
                <p className="text-sm text-green-600">Review generated successfully!</p>
            )}
             {state.message && state.message !== "Success" && (
                <p className="text-sm text-destructive">{state.message}</p>
            )}
          </CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Results will appear here after generation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {state.data ? (
            <>
              <div>
                <h3 className="font-semibold font-headline text-lg mb-2">Summary</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{state.data.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold font-headline text-lg mb-2">Key Insights</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{state.data.keyInsights}</p>
              </div>
              <div>
                <h3 className="font-semibold font-headline text-lg mb-2">Areas for Further Study</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{state.data.areasForFurtherStudy}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-muted/50 rounded-lg p-8">
              <Sparkles className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Your AI review will be displayed here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
