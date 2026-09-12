"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type CourseOption = { courseId: string; courseTitle: string; facilitatorName: string; alreadySubmitted: boolean };

const OVERALL_OPTIONS = ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'];
const FREQUENCY_OPTIONS = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'];
const ENGAGEMENT_OPTIONS = ['Very engaging', 'Engaging', 'Average', 'Not very engaging', 'Not engaging at all'];

const RATING_5 = ['excellent', 'good', 'average', 'poor', 'very_poor'];
const FREQUENCY_5 = ['always', 'often', 'sometimes', 'rarely', 'never'];
const ENGAGEMENT_5 = ['very_engaging', 'engaging', 'average', 'not_very_engaging', 'not_engaging_at_all'];

function OptionGroup({ options, values, selected, onSelect }: { options: string[]; values: string[]; selected: string | null; onSelect: (v: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((label, i) => (
                <button
                    key={values[i]}
                    type="button"
                    onClick={() => onSelect(values[i])}
                    className={cn(
                        "px-4 py-2.5 text-sm font-bold border transition-colors",
                        selected === values[i]
                            ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                            : "bg-white text-slate-600 border-slate-200 hover:border-[#C8A96A]"
                    )}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default function FeedbackPage() {
    const [step, setStep] = useState<'email' | 'course' | 'form' | 'done'>('email');
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [selected, setSelected] = useState<CourseOption | null>(null);

    const [overallRating, setOverallRating] = useState<string | null>(null);
    const [clarity, setClarity] = useState<string | null>(null);
    const [approachable, setApproachable] = useState<string | null>(null);
    const [timeManagement, setTimeManagement] = useState<string | null>(null);
    const [engagement, setEngagement] = useState<string | null>(null);
    const [likedMost, setLikedMost] = useState("");
    const [improvement, setImprovement] = useState("");
    const [otherComments, setOtherComments] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/feedback/public?email=${encodeURIComponent(email.trim())}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Could not look up your account.');
            const options: CourseOption[] = data.courses;
            setCourses(options);
            if (options.length === 1) {
                setSelected(options[0]);
                setStep('form');
            } else {
                setStep('course');
            }
        } catch (err: any) {
            setError(err.message || 'Could not look up your account.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!selected || !overallRating || !clarity || !approachable || !timeManagement || !engagement) {
            setError('Please answer every rating question before submitting.');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch('/api/feedback/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    courseId: selected.courseId,
                    overallRating, clarity, approachable, timeManagement, engagement,
                    likedMost, improvement, otherComments,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Could not submit your feedback.');
            setStep('done');
        } catch (err: any) {
            setError(err.message || 'Could not submit your feedback.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] px-6 py-16">
            <div className="w-full max-w-xl bg-white p-8 md:p-10 space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                    <h1 className="font-serif text-2xl text-[#0B1F3A]">Facilitator Feedback</h1>
                    <p className="text-slate-500 text-sm">We value your feedback — a few minutes to rate your facilitator helps us improve your learning experience.</p>
                </div>

                {step === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4 pt-2">
                        <Input
                            type="email"
                            required
                            placeholder="Your account email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 rounded-none"
                        />
                        {error && (
                            <div className="flex items-center gap-2 text-rose-600 text-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest rounded-none">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                        </Button>
                    </form>
                )}

                {step === 'course' && (
                    <div className="space-y-3 pt-2">
                        <p className="text-sm font-bold text-[#0B1F3A]">Which course is this feedback for?</p>
                        {courses.map((c) => (
                            <button
                                key={c.courseId}
                                onClick={() => { setSelected(c); setStep('form'); }}
                                className="w-full text-left px-5 py-4 border border-slate-200 hover:border-[#C8A96A] transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-bold text-[#0B1F3A]">{c.courseTitle}</p>
                                    <p className="text-xs text-slate-400">{c.facilitatorName}</p>
                                </div>
                                {c.alreadySubmitted && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Submitted</span>}
                            </button>
                        ))}
                    </div>
                )}

                {step === 'form' && selected && (
                    <div className="space-y-8 pt-2">
                        <div className="bg-[#F6F4F2] px-5 py-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</p>
                            <p className="font-serif text-lg text-[#0B1F3A]">{selected.facilitatorName}</p>
                            <p className="text-sm text-slate-500">{selected.courseTitle}</p>
                        </div>

                        {selected.alreadySubmitted && (
                            <p className="text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
                                You've already submitted feedback for this course — submitting again will add another response.
                            </p>
                        )}

                        <div className="space-y-3">
                            <p className="font-bold text-[#0B1F3A] text-sm">1. How would you rate your facilitator overall?</p>
                            <OptionGroup options={OVERALL_OPTIONS} values={RATING_5} selected={overallRating} onSelect={setOverallRating} />
                        </div>

                        <div className="space-y-3">
                            <p className="font-bold text-[#0B1F3A] text-sm">2. Does the facilitator explain the lessons clearly?</p>
                            <OptionGroup options={FREQUENCY_OPTIONS} values={FREQUENCY_5} selected={clarity} onSelect={setClarity} />
                        </div>

                        <div className="space-y-3">
                            <p className="font-bold text-[#0B1F3A] text-sm">3. Is the facilitator approachable and willing to answer questions?</p>
                            <OptionGroup options={FREQUENCY_OPTIONS} values={FREQUENCY_5} selected={approachable} onSelect={setApproachable} />
                        </div>

                        <div className="space-y-3">
                            <p className="font-bold text-[#0B1F3A] text-sm">4. How well does the facilitator manage time during the sessions?</p>
                            <OptionGroup options={OVERALL_OPTIONS} values={RATING_5} selected={timeManagement} onSelect={setTimeManagement} />
                        </div>

                        <div className="space-y-3">
                            <p className="font-bold text-[#0B1F3A] text-sm">5. How engaging are the online classes?</p>
                            <OptionGroup options={ENGAGEMENT_OPTIONS} values={ENGAGEMENT_5} selected={engagement} onSelect={setEngagement} />
                        </div>

                        <div className="space-y-2">
                            <p className="font-bold text-[#0B1F3A] text-sm">6. What do you like most about your facilitator?</p>
                            <Textarea value={likedMost} onChange={(e) => setLikedMost(e.target.value)} className="rounded-none min-h-[80px]" />
                        </div>

                        <div className="space-y-2">
                            <p className="font-bold text-[#0B1F3A] text-sm">7. What could your facilitator improve on?</p>
                            <Textarea value={improvement} onChange={(e) => setImprovement(e.target.value)} className="rounded-none min-h-[80px]" />
                        </div>

                        <div className="space-y-2">
                            <p className="font-bold text-[#0B1F3A] text-sm">8. Any other comments or suggestions?</p>
                            <Textarea value={otherComments} onChange={(e) => setOtherComments(e.target.value)} className="rounded-none min-h-[80px]" />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose-600 text-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            onClick={handleSubmitFeedback}
                            disabled={submitting}
                            className="w-full h-12 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest rounded-none"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
                        </Button>
                    </div>
                )}

                {step === 'done' && (
                    <div className="text-center space-y-3 py-8">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <p className="font-serif text-xl text-[#0B1F3A]">Thank you for your feedback</p>
                        <p className="text-sm text-slate-500">Your response has been recorded — it helps us improve your learning experience.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
