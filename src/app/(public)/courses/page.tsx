
"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider";
import {
  BookOpen,
  Briefcase,
  CheckCircle,
  Handshake,
  Search,
  Star,
  Video,
  Wrench,
  BarChart,
  FileText,
  Globe,
  Languages,
  Clock3,
  Smartphone,
  Trophy,
  PlayCircle,
  Info,
  Calendar,
  X,
  ChevronDown,
  ShieldCheck,
  Award,
  Filter,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import type { Course } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function CoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("popular");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([3000000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);


  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.floor(rating) ? "text-[#C8A96A] fill-[#C8A96A]" : "text-slate-200"
            }`}
        />
      );
    }
    return stars;
  };

  const filterCategories = [
    { id: 'Certification', label: 'Certification', icon: BookOpen },
    { id: 'Diploma', label: 'Diploma Programs', icon: Briefcase },
    { id: 'Executive MBA', label: 'Executive Masters', icon: Star },
  ];

  const quickSearchCategories = [
    'Certification',
    'Diploma',
    'Executive MBA',
  ];

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleEnrollClick = async (course: Course) => {
    if (!user) {
      router.push(`/login?redirectUrl=${pathname}?dialog=${course.id}`);
    } else {
      try {
        const res = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, courseId: course.id }),
        });

        if (res.ok) {
          toast({
            title: "Enrollment Authorized",
            description: `You have successfully joined "${course.title}".`,
          });
        } else {
          throw new Error('Failed to enroll');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Registry Error",
          description: "We encountered an issue processing your enrollment.",
        });
      }
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortOrder("popular");
    setSelectedCategories([]);
    setSelectedDifficulty("all");
    setSelectedDurations([]);
    setPriceRange([3000000]);
    setSelectedRatings([]);
  };

  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return [];

    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.instructor && course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      let matchesDifficulty = selectedDifficulty === 'all' || course.level === selectedDifficulty;
      if (selectedDifficulty !== 'all' && selectedCategories.length === 0) {
        matchesDifficulty = false;
      }
      const matchesPrice = course.price <= priceRange[0];
      return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice;
    });

    switch (sortOrder) {
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
        filtered.reverse();
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;

  }, [courses, searchQuery, sortOrder, selectedCategories, selectedDifficulty, priceRange]);

  const FilterSidebar = () => (
    <div className="p-8 bg-white md:bg-transparent space-y-10">
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-[#1F7A5A] rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Academic Category</h3>
        </div>
        <div className="space-y-4">
          {filterCategories.map(cat => (
            <div key={cat.id} className="group flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={cat.id}
                  className="rounded-md border-slate-200 data-[state=checked]:bg-[#1F7A5A] data-[state=checked]:border-[#1F7A5A]"
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={() => handleCategoryChange(cat.id)}
                />
                <Label htmlFor={cat.id} className="text-sm font-bold text-slate-500 group-hover:text-[#1F7A5A] transition-colors cursor-pointer">
                  {cat.label}
                </Label>
              </div>
              <cat.icon className="w-4 h-4 text-slate-200" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-[#0B1F3A] rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Authorization Level</h3>
        </div>
        <RadioGroup value={selectedDifficulty} onValueChange={setSelectedDifficulty} className="space-y-4">
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'Beginner', label: 'Associate' },
            { id: 'Intermediate', label: 'Professional' },
            { id: 'Advanced', label: 'Executive' }
          ].map(lv => (
            <div key={lv.id} className="flex items-center space-x-3">
              <RadioGroupItem value={lv.id} id={lv.id} className="border-slate-200 text-[#0B1F3A] focus:ring-[#0B1F3A]" />
              <Label htmlFor={lv.id} className="text-sm font-bold text-slate-500 cursor-pointer">{lv.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#C8A96A] rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Institutional Investment</h3>
          </div>
          <span className="text-[9px] font-black text-slate-400 tracking-widest">UNDER ₦{(priceRange[0] / 1000).toFixed(0)}K</span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={3000000}
          step={50000}
          className="cursor-pointer"
        />
      </section>

      <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all" onClick={clearAllFilters}>
        Reset Catalog
      </Button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Premium Hero Section */}
      <header className="relative py-32 px-6 md:py-56 overflow-hidden bg-[#0B1F3A]">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-[100%] h-[150%] bg-emerald-500/10 blur-[150px] rounded-full" />
          <div className="absolute top-1/2 -right-1/4 w-[80%] h-[100%] bg-slate-500/10 blur-[180px] rounded-full" />
        </div>

        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-10 px-6 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
            <div className="w-2 h-2 bg-[#C8A96A] rounded-full animate-pulse" />
            <span className="text-[#C8A96A] font-black text-[9px] uppercase tracking-[0.4em]">Academic Registry</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-none mb-10">
            Curated <span className="italic text-[#C8A96A]">Pathways.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-16">
            Refined programs for executive growth and professional distinction.
          </p>

          <div className="max-w-3xl mx-auto px-4">
            <div className="relative group bg-white p-2 rounded-[2.5rem] shadow-2xl transition-all border-none">
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#1F7A5A] transition-colors" />
                  <Input
                    placeholder="Search by program or distinction..."
                    className="h-16 pl-14 bg-transparent border-none text-[#0B1F3A] text-lg font-medium focus-visible:ring-0 placeholder:text-slate-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="lg" className="hidden md:flex h-16 px-10 rounded-[2rem] bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest transition-all">Identify Programs</Button>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {quickSearchCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                    selectedCategories.includes(cat)
                      ? "bg-[#C8A96A] text-white shadow-xl shadow-amber-900/20"
                      : "bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 lg:px-12 -mt-16 relative z-20">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32">
              <div className="p-4 bg-white border border-slate-50 rounded-[3rem] shadow-xl shadow-slate-100/50">
                <FilterSidebar />
              </div>
            </div>
          </aside>

          {/* Main Course Grid */}
          <main className="lg:col-span-3">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden h-14 w-14 rounded-2xl border-slate-100 shadow-sm p-0 flex items-center justify-center shrink-0">
                       <Filter className="w-5 h-5 text-[#0B1F3A]" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 border-none w-full sm:max-w-md rounded-r-[3rem] overflow-y-auto">
                     <FilterSidebar />
                  </SheetContent>
                </Sheet>
                <div>
                  <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">Institutional Catalog</h2>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    {coursesLoading ? <Skeleton className="h-4 w-32" /> : `Showing ${filteredAndSortedCourses.length} distinguished programs`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 group w-full md:w-auto">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full md:w-[220px] h-14 rounded-2xl bg-white border-slate-100 shadow-sm font-black text-[10px] uppercase tracking-widest px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-50 font-black text-[10px] uppercase tracking-widest">
                    <SelectItem value="popular">Priority: Popularity</SelectItem>
                    <SelectItem value="newest">Priority: Newest</SelectItem>
                    <SelectItem value="price-asc">Investment: Low to High</SelectItem>
                    <SelectItem value="price-desc">Investment: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-12 sm:grid-cols-2 xl:grid-cols-3">
              {coursesLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="aspect-[4/5] rounded-[3rem] bg-slate-50 border-none animate-pulse" />
                ))
              ) : filteredAndSortedCourses.map((course, idx) => (
                <Dialog key={course.id}>
                  <DialogTrigger asChild>
                    <div className="group relative rounded-[3.5rem] overflow-hidden bg-white border border-slate-50 shadow-sm cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="h-80 w-full overflow-hidden relative">
                        <Image
                          src={course.imageUrl}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                        />
                        <div className="absolute top-8 left-8">
                          <Badge className="bg-[#0B1F3A]/90 backdrop-blur-md border-none text-white font-black text-[9px] uppercase px-4 py-2 tracking-[0.2em] rounded-full">
                            {course.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-10 flex flex-col flex-grow relative z-10 bg-white">
                        <div className="flex items-center gap-1.5 mb-6">
                          <div className="flex">{renderStars(course.rating)}</div>
                          <span className="text-[9px] font-black text-slate-300 tracking-widest">({course.reviews})</span>
                        </div>

                        <h3 className="text-2xl font-serif text-[#0B1F3A] leading-tight group-hover:text-[#1F7A5A] transition-colors mb-8">{course.title}</h3>

                        <div className="mt-auto">
                          <div className="pt-8 border-t border-slate-50 flex items-center justify-between text-[9px] uppercase font-black tracking-widest text-slate-300 mb-8">
                            <div className="flex items-center gap-2">
                              <Clock3 className="w-4 h-4 text-[#1F7A5A]" />
                              <span>{course.duration} Weeks</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#0B1F3A]" />
                              <span>{course.level}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-3xl font-serif text-[#0B1F3A] tracking-tighter">₦{course.price.toLocaleString()}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#0B1F3A] group-hover:text-white transition-all duration-500">
                               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-7xl p-0 overflow-hidden rounded-[4rem] border-none shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
                    <div className="flex flex-col">
                      {/* Dark Luxury Header */}
                      <div className="bg-[#0B1F3A] p-12 md:p-24 lg:pr-[450px] text-white relative">
                        <div className="absolute inset-0 opacity-10">
                           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A96A]/20 blur-[100px] rounded-full" />
                        </div>

                        <div className="relative z-10 space-y-8">
                          <div className="flex flex-wrap gap-3">
                            <Badge className="bg-white/10 backdrop-blur-xl text-[#C8A96A] border-none px-4 py-2 font-black text-[9px] uppercase tracking-widest h-auto rounded-full">
                              {course.category}
                            </Badge>
                            <Badge className="bg-[#1F7A5A]/20 text-emerald-400 border-none px-4 py-2 font-black text-[9px] uppercase tracking-widest h-auto rounded-full">
                               {course.level} Distinction
                            </Badge>
                          </div>

                          <DialogTitle asChild>
                            <h2 className="text-4xl md:text-7xl font-serif tracking-tight leading-[1.1] max-w-3xl">{course.title}</h2>
                          </DialogTitle>
                          <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">{course.description}</p>

                          <div className="flex flex-wrap items-center gap-8 text-sm font-bold">
                            <div className="flex items-center gap-2 text-[#C8A96A]">
                              <span className="text-2xl font-black">{course.rating}</span>
                              <div className="flex">{renderStars(course.rating)}</div>
                              <span className="text-white/40 ml-2 font-medium">({course.reviews.toLocaleString()} global reviews)</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-white/10">
                                 <AvatarImage src={course.instructor?.avatarUrl} />
                                 <AvatarFallback className="bg-white/5 text-white">{getInitials(course.instructor?.name || '')}</AvatarFallback>
                              </Avatar>
                              <span>Faculty: <span className="text-white underline decoration-[#C8A96A] underline-offset-8 cursor-pointer">{course.instructor?.name || 'Academic Board'}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-[#1F7A5A]" />
                              <span>Global Enrollment</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sticky Purchase Card (Desktop) */}
                      <div className="hidden lg:block absolute top-[120px] right-12 w-[380px] bg-white rounded-[3rem] shadow-2xl border border-slate-50 p-2 z-50">
                        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden group cursor-pointer">
                          <Image src={course.imageUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[0.2]" />
                          <div className="absolute inset-0 bg-[#0B1F3A]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-700">
                              <PlayCircle className="w-12 h-12 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="p-10 space-y-10">
                          <div className="flex flex-col">
                            <span className="text-5xl font-serif text-[#0B1F3A] tracking-tighter mb-2">₦{course.price.toLocaleString()}</span>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Single Program Investment</p>
                          </div>

                          <div className="space-y-4">
                            <Button className="w-full h-16 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all" onClick={() => handleEnrollClick(course)}>
                              Authorize Enrollment
                            </Button>
                            <Button variant="outline" className="w-full h-16 border-slate-100 text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50" onClick={() => handleEnrollClick(course)}>
                              Institutional Grant
                            </Button>
                          </div>

                          <div className="space-y-6 pt-10 border-t border-slate-50">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Program Deliverables:</h4>
                            <div className="space-y-5">
                              {[
                                { icon: Clock3, text: `${course.duration * 4} Lecture Hours` },
                                { icon: FileText, text: 'Executive Case Studies' },
                                { icon: Briefcase, text: 'Industry Practicum' },
                                { icon: Trophy, text: 'Certificate of Distinction' }
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                  <item.icon className="w-5 h-5 text-[#C8A96A]" />
                                  <span>{item.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Body Content */}
                      <div className="p-10 md:p-24 lg:pr-[480px] bg-white grid gap-20">
                        <section className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-5">
                              <Star size={100} className="text-[#C8A96A]" />
                           </div>
                          <h3 className="text-[10px] font-black text-[#0B1F3A] tracking-[0.3em] mb-12 uppercase">Learning Objectives</h3>
                          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                            {[
                              'Master executive-level protocols and institutional standards.',
                              'Direct high-efficiency systems with global authority.',
                              'Refine professional conduct to international luxury standards.',
                              'Orchestrate complex project lifecycles with precision.',
                              'Acquire credentials recognized by world-class organizations.',
                              'Synthesize academic theory with high-impact practice.'
                            ].map((desc, i) => (
                              <div key={i} className="flex gap-5">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                   <CheckCircle className="w-4 h-4 text-[#1F7A5A]" />
                                </div>
                                <span className="text-sm font-bold text-slate-600 leading-snug">{desc}</span>
                              </div>
                            ))}
                          </div>
                        </section>

                        <div className="lg:hidden">
                          <div className="p-10 bg-[#0B1F3A] rounded-[3rem] text-center space-y-8 shadow-2xl">
                             <div>
                                <span className="text-5xl font-serif text-white tracking-tighter block mb-2">₦{course.price.toLocaleString()}</span>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total Program Investment</span>
                             </div>
                             <Button className="w-full h-16 bg-[#C8A96A] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl" onClick={() => handleEnrollClick(course)}>Authorize Enrollment</Button>
                          </div>
                        </div>

                        <section>
                          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                              <h3 className="text-3xl font-serif text-[#0B1F3A] tracking-tight mb-2">Curriculum Structure</h3>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{course.curriculum?.length || 0} Modules • {course.duration * 4} Total Credit Hours</p>
                            </div>
                            <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-[#1F7A5A] hover:bg-emerald-50 px-6 h-10 rounded-full">Expand Syllabus</Button>
                          </div>

                          <div className="grid gap-4">
                            {course.curriculum?.map((item, i) => (
                              <div key={i} className="group p-8 rounded-[2rem] border border-slate-50 hover:border-[#1F7A5A]/20 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-[#0B1F3A] group-hover:text-white transition-all">
                                    0{i + 1}
                                  </div>
                                  <span className="text-base font-bold text-slate-700">{item}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                     <Video size={14} className="text-[#C8A96A]" />
                                     Distinction Lecture
                                  </div>
                                  <PlayCircle className="w-6 h-6 text-slate-200 group-hover:text-[#1F7A5A] transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="pt-20 border-t border-slate-100">
                          <h3 className="text-[10px] font-black text-[#0B1F3A] tracking-[0.3em] mb-16 uppercase text-center">Faculty Leadership</h3>
                          <div className="flex flex-col md:flex-row gap-16 items-center md:items-start text-center md:text-left">
                            <div className="shrink-0">
                              <Avatar className="h-56 w-56 ring-[12px] ring-slate-50 shadow-2xl">
                                <AvatarImage src={course.instructor?.avatarUrl} />
                                <AvatarFallback className="text-3xl font-serif">{getInitials(course.instructor?.name || '')}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="space-y-8">
                              <div>
                                <h4 className="text-4xl font-serif text-[#0B1F3A] mb-4">{course.instructor?.name || 'Board of Regents'}</h4>
                                <p className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.3em]">Senior Faculty • Ashford & Gray Academy</p>
                              </div>
                              <div className="flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                     <Star className="w-5 h-5 text-[#C8A96A] fill-[#C8A96A]" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">4.9 Authority Rating</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                     <Award className="w-5 h-5 text-[#1F7A5A]" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distinguished Fellow</span>
                                </div>
                              </div>
                              <p className="text-xl text-slate-500 font-medium leading-relaxed italic max-w-2xl">
                                "Our programs are not merely courses of study; they are pathways to global distinction. We mentor the next generation of leaders with the same precision and authority we apply to the world's most elite industries."
                              </p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            {filteredAndSortedCourses.length === 0 && !coursesLoading && (
              <div className="text-center py-40 bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-100 mt-20">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-10">
                   <Search className="w-10 h-10 text-slate-100" />
                </div>
                <h3 className="text-3xl font-serif text-[#0B1F3A] tracking-tight mb-4">No Distinguished Programs Found</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-12 leading-relaxed">Your current criteria did not yield any results from our registry. Please refine your search parameters.</p>
                <Button variant="outline" onClick={clearAllFilters} className="h-16 px-12 rounded-2xl border-slate-200 text-[#0B1F3A] font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">Reset Catalog Registry</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Path Recommendation */}
      <section className="mt-40 container px-6 mx-auto">
        <div className="bg-[#0B1F3A] rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden text-white shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8A96A]/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 space-y-12">
            <h2 className="text-4xl md:text-7xl font-serif tracking-tight leading-none">Determine Your <br /><span className="italic text-[#C8A96A]">Next Elevation.</span></h2>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">Engage with our admissions board to find the program that aligns with your professional aspirations.</p>
            <div className="flex flex-wrap justify-center gap-6">
               <Button asChild className="h-20 px-16 rounded-[2rem] bg-[#C8A96A] hover:bg-[#B69759] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all">
                 <Link href="/login?view=signup">Begin Application</Link>
               </Button>
               <Button variant="outline" className="h-20 px-16 rounded-[2rem] border-white/10 text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-[0.3em] transition-all">
                  Consult Advisor
               </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

