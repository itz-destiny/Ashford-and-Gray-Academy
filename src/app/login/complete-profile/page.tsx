"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/firebase";

const inputClass =
    "h-12 rounded-none border border-slate-200 bg-white px-5 font-medium text-[#0B1F3A] placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:border-[#0B1F3A] transition-colors";

const labelClass =
    "text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]";

export default function CompleteProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const auth = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const uid = searchParams.get("uid");
    const email = searchParams.get("email");
    const displayName = searchParams.get("displayName");
    const photoURL = searchParams.get("photoURL");

    useEffect(() => {
        if (!uid) router.push("/login");
    }, [uid, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const dateOfBirth = (form.elements.namedItem("dob") as HTMLInputElement).value;
        const country = (form.elements.namedItem("country") as HTMLInputElement).value;
        const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;

        try {
            const currentUser = auth?.currentUser;
            if (!currentUser) throw new Error("Not signed in. Please sign in again.");
            const idToken = await currentUser.getIdToken();
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    uid, email, displayName: name, photoURL,
                    role: "student", dateOfBirth, country, phone,
                }),
            });

            if (response.ok) {
                toast({ title: "Profile completed", description: "Welcome to Ashford & Gray Academy." });
                window.location.href = "/dashboard";
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to complete profile");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!uid) return null;

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[1px] bg-[#C8A96A]" />
                <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Final Details</span>
            </div>

            <div className="space-y-3 mb-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-[1.1]">
                    Complete your candidate profile
                </h2>
                <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md">
                    A few last details so the admissions office can finish setting up your record.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name" className={labelClass}>Full Legal Name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={displayName || ""}
                        required
                        disabled={isLoading}
                        className={inputClass}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className={labelClass}>Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            required
                            disabled={isLoading}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country" className={labelClass}>Country</Label>
                        <Input
                            id="country"
                            name="country"
                            type="text"
                            placeholder="Nigeria"
                            required
                            disabled={isLoading}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dob" className={labelClass}>Date of Birth</Label>
                    <Input
                        id="dob"
                        name="dob"
                        type="date"
                        required
                        disabled={isLoading}
                        className={inputClass}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors !mt-10"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Authorise Profile <ArrowRight className="ml-3 h-4 w-4" /></>}
                </Button>

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center pt-4">
                    Instructor and staff accounts are issued by the Academy directly.
                </p>
            </form>
        </div>
    );
}
