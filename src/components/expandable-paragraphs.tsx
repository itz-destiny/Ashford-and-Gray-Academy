"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExpandableParagraphs({
    paragraphs,
    previewCount = 1,
    className,
}: {
    paragraphs: string[];
    previewCount?: number;
    className?: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const preview = paragraphs.slice(0, previewCount);
    const rest = paragraphs.slice(previewCount);

    return (
        <div className={className}>
            {preview.map((p, i) => (
                <p key={`preview-${i}`}>{p}</p>
            ))}

            {rest.length > 0 && (
                <div
                    className={cn(
                        "grid transition-all duration-500 ease-in-out",
                        expanded ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden space-y-6">
                        {rest.map((p, i) => (
                            <p key={`rest-${i}`}>{p}</p>
                        ))}
                    </div>
                </div>
            )}

            {rest.length > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] hover:text-[#1F7A5A] transition-colors"
                >
                    {expanded ? "See Less" : "See More"}
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", expanded && "rotate-180")} />
                </button>
            )}
        </div>
    );
}
