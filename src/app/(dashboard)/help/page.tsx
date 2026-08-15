
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function HelpPage() {
    const { toast } = useToast();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.trim().length < 3 || message.trim().length < 10) {
            toast({
                variant: "destructive",
                title: "Tell us a bit more",
                description: "Please add a subject and describe what you need help with (at least a sentence or two).",
            });
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiFetch('/api/support-requests', {
                method: 'POST',
                body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || 'Could not submit your request.');

            setSubmitted(true);
            setSubject("");
            setMessage("");
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Request not sent",
                description: err.message || "Please try again.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6]">
            <div className="flex items-center gap-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-[#0B1F3A]" />
                    </Button>
                </Link>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Support</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        Institutional <span className="text-[#C8A96A]">Support.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
                        How can we assist your academic journey today?
                    </p>
                </div>
            </div>

            {/* Ask an Academic Advisor */}
            <Card className="rounded-none border border-[#0B1F3A] border-t-4 border-t-[#C8A96A] shadow-xl bg-[#0B1F3A] text-white relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8A96A]/10 rounded-full blur-[80px] opacity-50" />
                <div className="relative z-10 grid lg:grid-cols-2 gap-12 p-12 lg:p-16">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-serif leading-tight">Ask an Academic Advisor.</h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Tell us what you need help with — enrollment, payments, a course issue, anything. Your request goes straight to the academic office, and you'll get an email the moment they reply.
                        </p>
                        <p className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.3em]">
                            Typical response time: within 1 business day
                        </p>
                    </div>

                    <div>
                        {submitted ? (
                            <div className="bg-white/5 border border-white/10 p-10 flex flex-col items-center text-center gap-5">
                                <div className="w-16 h-16 bg-[#C8A96A]/10 border border-[#C8A96A]/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-[#C8A96A]" />
                                </div>
                                <h3 className="text-xl font-serif">Request Sent</h3>
                                <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                                    Your message has been sent to the academic office. Watch your inbox — you'll receive an email as soon as they reply.
                                </p>
                                <div className="flex items-center gap-2 text-[#C8A96A] text-[10px] font-black uppercase tracking-widest">
                                    <Mail className="w-3.5 h-3.5" /> Reply arrives by email + on this dashboard
                                </div>
                                <Button
                                    onClick={() => setSubmitted(false)}
                                    variant="outline"
                                    className="mt-2 rounded-none border-white/20 bg-transparent text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest"
                                >
                                    Send Another Request
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="help-subject" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Subject</Label>
                                    <Input
                                        id="help-subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="E.g. Payment not reflecting on my dashboard"
                                        disabled={submitting}
                                        required
                                        className="h-12 rounded-none bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#C8A96A] px-5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="help-message" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">How can we help?</Label>
                                    <Textarea
                                        id="help-message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                        placeholder="Describe your issue or question in as much detail as you can."
                                        disabled={submitting}
                                        required
                                        className="rounded-none bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#C8A96A] p-5 resize-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-14 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black rounded-none shadow-none transition-all text-[10px] uppercase tracking-widest gap-2"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Send to Academic Advisor
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
