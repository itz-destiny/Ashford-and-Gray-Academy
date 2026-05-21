import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type Search = Promise<{ status?: string; reason?: string }>;

const REASON_COPY: Record<string, string> = {
    expired: "This unsubscribe link has expired. Request a fresh one below.",
    invalid: "We couldn't verify this unsubscribe link. Request a fresh one below.",
    missing: "The unsubscribe link was missing required information.",
};

export default async function NewsletterUnsubscribedPage({ searchParams }: { searchParams: Search }) {
    const sp = await searchParams;
    const ok = sp.status === "ok";

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
            <div className="max-w-xl w-full text-center space-y-8">
                <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center ${ok ? "bg-slate-100" : "bg-rose-50"}`}>
                    {ok ? <CheckCircle2 className="w-10 h-10 text-slate-600" /> : <AlertTriangle className="w-10 h-10 text-rose-600" />}
                </div>
                <div className="space-y-3">
                    <h1 className="text-4xl font-serif text-[#0B1F3A]">
                        {ok ? "You've been unsubscribed" : "We couldn't process that link"}
                    </h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                        {ok
                            ? "We're sorry to see you go. You will not receive any further newsletter dispatches from Ashford & Gray. You may resubscribe at any time."
                            : REASON_COPY[sp.reason ?? ""] ?? "Please request a fresh unsubscribe link."}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[#0B1F3A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#0B1F3A]/90 transition-colors"
                    >
                        Return home
                    </Link>
                    {!ok && (
                        <Link
                            href="/unsubscribe"
                            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full border-2 border-[#0B1F3A] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#0B1F3A] hover:text-white transition-colors"
                        >
                            Request new link
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
