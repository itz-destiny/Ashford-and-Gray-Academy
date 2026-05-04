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
      // Simulate API call for newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Subscribed successfully!",
        description: "You have been added to our newsletter. Check your email for confirmation.",
      });
      setEmail("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: "There was an error trying to subscribe. Please try again.",
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
