"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { FaLinkedinIn, FaXTwitter, FaFacebookF, FaInstagram, FaYoutube, FaThreads } from "react-icons/fa6";

const SOCIALS = [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ashford-gray-85b5a040a", icon: FaLinkedinIn },
    { label: "X (Twitter)", href: "https://x.com/AshfordFusion", icon: FaXTwitter },
    { label: "Threads", href: "https://www.threads.com/@ashfordgrayacademy", icon: FaThreads },
    { label: "Facebook", href: "https://www.facebook.com/share/1H8yi7mBSJ/", icon: FaFacebookF },
    { label: "Instagram", href: "https://www.instagram.com/ashfordgrayacademy?igsh=bGQyMmpiNWU1bXBk", icon: FaInstagram },
    { label: "YouTube", href: "https://youtube.com/@ashfordgray?si=NdmrAITGsPN-abXO", icon: FaYoutube },
];

export default function ContactPage() {
    const { toast } = useToast();
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handle = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.subject || form.message.length < 10) {
            toast({ variant: "destructive", title: "Missing information", description: "Please fill in all required fields. Message must be at least 10 characters." });
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || "Failed to send");
            setSent(true);
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Could not send", description: err?.message || "Try again." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white">
            <header className="py-24 md:py-32 text-center border-b border-slate-50">
                <div className="container px-6 lg:px-12">
                    <div className="inline-flex items-center gap-3 mb-8">
                        <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                        <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Contact</span>
                        <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        Speak with the <br />
                        <span className="italic text-[#C8A96A]">Academy.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
                        Whether you are exploring admissions, partnership, faculty engagement, or executive enquiries — our office is open.
                    </p>
                </div>
            </header>

            <section className="py-24 md:py-32 container px-6 lg:px-12">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Contact info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-none bg-[#0B1F3A] text-white rounded-[3rem] shadow-2xl overflow-hidden relative">
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8A96A]/10 rounded-full blur-3xl" />
                            <CardContent className="p-10 md:p-12 relative space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.4em] mb-3">Admissions Office</p>
                                    <h3 className="text-2xl md:text-3xl font-serif">We respond within one business day.</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-[#C8A96A] shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Email</p>
                                            <a href="mailto:ashfordandgrayinstitute@gmail.com" className="text-white hover:underline font-medium">ashfordandgrayinstitute@gmail.com</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-[#C8A96A] shrink-0">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Phone</p>
                                            <a href="tel:+2349160008451" className="block text-white hover:underline font-medium">+234 916 000 8451</a>
                                            <a href="tel:+2349167029427" className="block text-white hover:underline font-medium">+234 916 702 9427</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-[#C8A96A] shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Reach</p>
                                            <p className="text-white font-medium">Global delivery · 100% online</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-slate-50 rounded-[3rem] shadow-sm">
                            <CardContent className="p-10 md:p-12 space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.4em] mb-3">Connect</p>
                                    <h3 className="text-2xl font-serif text-[#0B1F3A]">Follow the Academy</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {SOCIALS.map(s => (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl p-4 hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A] transition-colors group"
                                            title={s.label}
                                        >
                                            <s.icon className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact form */}
                    <div className="lg:col-span-3">
                        {sent ? (
                            <Card className="border-none bg-emerald-50 rounded-[3rem] shadow-sm h-full">
                                <CardContent className="p-12 md:p-16 flex flex-col items-center justify-center text-center space-y-6 h-full">
                                    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-serif text-[#0B1F3A]">Message received.</h3>
                                    <p className="text-slate-600 max-w-md font-medium leading-relaxed">
                                        Thank you for reaching out to Ashford &amp; Gray. Our admissions team will respond to your enquiry within one business day.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <Button asChild className="rounded-full bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] px-8 h-12">
                                            <Link href="/">Return home</Link>
                                        </Button>
                                        <Button onClick={() => setSent(false)} variant="outline" className="rounded-full font-black text-[10px] uppercase tracking-[0.3em] px-8 h-12">
                                            Send another message
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-none bg-white rounded-[3rem] shadow-sm border border-slate-100">
                                <CardContent className="p-10 md:p-12">
                                    <h3 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] mb-2">Send a message</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-10">Required fields are marked with an asterisk.</p>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Full name *</Label>
                                                <Input id="name" required value={form.name} onChange={handle("name")} className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-medium" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Email *</Label>
                                                <Input id="email" type="email" required value={form.email} onChange={handle("email")} className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-medium" />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Phone</Label>
                                                <Input id="phone" value={form.phone} onChange={handle("phone")} className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-medium" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Subject *</Label>
                                                <Input id="subject" required value={form.subject} onChange={handle("subject")} className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-medium" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Message *</Label>
                                            <Textarea
                                                id="message"
                                                required
                                                rows={6}
                                                value={form.message}
                                                onChange={handle("message")}
                                                className="rounded-2xl bg-slate-50 border-none p-5 font-medium resize-none"
                                                placeholder="Tell us how we can help…"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full h-16 rounded-full bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl"
                                        >
                                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send message <ArrowRight className="ml-3 h-4 w-4" /></>}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
