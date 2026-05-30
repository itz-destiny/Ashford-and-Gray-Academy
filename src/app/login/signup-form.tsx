"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowRight, CheckCircle2, Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { AuthForm } from "./auth-form";
import { signUpWithEmail } from "@/firebase/auth";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const PROGRAMMES = [
    "Housekeeping and Domestic Management (Certificate)",
    "Hospitality Management (Certificate)",
    "Events and Protocol Management (Certificate)",
    "Executive Assistant Management (Certificate)",
    "Hospitality and Global Relationship (Certificate)",
    "Diploma in Hospitality Management",
    "Diploma in Business Innovation & Entrepreneurship",
    "Diploma in Professional Development & Global Relations",
    "Diploma in Event & Protocol Management",
    "The Silent Standard (Executive Master Class)",
    "Undecided — advise me",
];

const QUALIFICATIONS = [
    "Secondary School",
    "Diploma / OND",
    "Higher Diploma / HND",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate / PhD",
    "Professional Certificate",
    "Other",
];

type SignUpFormProps = { onSwitchToLogin?: () => void };

type Form = {
    name: string;
    email: string;
    phone: string;
    country: string;
    dateOfBirth: string;
    programmeOfInterest: string;
    highestQualification: string;
    professionalBackground: string;
    applicationStatement: string;
    password: string;
    confirmPassword: string;
};

const INITIAL: Form = {
    name: "", email: "", phone: "", country: "", dateOfBirth: "",
    programmeOfInterest: "", highestQualification: "",
    professionalBackground: "", applicationStatement: "",
    password: "", confirmPassword: "",
};

const inputClass =
    "h-12 rounded-none border border-slate-200 bg-white px-5 font-medium text-[#0B1F3A] placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:border-[#0B1F3A] transition-colors";

