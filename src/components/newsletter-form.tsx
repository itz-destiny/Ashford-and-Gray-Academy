"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      toast({
        title: "Subscribed",
        description: "You'll start hearing from us shortly.",
      });
      setEmail("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex mt-4">
      <Input 
        type="email" 
        placeholder="Enter your email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded-r-none text-foreground bg-white" 
      />
      <Button type="submit" variant="secondary" className="rounded-l-none" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
      </Button>
    </form>
  );
}
