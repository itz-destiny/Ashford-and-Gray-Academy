
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, User, GraduationCap, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export default function CompleteProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<"student" | "instructor">("student");

    const uid = searchParams.get("uid");
    const email = searchParams.get("email");
    const displayName = searchParams.get("displayName");
    const photoURL = searchParams.get("photoURL");

    useEffect(() => {
        if (!uid) {
            router.push("/login");
        }
    }, [uid, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        
        const extraData: any = {};
        if (role === "student") {
            extraData.dateOfBirth = (form.elements.namedItem("dob") as HTMLInputElement).value;
            extraData.school = (form.elements.namedItem("school") as HTMLInputElement).value;
        } else {
            extraData.expertise = (form.elements.namedItem("expertise") as HTMLInputElement).value;
            extraData.organization = (form.elements.namedItem("organization") as HTMLInputElement).value;
        }

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    email,
                    displayName: name,
                    photoURL,
                    role,
                    ...extraData
                }),
            });

            if (response.ok) {
                toast({
                    title: (
                        <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span>Profile Completed!</span>
                        </div>
                    ),
                    description: "Welcome to Ashford & Gray Academy.",
                });
                
                // Redirect to dashboard based on role
                const target = role === "instructor" ? "/instructor" : "/dashboard";
                window.location.href = target;
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to complete profile");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!uid) return null;

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Section */}
            <div className="relative flex-col items-center justify-center hidden bg-[#0B1F3A] lg:flex overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/academy_hero_students.png"
                        alt="Students"
                        fill
                        className="object-cover opacity-20 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/80 to-transparent" />
                </div>
                
                <div className="relative z-10 p-12 lg:p-24 text-white w-full max-w-3xl mx-auto flex flex-col justify-between h-full">
                    <div>
                        <Logo variant="white" />
                        <h1 className="text-5xl lg:text-7xl font-serif mt-24 tracking-tight leading-tight">
                            Institutional <br />
                            <span className="italic text-[#C8A96A]">Integration.</span>
                        </h1>
                        <p className="mt-10 text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                            Personalize your institutional access to align with the Academy's standards of excellence.
                        </p>
                    </div>

                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-16">
                        &copy; {new Date().getFullYear()} Ashford & Gray Academy. Distinction in every detail.
                    </div>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-white max-h-screen overflow-y-auto w-full">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0B1F3A]/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <div className="w-full max-w-[540px] relative z-10 py-10">
                    <div className="lg:hidden mb-12 flex justify-center">
                        <Logo variant="default" />
                    </div>

                    <div className="space-y-4 mb-12 text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight">Final Details</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Ensure your profile reflects your professional standing.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Full Legal Name</Label>
                                <Input id="name" name="name" defaultValue={displayName || ""} required disabled={isLoading} className="h-16 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-8 font-medium shadow-sm" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Institutional Role</Label>
                                <RadioGroup 
                                    defaultValue="student" 
                                    onValueChange={(v) => setRole(v as any)}
                                    className="grid grid-cols-2 gap-6"
                                >
                                    <div>
                                        <RadioGroupItem value="student" id="student" className="peer sr-only" />
                                        <Label
                                            htmlFor="student"
                                            className={cn(
                                                "flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 hover:bg-slate-50 peer-data-[state=checked]:border-[#0B1F3A] peer-data-[state=checked]:bg-[#0B1F3A]/5 cursor-pointer transition-all h-full",
                                                role === 'student' && "border-[#0B1F3A] bg-[#0B1F3A]/5"
                                            )}
                                        >
                                            <GraduationCap className={cn("mb-4 h-10 w-10 text-slate-300", role === 'student' && "text-[#0B1F3A]")} />
                                            <span className={cn("font-black text-[10px] uppercase tracking-[0.2em] text-slate-400", role === 'student' && "text-[#0B1F3A]")}>Candidate</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="instructor" id="instructor" className="peer sr-only" />
                                        <Label
                                            htmlFor="instructor"
                                            className={cn(
                                                "flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 hover:bg-slate-50 peer-data-[state=checked]:border-[#0B1F3A] peer-data-[state=checked]:bg-[#0B1F3A]/5 cursor-pointer transition-all h-full",
                                                role === 'instructor' && "border-[#0B1F3A] bg-[#0B1F3A]/5"
                                            )}
                                        >
                                            <User className={cn("mb-4 h-10 w-10 text-slate-300", role === 'instructor' && "text-[#0B1F3A]")} />
                                            <span className={cn("font-black text-[10px] uppercase tracking-[0.2em] text-slate-400", role === 'instructor' && "text-[#0B1F3A]")}>Instructor</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {role === "student" ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                                    <div className="space-y-3">
                                        <Label htmlFor="dob" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Date of Birth</Label>
                                        <Input id="dob" name="dob" type="date" required disabled={isLoading} className="h-16 rounded-full bg-white border-slate-200 px-8 font-medium shadow-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="school" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Previous Institution</Label>
                                        <Input id="school" name="school" placeholder="e.g., University of Distinction" required disabled={isLoading} className="h-16 rounded-full bg-white border-slate-200 px-8 font-medium shadow-sm" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                                    <div className="space-y-3">
                                        <Label htmlFor="expertise" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Domain of Expertise</Label>
                                        <Input id="expertise" name="expertise" placeholder="e.g., Strategic Leadership" required disabled={isLoading} className="h-16 rounded-full bg-white border-slate-200 px-8 font-medium shadow-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="organization" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Current Organization</Label>
                                        <Input id="organization" name="organization" placeholder="e.g., Global Relations Firm" required disabled={isLoading} className="h-16 rounded-full bg-white border-slate-200 px-8 font-medium shadow-sm" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button type="submit" className="w-full h-18 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all h-16" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>Authorize Profile <ArrowRight className="ml-3 h-4 w-4" /></>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
