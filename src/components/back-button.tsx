"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back button on homepage
  if (pathname === "/") {
    return null;
  }

  return (
    <Button 
      variant="ghost" 
      onClick={() => router.back()}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
}
