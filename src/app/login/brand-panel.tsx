import Image from "next/image";
import { Logo } from "@/components/logo";

/**
 * Left-rail brand panel shared by every /login/* page. Editorial navy
 * surface with hero photo + founder quote — kept light on chrome to stay
 * consistent with the rest of the academy site.
 */
export function BrandPanel() {
    return (
        <aside className="relative hidden lg:flex flex-col bg-[#0B1F3A] text-white overflow-hidden">
            <div className="absolute inset-0">
                <Image
                    src="/cohort-global-vision.jpg"
                    alt=""
                    fill
                    priority
                    className="object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A]/85 to-[#0B1F3A]/95" />
            </div>

            <div className="relative z-10 p-12 lg:p-16 flex flex-col h-full">
                <Logo variant="white" />

                <div className="flex-1 flex flex-col justify-center max-w-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-[1px] bg-[#C8A96A]" />
                        <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">The Institution</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif tracking-tight leading-[1.05]">
                        The Portal to <br />
                        <span className="text-[#C8A96A]">Excellence.</span>
                    </h1>
                    <p className="mt-8 text-base lg:text-lg text-white/65 font-medium max-w-md leading-relaxed">
                        Where excellence is refined and leaders are distinct. Step into Ashford &amp; Gray Fusion Academy.
                    </p>

                    <blockquote className="mt-16 max-w-md border-l-2 border-[#C8A96A] pl-6">
                        <p className="font-serif text-lg lg:text-xl text-white leading-relaxed">
                            True luxury is not excess — it is precision, discipline, and excellence expressed effortlessly.
                        </p>
                        <footer className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">
                            Myne Wilfred · Founder/President
                        </footer>
                    </blockquote>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                    &copy; {new Date().getFullYear()} Ashford &amp; Gray Academy
                </p>
            </div>
        </aside>
    );
}
