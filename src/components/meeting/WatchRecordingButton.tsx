"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Zoom's cloud recordings are passcode-protected, and the share link doesn't
// reliably skip that prompt — so instead of making people hunt for a
// passcode printed somewhere on the page, clicking this copies it straight
// to the clipboard (ready to paste into Zoom's prompt) and opens the
// recording in the same click.
export function WatchRecordingButton({
    recordingUrl,
    passcode,
    className,
    size = "sm",
    variant = "default",
    label = "Watch Recording",
}: {
    recordingUrl: string;
    passcode?: string;
    className?: string;
    size?: "sm" | "default";
    variant?: "default" | "outline";
    label?: string;
}) {
    const { toast } = useToast();

    const handleClick = () => {
        if (passcode) {
            navigator.clipboard?.writeText(passcode).catch(() => {});
            toast({ title: "Passcode copied", description: `Paste ${passcode} if Zoom asks for it.` });
        }
        window.open(recordingUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <Button onClick={handleClick} size={size} variant={variant} className={className}>
            <PlayCircle className="h-4 w-4 mr-1.5" /> {label}
        </Button>
    );
}
