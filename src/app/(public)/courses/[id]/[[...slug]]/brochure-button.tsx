"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileDown, Loader2, Lock } from "lucide-react";

type Props = {
    courseId: string;
    courseTitle: string;
};

/**
 * Auth-gated brochure download. Unauthenticated visitors see a sign-in CTA;
 * signed-in users get an immediate PDF download.
 */
export function BrochureButton({ courseId, courseTitle }: Props) {
    const { user, loading } = useUser();
    const [downloading, setDownloading] = useState(false);
    const { toast } = useToast();

    if (loading) {
        return (
            <Button disabled className="h-14 px-8 bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] rounded-none border-none w-full">
                <Loader2 className="mr-3 h-4 w-4 animate-spin" /> Preparing…
            </Button>
        );
    }

    if (!user) {
        const redirect = encodeURIComponent(`/courses/${courseId}`);
        return (
            <Button
                asChild
                variant="outline"
                className="h-14 px-8 border-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-none w-full transition-colors"
            >
                <Link href={`/login?view=signup&redirectUrl=${redirect}`}>
                    <Lock className="mr-3 h-4 w-4" />
                    Sign in to download brochure
                </Link>
            </Button>
        );
    }

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await apiFetch(`/api/courses/${courseId}/brochure`);
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as { error?: string }));
                throw new Error(body.error || `Download failed (HTTP ${res.status})`);
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const filename = `${courseTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-brochure.pdf`;

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            toast({ title: "Brochure downloaded", description: "Check your downloads folder." });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Could not download the brochure.";
            toast({ variant: "destructive", title: "Download failed", description: message });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={downloading}
            className="h-14 px-8 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-none border-none w-full transition-colors"
        >
            {downloading ? (
                <>
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" /> Downloading…
                </>
            ) : (
                <>
                    <FileDown className="mr-3 h-4 w-4" />
                    Download Programme Brochure
                </>
            )}
        </Button>
    );
}
