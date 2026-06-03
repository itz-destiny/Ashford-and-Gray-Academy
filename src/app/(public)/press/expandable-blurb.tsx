"use client";

import { useState } from "react";

/**
 * Renders a book blurb that collapses to its first two paragraphs with a
 * "Read more" / "Read less" toggle. Preserves the parent's text styling
 * (passed via className) including whitespace-pre-line formatting.
 */
export function ExpandableBlurb({ text, className }: { text: string; className?: string }) {
    const [expanded, setExpanded] = useState(false);

    const paragraphs = text.split("\n\n");
    const isLong = paragraphs.length > 2;
    const shown = expanded || !isLong ? text : paragraphs.slice(0, 2).join("\n\n");

    return (
        <div className="space-y-3">
            <p className={className}>
                {shown}
                {isLong && !expanded && " …"}
            </p>
            {isLong && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] hover:text-[#0B1F3A] transition-colors"
                >
                    {expanded ? "Read less" : "Read more"}
                </button>
            )}
        </div>
    );
}
