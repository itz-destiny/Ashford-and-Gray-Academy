"use client";

import { apiFetch } from "@/lib/api-client";

/**
 * Live Proctoring = straight into the exam's Zoom room as host. A tab is
 * opened synchronously inside the click (so popup blockers allow it), then
 * pointed at a fresh Zoom start link once the server returns it.
 * Returns an error message, or null on success.
 */
export async function openExamRoomInZoom(liveClassId: string): Promise<string | null> {
    const tab = typeof window !== "undefined" ? window.open("", "_blank") : null;
    try {
        const res = await apiFetch(`/api/live-classes/${liveClassId}/start-url`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.startUrl) throw new Error(data.error || "Could not open the Zoom exam room.");
        if (tab && !tab.closed) tab.location.href = data.startUrl;
        else window.location.href = data.startUrl;
        return null;
    } catch (err: any) {
        if (tab && !tab.closed) tab.close();
        return err?.message || "Could not open the Zoom exam room.";
    }
}
