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
import { Check, ChevronRight, ChevronLeft, Plus, Video, Calendar, FileText, Trash2, GripVertical, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FilePicker } from '@/components/FilePicker';

const STEPS = [
    { id: 1, name: 'Basic Info', description: 'Course details' },
    { id: 2, name: 'Curriculum', description: 'Modules & Lessons' },
    { id: 3, name: 'Assignments', description: 'Student tasks' },
    { id: 4, name: 'Publish', description: 'Review & Go Live' },
];

export default function NewCoursePage() {
    const { user } = useUser();
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
        imageUrl: 'https://placehold.co/600x400?text=Course+Thumbnail',
        imageHint: '',
    });

    const [modules, setModules] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);

    const handleNext = () => {
        if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSaveCourse = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // 1. Create Course
            const courseRes = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...courseData,
                    imageHint: courseData.imageHint || courseData.title,
                    instructor: {
                        name: user.displayName,
                        avatarUrl: user.photoURL,
                        verified: true,
                    },
                    price: Number(courseData.price),
                    duration: Number(courseData.duration),
                }),
            });
            const course = await courseRes.json();

            if (!courseRes.ok) throw new Error(course.error || 'Failed to create course');

            // 2. Create Modules & Lessons
            for (const mod of modules) {
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

            toast({ title: "Success", description: "Course published successfully!" });
            router.push('/instructor');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const addModule = () => {
        setModules([...modules, { title: '', description: '', lessons: [] }]);
    };

    const addLesson = (moduleIndex: number) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons.push({ title: '', content: '', videoUrl: '', isLive: false });
        setModules(newModules);
    };

    const addAssignment = () => {
        setAssignments([...assignments, { title: '', description: '', points: 100 }]);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2" />
                <div className="relative flex justify-between">
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors ${currentStep >= step.id ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'
                                    }`}
                            >
                                {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-bold ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'}`}>{step.name}</p>
                                <p className="text-xs text-slate-400 hidden sm:block">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="mt-12">
                {currentStep === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Course Information</CardTitle>
                            <CardDescription>Start with the essentials of your course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Advanced Hospitality Management"
                                    value={courseData.title}
                                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What will students learn?"
                                    value={courseData.description}
                                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={courseData.category}
                                        onValueChange={(v) => setCourseData({ ...courseData, category: v })}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select one" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Hospitality">Hospitality</SelectItem>
                                            <SelectItem value="Facilities Management">Facilities Management</SelectItem>
                                            <SelectItem value="Business">Business</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="level">Skill Level</Label>
                                    <Select
                                        value={courseData.level}
                                        onValueChange={(v) => setCourseData({ ...courseData, level: v })}
                                    >
                                        <SelectTrigger id="level">
                                            <SelectValue placeholder="Select one" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                            <SelectItem value="All Levels">All Levels</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0 for free"
                                        value={courseData.price}
                                        onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Duration (Weeks)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        placeholder="e.g. 6"
                                        value={courseData.duration}
                                        onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                                    />
                                </div>
                            </div>

                            <FilePicker
                                label="Course Background Image"
                                value={courseData.imageUrl}
                                onChange={(url) => setCourseData({ ...courseData, imageUrl: url })}
                                accept="image/*"
                                placeholder="Enter image URL or upload"
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="imageHint">Image Alt Text (for SEO)</Label>
                                <Input
                                    id="imageHint"
                                    placeholder="e.g. A lecturer teaching hospitality management"
                                    value={courseData.imageHint}
                                    onChange={(e) => setCourseData({ ...courseData, imageHint: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Course Curriculum</h2>
                            <Button onClick={addModule} className="gap-2">
                                <Plus className="w-4 h-4" /> Add Module
                            </Button>
                        </div>

                        {modules.map((mod, mIdx) => (
                            <Card key={mIdx}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex-1 mr-4">
                                        <Input
                                            placeholder="Module Title"
                                            className="font-bold border-none px-0 text-lg focus-visible:ring-0"
                                            value={mod.title}
                                            onChange={(e) => {
                                                const newMods = [...modules];
                                                newMods[mIdx].title = e.target.value;
                                                setModules(newMods);
                                            }}
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setModules(modules.filter((_, i) => i !== mIdx))}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {mod.lessons.map((lesson: any, lIdx: number) => (
                                        <div key={lIdx} className="bg-slate-50 p-4 rounded-lg flex items-start gap-4">
                                            <GripVertical className="w-5 h-5 text-slate-400 mt-2 cursor-move" />
                                            <div className="flex-1 space-y-3">
                                                <Input
                                                    placeholder="Lesson Title"
                                                    value={lesson.title}
                                                    onChange={(e) => {
                                                        const newMods = [...modules];
                                                        newMods[mIdx].lessons[lIdx].title = e.target.value;
                                                        setModules(newMods);
                                                    }}
                                                />
                                                <div className="flex gap-4">
                                                    <FilePicker
                                                        label="Lesson Video"
                                                        value={lesson.videoUrl}
                                                        onChange={(url) => {
                                                            const newMods = [...modules];
                                                            newMods[mIdx].lessons[lIdx].videoUrl = url;
                                                            setModules(newMods);
                                                        }}
                                                        accept="video/*"
                                                        placeholder="Enter video URL (YouTube, Vimeo, etc.) or upload"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-xs">Live Class?</Label>
                                                        <input
                                                            type="checkbox"
                                                            checked={lesson.isLive}
                                                            onChange={(e) => {
                                                                const newMods = [...modules];
                                                                newMods[mIdx].lessons[lIdx].isLive = e.target.checked;
                                                                setModules(newMods);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                const newMods = [...modules];
                                                newMods[mIdx].lessons = mod.lessons.filter((_: any, i: number) => i !== lIdx);
                                                setModules(newMods);
                                            }}>
                                                <Trash2 className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addLesson(mIdx)} className="w-full border-dashed">
                                        <Plus className="w-3 h-3 mr-2" /> Add Lesson
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {modules.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 border-2 border-dashed rounded-xl">
                                <p className="text-slate-500">No modules added yet. Start by adding your first module.</p>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Course Assignments</h2>
                            <Button onClick={addAssignment} className="gap-2">
                                <Plus className="w-4 h-4" /> Add Assignment
                            </Button>
                        </div>

                        {assignments.map((ass, aIdx) => (
                            <Card key={aIdx}>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-4">
                                            <Input
                                                placeholder="Assignment Name"
                                                value={ass.title}
                                                onChange={(e) => {
                                                    const newAss = [...assignments];
                                                    newAss[aIdx].title = e.target.value;
                                                    setAssignments(newAss);
                                                }}
                                            />
                                            <Textarea
                                                placeholder="Instructions for students..."
                                                value={ass.description}
                                                onChange={(e) => {
                                                    const newAss = [...assignments];
                                                    newAss[aIdx].description = e.target.value;
                                                    setAssignments(newAss);
                                                }}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label className="text-xs">Max Points</Label>
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
                                </CardContent>
                                <CardFooter className="justify-end border-t bg-slate-50/50 py-2">
                                    <Button variant="ghost" size="sm" onClick={() => setAssignments(assignments.filter((_, i) => i !== aIdx))}>
                                        <Trash2 className="w-4 h-4 text-red-500 mr-2" /> Remove
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6">
                        <Card className="bg-indigo-50 border-indigo-100">
                            <CardContent className="p-6 text-center">
                                <h3 className="text-xl font-bold text-indigo-900">Almost Finished!</h3>
                                <p className="text-indigo-700 mt-2">Review your course details below. Once published, students will be able to enroll and start learning immediately.</p>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-900 border-b pb-2 mb-4">Final Review</h4>
                                    <div className="space-y-2">
                                        <p><strong>Title:</strong> {courseData.title}</p>
                                        <p><strong>Price:</strong> ${courseData.price}</p>
                                        <p><strong>Curriculum:</strong> {modules.length} Modules, {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</p>
                                        <p><strong>Assignments:</strong> {assignments.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl border p-4 shadow-none">
                                    <img src={courseData.imageUrl} className="w-full aspect-video object-cover rounded-lg mb-4" />
                                    <h5 className="font-bold">{courseData.title || 'Untitled Course'}</h5>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary">{courseData.category}</Badge>
                                        <span className="text-sm font-bold text-indigo-600">${courseData.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSaving}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {currentStep < STEPS.length ? (
                    <Button onClick={handleNext}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSaveCourse} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSaving ? 'Publishing...' : <><Save className="mr-2 h-4 w-4" /> Publish Course</>}
                    </Button>
                )}
            </div>
        </div>
    );
}