const labelClass =
    "text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]";

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
    const role = "student" as const;
    const [form, setForm] = useState<Form>(INITIAL);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((s) => ({ ...s, [k]: e.target.value }));
    const setSelect = (k: keyof Form) => (value: string) =>
        setForm((s) => ({ ...s, [k]: value }));

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (form.password !== form.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        if (form.password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        if (form.applicationStatement.trim().length < 20) {
            toast({
                variant: "destructive",
                title: "Application statement is too short",
                description: "Please share at least a sentence or two about why you want to study with us.",
            });
            return;
        }

        setIsLoading(true);

        const { error, user } = await signUpWithEmail(form.email, form.password, { name: form.name });

        if (error || !user) {
            setIsLoading(false);
            toast({ variant: "destructive", title: "Application could not be submitted", description: error || "Please try again." });
            return;
        }

        try {
            const idToken = await user.getIdToken();
            const profileRes = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({
                    uid: user.uid, email: user.email, displayName: form.name, role,
                    phone: form.phone, country: form.country, dateOfBirth: form.dateOfBirth,
                    programmeOfInterest: form.programmeOfInterest,
                    highestQualification: form.highestQualification,
                    professionalBackground: form.professionalBackground,
                    applicationStatement: form.applicationStatement,
                }),
            });
            if (!profileRes.ok) throw new Error("Profile sync failed");

            // Auto-trigger the verification email
            fetch("/api/auth/otp/request", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ purpose: "signup" }),
            }).catch(() => { /* surfaced on verify page */ });

            setSubmittedEmail(form.email);
        } catch (err) {
            console.error("Error syncing applicant profile:", err);
            toast({
                variant: "destructive",
                title: "Account created — profile sync failed",
                description: "Please contact admissions so we can complete your record.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (submittedEmail) {
        return (
            <AuthForm
                title="Application Received"
                description="Thank you for applying to Ashford & Gray Fusion Academy."
                footerText=""
                footerLinkText=""
            >
                <div className="space-y-8">
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                    </div>

                    <p className="text-center text-base text-slate-600 leading-relaxed font-medium">
                        Thank you for applying to Ashford &amp; Gray Fusion Academy. Our admissions team will review your application and contact you shortly.
                    </p>

                    <div className="border border-slate-200 p-5 flex items-start gap-3 bg-slate-50">
                        <Mail className="w-5 h-5 text-[#0B1F3A] shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold text-[#0B1F3A]">A verification email is on its way</p>
                            <p className="text-slate-500 mt-1 leading-relaxed">
                                We have sent a 6-digit verification code to <span className="font-bold text-[#0B1F3A]">{submittedEmail}</span>. You can verify your address now or later from your inbox.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button asChild className="flex-1 h-12 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors">
                            <Link href={`/login/verify?purpose=signup${searchParams.get('redirectUrl') ? `&redirectUrl=${encodeURIComponent(searchParams.get('redirectUrl') as string)}` : ''}`}>
                                Verify Email Now <ArrowRight className="ml-3 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1 h-12 rounded-none border border-slate-200 hover:border-[#0B1F3A] hover:bg-white text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] shadow-none">
                            <Link href="/">Return Home</Link>
                        </Button>
                    </div>
                </div>
            </AuthForm>
        );
    }

    return (
        <AuthForm
            title="Candidate Application"
            description="Tell us about yourself. Our admissions team reviews every application personally."
            footerText="Already have an account?"
            footerLinkText="Sign In"
            onFooterLinkClick={onSwitchToLogin}
        >
            <form className="space-y-5" onSubmit={handleSignUp}>
                <div className="space-y-2">
                    <Label htmlFor="name" className={labelClass}>Full Name</Label>
                    <Input id="name" name="name" type="text" placeholder="Adaeze Okonkwo" required disabled={isLoading} value={form.name} onChange={set("name")} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email-signup" className={labelClass}>Email</Label>
                        <Input id="email-signup" name="email-signup" type="email" placeholder="you@email.com" required disabled={isLoading} value={form.email} onChange={set("email")} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className={labelClass}>Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="+234 800 000 0000" required disabled={isLoading} value={form.phone} onChange={set("phone")} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="country" className={labelClass}>Country</Label>
                        <Input id="country" name="country" type="text" placeholder="Nigeria" required disabled={isLoading} value={form.country} onChange={set("country")} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob" className={labelClass}>Date of Birth</Label>
                        <Input id="dob" name="dob" type="date" required disabled={isLoading} value={form.dateOfBirth} onChange={set("dateOfBirth")} className={inputClass} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="programme" className={labelClass}>Programme of Interest</Label>
                    <Select value={form.programmeOfInterest} onValueChange={setSelect("programmeOfInterest")} required disabled={isLoading}>
                        <SelectTrigger id="programme" className={inputClass}>
                            <SelectValue placeholder="Select a programme" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border border-slate-200">
                            {PROGRAMMES.map((p) => (
                                <SelectItem key={p} value={p} className="font-medium">{p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="qualification" className={labelClass}>Highest Qualification</Label>
                    <Select value={form.highestQualification} onValueChange={setSelect("highestQualification")} required disabled={isLoading}>
                        <SelectTrigger id="qualification" className={inputClass}>
                            <SelectValue placeholder="Select your highest qualification" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border border-slate-200">
                            {QUALIFICATIONS.map((q) => (
                                <SelectItem key={q} value={q} className="font-medium">{q}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="background" className={labelClass}>Professional Background</Label>
                    <Textarea
                        id="background"
                        name="background"
                        rows={3}
                        required
                        disabled={isLoading}
                        value={form.professionalBackground}
                        onChange={set("professionalBackground")}
                        placeholder="Briefly describe your current role, industry, and years of experience."
                        className="rounded-none border border-slate-200 bg-white p-4 font-medium text-[#0B1F3A] placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:border-[#0B1F3A] resize-none transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="statement" className={labelClass}>Why do you want to study with us?</Label>
                    <Textarea
                        id="statement"
                        name="statement"
                        rows={4}
                        required
                        disabled={isLoading}
                        value={form.applicationStatement}
                        onChange={set("applicationStatement")}
                        placeholder="Share your motivation, goals, and what you hope to gain from the programme."
                        className="rounded-none border border-slate-200 bg-white p-4 font-medium text-[#0B1F3A] placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:border-[#0B1F3A] resize-none transition-colors"
                    />
                </div>

                {/* Credentials block */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Account Credentials</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password-signup" className={labelClass}>Password</Label>
                            <div className="relative">
                                <Input id="password-signup" name="password-signup" type={showPassword ? "text" : "password"} required placeholder="••••••••" disabled={isLoading} value={form.password} onChange={set("password")} className={`${inputClass} pr-12`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3A] transition-colors" tabIndex={-1}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className={labelClass}>Confirm Password</Label>
                            <div className="relative">
                                <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} required placeholder="••••••••" disabled={isLoading} value={form.confirmPassword} onChange={set("confirmPassword")} className={`${inputClass} pr-12`} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3A] transition-colors" tabIndex={-1}>
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {passwordError && <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{passwordError}</p>}
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors !mt-8"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Submit Application <ArrowRight className="ml-3 h-4 w-4" /></>}
                </Button>
            </form>
        </AuthForm>
    );
}
