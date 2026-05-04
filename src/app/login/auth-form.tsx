
"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
                const response = await fetch(`/api/users?uid=${user.uid}`);
                
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
            <div className="space-y-4 mb-12 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight">{title}</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">{description}</p>
            </div>
            
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline" onClick={handleGoogleSignIn} className="h-16 rounded-full border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest w-full shadow-sm hover:shadow-md transition-all text-[#0B1F3A]">
                        <FaGoogle className="mr-3 h-4 w-4 text-[#EA4335]" /> Continue with Google
                    </Button>
                </div>
                
                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                        <span className="bg-white px-6">Institutional Credential</span>
                    </div>
                </div>

                {children}

                {footerText && footerLinkText && (
                    <div className="mt-12 text-center text-slate-500 font-medium pb-10 text-sm">
                        {footerText}{" "}
                        <button onClick={onFooterLinkClick} className="text-[#1F7A5A] hover:text-[#0B1F3A] font-black uppercase tracking-widest ml-2 transition-colors">
                            {footerLinkText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
