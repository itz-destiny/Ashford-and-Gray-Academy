"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

type AuthFormProps = {
    title: string;
    description: string;
    children: React.ReactNode;
    footerText?: string;
    footerLinkText?: string;
    onFooterLinkClick?: () => void;
};

export function AuthForm({ title, description, children, footerText, footerLinkText, onFooterLinkClick }: AuthFormProps) {
    const router = useRouter();
    const { toast } = useToast();

    const handleGoogleSignIn = async () => {
        const { user, error } = await signInWithGoogle();
        if (error) {
            console.error("Google sign in failed:", error);
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: error || "Could not complete Google sign-in. Please try again.",
            });
            return;
        }

        if (user) {
            try {
                const idToken = await user.getIdToken();
                const response = await fetch(`/api/users?uid=${user.uid}`, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });

                if (response.ok) {
                    const dbUser = await response.json();
                    if (dbUser.role === 'admin') router.push('/admin');
                    else if (dbUser.role === 'instructor') router.push('/instructor');
                    else if (dbUser.role === 'registrar') router.push('/registrar');
                    else if (dbUser.role === 'course_registrar') router.push('/course-registrar');
                    else if (dbUser.role === 'finance') router.push('/finance');
                    else router.push('/dashboard');
                } else if (response.status === 404) {
                    const params = new URLSearchParams({
                        uid: user.uid,
                        email: user.email || '',
                        displayName: user.displayName || '',
                        photoURL: user.photoURL || ''
                    });
                    router.push(`/login/complete-profile?${params.toString()}`);
                }
            } catch (err) {
                console.error("Error syncing Google user to DB:", err);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[1px] bg-[#C8A96A]" />
                <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Ashford &amp; Gray</span>
            </div>

            <div className="space-y-3 mb-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-[1.1]">{title}</h2>
                <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md">{description}</p>
            </div>

            <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="h-12 w-full rounded-none border border-slate-200 hover:border-[#0B1F3A] hover:bg-white font-black text-[10px] uppercase tracking-[0.3em] text-[#0B1F3A] shadow-none transition-colors"
            >
                <FaGoogle className="mr-3 h-4 w-4 text-[#EA4335]" /> Continue with Google
            </Button>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">
                    <span className="bg-white px-5">Or with credentials</span>
                </div>
            </div>

            {children}

            {footerText && footerLinkText && (
                <div className="mt-10 pt-6 border-t border-slate-100 text-center text-slate-500 font-medium text-sm">
                    {footerText}{" "}
                    <button onClick={onFooterLinkClick} className="text-[#0B1F3A] hover:text-[#C8A96A] font-black uppercase tracking-[0.2em] text-[10px] ml-2 transition-colors border-b border-[#C8A96A] hover:border-[#0B1F3A] pb-0.5">
                        {footerLinkText}
                    </button>
                </div>
            )}
        </div>
    );
}
