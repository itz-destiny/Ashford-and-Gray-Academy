"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronRight, ChevronLeft, Plus, Video, Calendar, FileText, Trash2, GripVertical, Save, Layout, Layers, GraduationCap, DollarSign, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FilePicker } from '@/components/FilePicker';
import { cn } from '@/lib/utils';

const STEPS = [
    { id: 1, name: 'Overview', description: 'Title & Category', icon: Layout },
    { id: 2, name: 'Curriculum', description: 'Modules & Content', icon: Layers },
    { id: 3, name: 'Assignments', description: 'Tasks & quizzes', icon: GraduationCap },
    { id: 4, name: 'Publish', description: 'Price & Go Live', icon: DollarSign },
];

export default function NewCoursePage() {
    const { user, loading: authLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        level: 'Beginner',
        duration: '',
        imageUrl: '',
        imageHint: '',
    });

    const [modules, setModules] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);

    // Authentication Guard
    React.useEffect(() => {
        if (!authLoading && !user) {
            console.log("NewCoursePage: User not authenticated, redirecting...");
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!courseData.title || !courseData.category || !courseData.description) {
                    toast({ variant: "destructive", title: "Missing Info", description: "Title, Category, and Description are required." });
                    return false;
                }
                return true;
            case 2:
                if (modules.length === 0) {
                    toast({ variant: "destructive", title: "Curriculum Required", description: "Add at least one module." });
                    return false;
                }
                const incompleteModule = modules.find(m => !m.title || m.lessons.length === 0);
                if (incompleteModule) {
                    toast({ variant: "destructive", title: "Incomplete Module", description: "Ensure all modules have a title and at least one lesson." });
                    return false;
                }
                return true;
            case 4:
                if (!courseData.price || !courseData.duration) {
                    toast({ variant: "destructive", title: "Pricing Required", description: "Please set a price and estimated duration." });
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const [publishStage, setPublishStage] = useState('');

    const handleSaveCourse = async () => {
        if (!user) {
            console.error("handleSaveCourse: User object is null/undefined");
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to publish a course." });
            return;
        }

        // Final Validation
        if (!validateStep(1) || !validateStep(2) || !validateStep(4)) return;

        setIsSaving(true);
        setPublishStage('Creating Course Identity...');

        try {
            const instructorName = user.displayName || (user as any).name || (user as any).fullName || "Instructor";
            const instructorAvatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random`;

            // 1. Create Course
            const courseRes = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...courseData,
                    imageHint: courseData.imageHint || courseData.title,
                    instructor: {
                        name: instructorName,
                        avatarUrl: instructorAvatar,
                        verified: true,
                    },
                    price: Number(courseData.price) || 0,
                    duration: Number(courseData.duration) || 0,
                    imageUrl: courseData.imageUrl || 'https://placehold.co/600x400?text=No+Image',
                }),
            });
            const course = await courseRes.json();

            if (!courseRes.ok) throw new Error(course.error || 'Failed to create course');

            // 2. Create Modules & Lessons
            setPublishStage(`Building Curriculum (${modules.length} modules)...`);
            for (let i = 0; i < modules.length; i++) {
                const mod = modules[i];
                setPublishStage(`Uploading Module ${i + 1}: ${mod.title}`);
                const modRes = await fetch(`/api/courses/${course._id}/content`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'module',
                        data: { title: mod.title, description: mod.description },
                    }),
                });
                const createdMod = await modRes.json();

                for (const lesson of mod.lessons) {
                    await fetch(`/api/courses/${course._id}/content`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'lesson',
                            data: {
                                moduleId: createdMod._id,
                                title: lesson.title,
                                content: lesson.content,
                                videoUrl: lesson.videoUrl,
                                isLive: lesson.isLive,
                                scheduledAt: lesson.scheduledAt,
                            },
                        }),
                    });
                }
            }

            // 3. Create Assignments
            if (assignments.length > 0) {
                setPublishStage(`Configuring ${assignments.length} assignments...`);
                for (const ass of assignments) {
                    await fetch('/api/assignments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'assignment',
                            data: {
                                courseId: course._id,
                                title: ass.title,
                                description: ass.description,
                                points: ass.points,
                            },
                        }),
                    });
                }
            }

            setPublishStage('Course Live! Redirecting...');
            toast({ title: "Success!", description: "Your course is now live." });
            setTimeout(() => router.push('/instructor'), 1500);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Publication Failed", description: error.message });
        } finally {
            setIsSaving(false);
            setPublishStage('');
        }
    };

    const addModule = () => {
        setModules([...modules, { title: 'New Module', description: '', lessons: [] }]);
    };

    const addLesson = (moduleIndex: number) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons.push({ title: 'New Lesson', content: '', videoUrl: '', isLive: false });
        setModules(newModules);
    };

    const addAssignment = () => {
        setAssignments([...assignments, { title: 'New Assignment', description: '', points: 100 }]);
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Restoring session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
            {/* Success Overlay */}
            {publishStage === 'Course Live! Redirecting...' && (
                <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in duration-500">
                    <div className="text-center space-y-6 max-w-md p-8">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100 animate-bounce">
                            <Check className="w-12 h-12 stroke-[3]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">SUCCESS!</h2>
                            <p className="text-xl font-medium text-slate-500">Your masterpiece is now available to students worldwide.</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold animate-pulse">
                            <Upload className="w-5 h-5" />
                            Redirecting to your dashboard...
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Course</h1>
                    <p className="text-slate-500 font-medium">Drafting: <span className="text-indigo-600">{courseData.title || "Untitled Course"}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => router.push('/instructor')} disabled={isSaving}>Cancel</Button>
                    {currentStep === 4 && (
                        <Button
                            onClick={handleSaveCourse}
                            disabled={isSaving}
                            className={cn(
                                "transition-all duration-500",
                                isSaving ? "bg-amber-500 hover:bg-amber-600 w-64" : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs truncate">{publishStage || "Publishing..."}</span>
                                </>
                            ) : <><Save className="mr-2 h-4 w-4" /> Publish Now</>}
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress Stepper used as Navigation */}
            <div className="grid grid-cols-4 gap-4">
                {STEPS.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const Icon = step.icon;
                    return (
                        <div
                            key={step.id}
                            onClick={() => setCurrentStep(step.id)}
                            className={cn(
                                "cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2",
                                isActive
                                    ? "bg-white border-indigo-600 shadow-xl shadow-indigo-100 scale-105 z-10"
                                    : isCompleted
                                        ? "bg-indigo-50 border-indigo-200 opacity-80"
                                        : "bg-white border-slate-100 opacity-60 hover:opacity-100"
                            )}>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                isActive ? "bg-indigo-600 text-white" : isCompleted ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                            )}>
                                {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <div className="text-center">
                                <h3 className={cn("font-bold text-sm", isActive ? "text-indigo-900" : "text-slate-500")}>{step.name}</h3>
                                <p className="text-xs text-slate-400 hidden sm:block">{step.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Workflow Area */}
            <div className="min-h-[500px] animate-in slide-in-from-bottom-4 duration-500 fade-in">

                {/* STEP 1: OVERVIEW */}
                {currentStep === 1 && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-xl">Course Details</CardTitle>
                                <CardDescription>Define the identity of your course.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-600">Course Title</Label>
                                    <Input
                                        className="h-12 text-lg font-bold border-slate-200 focus-visible:ring-indigo-500"
                                        placeholder="e.g. Master Class in Hospitality"
                                        value={courseData.title}
                                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600">Short Description</Label>
                                    <Textarea
                                        className="resize-none h-32 border-slate-200 focus-visible:ring-indigo-500"
                                        placeholder="Briefly describe what students will learn..."
                                        value={courseData.description}
                                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-600">Category</Label>
                                        <Select value={courseData.category} onValueChange={(v) => setCourseData({ ...courseData, category: v })}>
                                            <SelectTrigger className="h-11"><SelectValue placeholder="Select..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Hospitality">Hospitality</SelectItem>
                                                <SelectItem value="Facilities Management">Facilities Management</SelectItem>
                                                <SelectItem value="Business">Business</SelectItem>
                                                <SelectItem value="Technology">Technology</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-600">Skill Level</Label>
                                        <Select value={courseData.level} onValueChange={(v) => setCourseData({ ...courseData, level: v })}>
                                            <SelectTrigger className="h-11"><SelectValue placeholder="Select..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-slate-100 bg-white/80 backdrop-blur-sm h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg">Media & Branding</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FilePicker
                                    label="Course Thumbnail"
                                    value={courseData.imageUrl}
                                    onChange={(url) => setCourseData({ ...courseData, imageUrl: url })}
                                    accept="image/*"
                                    placeholder="Upload high-quality cover image"
                                />
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-400">SEO Alt Text</Label>
                                    <Input
                                        className="h-9 text-sm"
                                        placeholder="Describe image..."
                                        value={courseData.imageHint}
                                        onChange={(e) => setCourseData({ ...courseData, imageHint: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}


                {/* STEP 2: CURRICULUM */}
                {currentStep === 2 && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Curriculum Builder</h2>
                                <p className="text-slate-500">Organize your course into modules and lessons.</p>
                            </div>
                            <Button onClick={addModule} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" /> Add Module</Button>
                        </div>

                        <div className="space-y-6">
                            {modules.length === 0 && (
                                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 bg-slate-50/50">
                                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Start by adding your first module from above.</p>
                                </div>
                            )}

                            {modules.map((mod, mIdx) => (
                                <Card key={mIdx} className="overflow-hidden border-indigo-100 shadow-md shadow-slate-100">
                                    <div className="bg-indigo-50/50 p-4 flex items-center gap-4 border-b border-indigo-100">
                                        <Badge className="bg-indigo-200 text-indigo-700 hover:bg-indigo-200">Module {mIdx + 1}</Badge>
                                        <Input
                                            value={mod.title}
                                            onChange={(e) => {
                                                const newMods = [...modules];
                                                newMods[mIdx].title = e.target.value;
                                                setModules(newMods);
                                            }}
                                            className="bg-transparent border-none text-lg font-bold focus-visible:ring-0 px-0 h-auto"
                                            placeholder="Module Title"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => setModules(modules.filter((_, i) => i !== mIdx))} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                    <CardContent className="p-4 space-y-4">
                                        {mod.lessons.map((lesson: any, lIdx: number) => (
                                            <div key={lIdx} className="pl-4 border-l-2 border-slate-200 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                                    <Input
                                                        value={lesson.title}
                                                        onChange={(e) => {
                                                            const newMods = [...modules];
                                                            newMods[mIdx].lessons[lIdx].title = e.target.value;
                                                            setModules(newMods);
                                                        }}
                                                        className="h-8 text-sm font-medium border-none bg-slate-50 focus-visible:bg-white"
                                                        placeholder="Lesson Title"
                                                    />
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        const newMods = [...modules];
                                                        newMods[mIdx].lessons = mod.lessons.filter((_: any, i: number) => i !== lIdx);
                                                        setModules(newMods);
                                                    }} className="h-6 w-6"><Trash2 className="w-3 h-3 text-slate-400" /></Button>
                                                </div>

                                                <div className="ml-4 grid md:grid-cols-2 gap-4">
                                                    <FilePicker
                                                        label="Video Content"
                                                        value={lesson.videoUrl}
                                                        onChange={(url) => {
                                                            const newMods = [...modules];
                                                            newMods[mIdx].lessons[lIdx].videoUrl = url;
                                                            setModules(newMods);
                                                        }}
                                                        accept="video/*"
                                                        placeholder="Video URL or Upload"
                                                    />
                                                    <div className="flex items-end pb-2">
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                                checked={lesson.isLive}
                                                                onChange={(e) => {
                                                                    const newMods = [...modules];
                                                                    newMods[mIdx].lessons[lIdx].isLive = e.target.checked;
                                                                    setModules(newMods);
                                                                }}
                                                            />
                                                            <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">Is Live Class?</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" onClick={() => addLesson(mIdx)} className="ml-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"><Plus className="w-3 h-3 mr-2" /> Add Lesson</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: ASSIGNMENTS */}
                {currentStep === 3 && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Assignments</h2>
                            <Button onClick={addAssignment} variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
                        </div>
                        {assignments.map((ass, aIdx) => (
                            <Card key={aIdx} className="group hover:border-indigo-300 transition-colors">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Label>Assignment Title</Label>
                                            <Input
                                                value={ass.title}
                                                onChange={(e) => {
                                                    const newAss = [...assignments];
                                                    newAss[aIdx].title = e.target.value;
                                                    setAssignments(newAss);
                                                }}
                                            />
                                        </div>
                                        <div className="w-24 space-y-2">
                                            <Label>Points</Label>
                                            <Input
                                                type="number"
                                                value={ass.points}
                                                onChange={(e) => {
                                                    const newAss = [...assignments];
                                                    newAss[aIdx].points = Number(e.target.value);
                                                    setAssignments(newAss);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Instructions for students..."
                                        value={ass.description}
                                        onChange={(e) => {
                                            const newAss = [...assignments];
                                            newAss[aIdx].description = e.target.value;
                                            setAssignments(newAss);
                                        }}
                                        className="bg-slate-50"
                                    />
                                    <div className="flex justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => setAssignments(assignments.filter((_, i) => i !== aIdx))} className="text-red-400 hover:text-red-500 hover:bg-red-50">Remove</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* STEP 4: PUBLISH */}
                {currentStep === 4 && (
                    <div className="max-w-3xl mx-auto">
                        <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50">
                            <CardHeader>
                                <CardTitle>Finalize & Publish</CardTitle>
                                <CardDescription>Set pricing and review your course.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Course Price ($)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <Input
                                                type="number"
                                                className="pl-8 text-lg font-bold"
                                                placeholder="0.00"
                                                value={courseData.price}
                                                onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Duration (Hours)</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 10"
                                            value={courseData.duration}
                                            onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-2">Summary</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex justify-between"><span>Modules</span> <span className="font-bold">{modules.length}</span></li>
                                            <li className="flex justify-between"><span>Lessons</span> <span className="font-bold">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span></li>
                                            <li className="flex justify-between"><span>Assignments</span> <span className="font-bold">{assignments.length}</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end pt-6">
                                <Button
                                    size="lg"
                                    onClick={handleSaveCourse}
                                    disabled={isSaving}
                                    className={cn(
                                        "w-full md:w-auto transition-all duration-500 min-w-[200px]",
                                        isSaving ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
                                    )}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {publishStage || "Launching..."}
                                        </>
                                    ) : "Launch Course 🚀"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-12 bg-white/80 backdrop-blur-md sticky bottom-0 p-4 rounded-xl z-20">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                {currentStep < 4 ? (
                    <Button onClick={handleNext} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                        Next Step <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <span className="text-sm font-bold text-indigo-600">Ready to Launch?</span>
                )}
            </div>
        </div>
    );
}
