import { Logo } from "@/components/logo";
import { BrandPanel } from "./brand-panel";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] bg-white">
            <BrandPanel />
            <main className="flex items-start lg:items-center justify-center px-6 sm:px-12 py-12 lg:py-16 bg-white overflow-y-auto max-h-screen">
                <div className="w-full max-w-[520px]">
                    <div className="lg:hidden mb-10 flex justify-center">
                        <Logo className="text-slate-950 w-48" />
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
