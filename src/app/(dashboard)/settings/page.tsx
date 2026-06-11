"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/account/settings");
  }, [router]);

  return (
    <div className="flex justify-center p-20">
      <span className="text-[11px] font-black tracking-[0.3em] text-[#C8A96A] uppercase">Redirecting to Settings…</span>
    </div>
  );
}
