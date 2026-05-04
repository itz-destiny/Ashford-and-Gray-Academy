
"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

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

    const handleGoogleSignIn = async () => {
        const { user, error } = await signInWithGoogle();
        if (error) {
            console.error("Google sign in failed:", error);
            return;
        }

        if (user) {
            try {
                // Register user in MongoDB if not exists, default to student role
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || user.email?.split('@')[0],
                        role: 'student'
                    })
                });
                
                router.push('/dashboard');
            } catch (err) {
                console.error("Error syncing Google user to DB:", err);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="space-y-3 mb-10 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tighter">{title}</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">{description}</p>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline" onClick={handleGoogleSignIn} className="h-14 rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-base w-full shadow-sm hover:shadow transition-all text-slate-700">
                        <FaGoogle className="mr-3 h-5 w-5 text-red-500" /> Continue with Google
                    </Button>
                </div>
                
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400">
                        <span className="bg-white px-4">Or continue with email</span>
                    </div>
                </div>

                {children}

                {footerText && footerLinkText && (
                    <div className="mt-10 text-center text-slate-500 font-medium pb-10">
                        {footerText}{" "}
                        <button onClick={onFooterLinkClick} className="text-indigo-600 hover:text-indigo-700 font-black hover:underline transition-colors">
                            {footerLinkText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
