
"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle } from "@/firebase/auth/auth";
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
        const user = await signInWithGoogle();
        if (user) {
            router.push('/dashboard');
        }
    };

    return (
        <>
            <CardHeader className="text-left">
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {children}
                <div className="relative my-6">
                    <Separator />
                    <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">
                        OR CONTINUE WITH
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline" onClick={handleGoogleSignIn}>
                        <FaGoogle className="mr-2 h-4 w-4" /> Google
                    </Button>
                </div>
                 {footerText && footerLinkText && (
                    <div className="mt-6 text-center text-sm">
                        {footerText}{" "}
                        <button onClick={onFooterLinkClick} className="text-primary hover:underline font-semibold">
                        {footerLinkText}
                        </button>
                    </div>
                )}
            </CardContent>
        </>
    );
}
