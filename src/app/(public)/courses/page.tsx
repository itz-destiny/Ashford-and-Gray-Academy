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
  Award
} from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import type { Course } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

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
          className={`w-4 h-4 ${i <= Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
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

  const handleDurationChange = (duration: string) => {
    setSelectedDurations(prev =>
      prev.includes(duration)
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    );
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
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
            title: "Successfully Enrolled!",
            description: `You have been enrolled in "${course.title}".`,
          });
        } else {
          throw new Error('Failed to enroll');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Enrollment Error",
          description: "There was a problem enrolling you in this course.",
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
      // Search query filter
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.instructor && course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || course.level === selectedDifficulty;

      // Duration filter
      const matchesDuration = selectedDurations.length === 0 || selectedDurations.some(d => {
        if (d === 'under-4') return course.duration < 4;
        if (d === '4-8-weeks') return course.duration >= 4 && course.duration <= 8;
        if (d === '8-12-weeks') return course.duration > 8 && course.duration <= 12;
        if (d === '12-plus-weeks') return course.duration > 12;
        return false;
      });

      // Price filter
      const matchesPrice = course.price <= priceRange[0];

      // Rating filter
      const matchesRating = selectedRatings.length === 0 || selectedRatings.some(r => course.rating >= r);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration && matchesPrice && matchesRating;
    });

    // Sorting logic
    switch (sortOrder) {
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
        // Assuming no date field, we'll just reverse for variety
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

  }, [courses, searchQuery, sortOrder, selectedCategories, selectedDifficulty, selectedDurations, priceRange, selectedRatings]);


  const durationFilters = [
    { id: 'under-4', label: 'Under 4 weeks' },
    { id: '4-8-weeks', label: '4-8 weeks' },
    { id: '8-12-weeks', label: '8-12 weeks' },
    { id: '12-plus-weeks', label: '12+ weeks' }
  ];


  return (
    <div className="bg-slate-50/50 min-h-screen pb-24">
      {/* Premium Hero Section */}
      <header className="relative py-24 px-6 md:py-32 overflow-hidden bg-slate-950">
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-[100%] h-[150%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute top-1/2 -right-1/4 w-[80%] h-[100%] bg-indigo-600/10 blur-[150px] rounded-full" />
          <div className="absolute inset-0 bg-[url('/wavy-background.svg')] bg-cover opacity-5 mix-blend-overlay" />
        </div>

        <div className="container relative z-10 text-center">
          <Badge variant="secondary" className="bg-white/10 text-blue-300 border-white/20 mb-6 px-4 py-1.5 backdrop-blur-md">
            🚀 Explore Our Courses
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter font-headline mb-6 leading-none">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Path</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
            Our programs are designed to help you succeed in your career. Choose from our wide range of professional courses and start learning today.
          </p>

          <div className="mt-12 max-w-2xl mx-auto">
            <div className="relative group bg-white/5 p-1.5 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl transition-all focus-within:border-blue-500/50">
              <div className="flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Search for a course, skill, or instructor..."
                    className="h-14 pl-14 bg-transparent border-none text-white text-base font-medium focus-visible:ring-0 placeholder:text-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="lg" className="h-14 px-8 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black">Search</Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {quickSearchCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                    selectedCategories.includes(cat)
                      ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 lg:px-12 -mt-10 relative z-20">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Refined Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-28">
              <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] backdrop-blur-3xl space-y-10">
                {/* Categories */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Categories</h3>
                  </div>
                  <div className="space-y-4">
                    {filterCategories.map(cat => (
                      <div key={cat.id} className="group flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={cat.id}
                            className="rounded-md border-slate-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            checked={selectedCategories.includes(cat.id)}
                            onCheckedChange={() => handleCategoryChange(cat.id)}
                          />
                          <Label htmlFor={cat.id} className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors cursor-pointer">
                            {cat.label}
                          </Label>
                        </div>
                        <cat.icon className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Difficulty */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Level</h3>
                  </div>
                  <RadioGroup value={selectedDifficulty} onValueChange={setSelectedDifficulty} className="space-y-4">
                    {[
                      { id: 'all', label: 'All Levels' },
                      { id: 'Beginner', label: 'Beginner' },
                      { id: 'Intermediate', label: 'Intermediate' },
                      { id: 'Advanced', label: 'Advanced' }
                    ].map(lv => (
                      <div key={lv.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={lv.id} id={lv.id} className="border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                        <Label htmlFor={lv.id} className="text-sm font-bold text-slate-600 cursor-pointer">{lv.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </section>

                {/* Investment Range */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Price Range</h3>
                    </div>
                    <span className="text-xs font-black text-slate-400 tracking-tighter">Under ₦{(priceRange[0] / 1000).toFixed(0)}k</span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={3000000}
                    step={50000}
                    className="cursor-pointer"
                  />
                </section>

                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              </div>

              {/* Promo Card */}
              <div className="mt-6 p-6 bg-slate-950 rounded-[2rem] overflow-hidden relative group">
                <div className="absolute inset-0 bg-blue-600/10 blur-[40px] rounded-full scale-150 group-hover:bg-blue-600/20 transition-all" />
                <div className="relative z-10">
                  <BarChart className="w-10 h-10 text-blue-400 mb-4" />
                  <h4 className="text-white font-black text-lg mb-2">Corporate Training?</h4>
                  <p className="text-slate-500 text-xs font-medium mb-6">Customized pathways for high-growth engineering and design teams.</p>
                  <Button className="w-full bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-black text-[10px] uppercase">Get Quote</Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Course Grid */}
          <main className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Available Programs</h2>
                <p className="text-sm font-bold text-slate-400 mt-1">
                  {coursesLoading ? <Skeleton className="h-4 w-32" /> : `Showing ${filteredAndSortedCourses.length} results`}
                </p>
              </div>
              <div className="flex items-center gap-4 group">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Order by:</span>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[200px] h-12 rounded-xl bg-white border-slate-100 shadow-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 font-bold">
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
              {coursesLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="aspect-[4/5] rounded-[2.5rem] bg-slate-100" />
                ))
              ) : filteredAndSortedCourses.map((course, idx) => (
                <Dialog key={course.id}>
                  <DialogTrigger asChild>
                    <div className="group relative aspect-[4/6] md:aspect-[4/5.5] rounded-[2.8rem] overflow-hidden bg-white border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 animate-in slide-in-from-bottom-5" style={{ animationDelay: `${idx * 100}ms` }}>
                      {/* Course Image */}
                      <div className="h-[45%] w-full overflow-hidden relative">
                        <Image
                          src={course.imageUrl}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-white/80 backdrop-blur-md border border-slate-100 text-slate-950 font-black text-[10px] uppercase px-3 py-1 scale-100 group-hover:scale-110 transition-all">
                            {course.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-8 flex flex-col h-[55%] relative z-10 bg-white">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex">{renderStars(course.rating)}</div>
                          <span className="text-[10px] font-black text-slate-400">({course.reviews})</span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors mb-4">{course.title}</h3>

                        <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            <span>{course.duration} Weeks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{course.level}</span>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-950 tracking-tighter">₦{course.price.toLocaleString()}</span>
                            {course.originalPrice && <span className="text-[10px] font-bold text-slate-400 line-through tracking-tighter">₦{course.originalPrice.toLocaleString()}</span>}
                          </div>
                          <Button variant="outline" className="h-10 px-5 rounded-xl border-slate-100 font-black text-[10px] group-hover:bg-slate-950 group-hover:text-white transition-all">
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-6xl p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.3)] bg-white max-h-[90vh] overflow-y-auto">
                    <div className="flex flex-col">
                      {/* Dark Udemy-style Header */}
                      <div className="bg-slate-950 p-10 md:p-16 lg:pr-[380px] text-white relative">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/10 hover:bg-white/20 text-blue-400 border-none px-3 font-black text-[10px] uppercase tracking-widest leading-none h-6">
                              {course.category}
                            </Badge>
                            {course.level === 'Advanced' && (
                              <Badge className="bg-amber-500/10 text-amber-500 border-none px-3 font-black text-[10px] uppercase tracking-widest leading-none h-6">
                                Expert Favorite
                              </Badge>
                            )}
                          </div>

                          <DialogTitle asChild>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] max-w-2xl">{course.title}</h2>
                          </DialogTitle>
                          <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">{course.description}</p>

                          <div className="flex flex-wrap items-center gap-6 text-sm font-bold">
                            <div className="flex items-center gap-1.5 text-yellow-500">
                              <span className="text-lg font-black">{course.rating}</span>
                              <div className="flex">{renderStars(course.rating)}</div>
                              <span className="text-slate-500">({course.reviews.toLocaleString()} reviews)</span>
                            </div>
                            <div className="text-slate-300">
                              {course.reviews * 12} students enrolled
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              <span>Created by <span className="text-white underline cursor-pointer">{course.instructor.name}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              <span>Last Updated 10/2023</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>English</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating Sidebar Content (Visible on Desktop) */}
                      <div className="hidden lg:block absolute top-[100px] right-12 w-[320px] bg-white rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-slate-100 p-1 z-50 overflow-hidden">
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden group cursor-pointer">
                          <Image src={course.imageUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PlayCircle className="w-10 h-10 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 inset-x-0 text-center text-white text-[10px] font-black uppercase tracking-widest shadow-xl">Preview this course</div>
                        </div>

                        <div className="p-8 space-y-6">
                          <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-slate-950">₦{course.price.toLocaleString()}</span>
                            {course.originalPrice && <span className="text-lg text-slate-400 line-through">₦{course.originalPrice.toLocaleString()}</span>}
                          </div>

                          <div className="space-y-3">
                            <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl" onClick={() => handleEnrollClick(course)}>
                              Buy Now
                            </Button>
                            <Button variant="outline" className="w-full h-14 border-slate-200 text-slate-950 font-black text-lg rounded-xl" onClick={() => handleEnrollClick(course)}>
                              Enroll with Subscription
                            </Button>
                          </div>

                          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">30-Day Money-Back Guarantee</p>

                          <div className="space-y-4 pt-6 border-t border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">This course includes:</h4>
                            <div className="space-y-3">
                              {[
                                { icon: Clock3, text: `${course.duration * 4} hours on-demand video` },
                                { icon: FileText, text: '18 articles' },
                                { icon: Briefcase, text: 'Practical projects & case studies' },
                                { icon: Smartphone, text: 'Access on mobile and TV' },
                                { icon: Trophy, text: 'Certificate of completion' }
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                                  <item.icon className="w-4 h-4 text-slate-400" />
                                  <span>{item.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Body Content */}
                      <div className="p-10 md:p-16 lg:pr-[420px] bg-white grid gap-16">
                        {/* Learning Objectives */}
                        <section className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                          <h3 className="text-2xl font-black text-slate-950 tracking-tight mb-8 uppercase text-[10px] tracking-widest">What you'll learn</h3>
                          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                            {[
                              'Master industry-standard protocols and best practices.',
                              'Implement high-efficiency systems in your workplace.',
                              'Lead complex teams with confident, professional etiquette.',
                              'Handle client relations and crisis situations with ease.',
                              'Earn a professional certification recognized globally.',
                              'Apply practical skills immediately through case studies.'
                            ].map((desc, i) => (
                              <div key={i} className="flex gap-4">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold text-slate-600 leading-tight">{desc}</span>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Mobile CTA (Visible only on mobile) */}
                        <div className="lg:hidden animate-in fade-in slide-in-from-bottom-4">
                          <div className="p-8 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 flex flex-col items-center gap-6">
                            <div className="text-3xl font-black text-slate-950">₦{course.price.toLocaleString()}</div>
                            <Button className="w-full h-16 bg-indigo-600 text-white font-black text-lg rounded-2xl" onClick={() => handleEnrollClick(course)}>Buy Now</Button>
                          </div>
                        </div>

                        {/* Course Content / Curriculum */}
                        <section>
                          <div className="flex justify-between items-end mb-8">
                            <div>
                              <h3 className="text-2xl font-black text-slate-950 tracking-tighter">Course Content</h3>
                              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{course.curriculum?.length || 0} Topics • {course.duration * 4} Hours Total</p>
                            </div>
                          </div>

                          <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                            {course.curriculum?.map((item, i) => (
                              <div key={i} className="group border-b border-slate-50 last:border-none">
                                <div className="flex items-center justify-between p-6 hover:bg-slate-50/80 transition-all cursor-pointer">
                                  <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                      {i + 1}
                                    </div>
                                    <span className="text-sm font-black text-slate-700 transition-colors">{item}</span>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Video Class</span>
                                    <PlayCircle className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Detailed Instructor */}
                        <section className="pt-16 border-t border-slate-100">
                          <h3 className="text-2xl font-black text-slate-950 tracking-tighter mb-10">Instructor</h3>
                          <div className="flex flex-col md:flex-row gap-10">
                            <div className="shrink-0 flex flex-col gap-6">
                              <Avatar className="h-40 w-40 ring-8 ring-slate-50 shadow-2xl">
                                <AvatarImage src={course.instructor.avatarUrl} />
                                <AvatarFallback>{getInitials(course.instructor.name)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <h4 className="text-3xl font-black text-slate-950 underline decoration-indigo-200 underline-offset-8 mb-4">{course.instructor.name}</h4>
                              <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-6">Master Instructor • Ashford & Gray Faculty</p>
                              <div className="flex gap-8 mb-8 text-sm font-black text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span>4.9 Instructor Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-emerald-500" />
                                  <span>89,230 Reviews</span>
                                </div>
                              </div>
                              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                {course.instructor.name} is a renowned expert in {course.category.toLowerCase()} and professional development. With over 15 years of industry experience, they have trained thousands of individuals worldwide, helping them achieve their career goals through practical, result-oriented teaching.
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
              <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 mt-12">
                <FileText className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Courses Found</h3>
                <p className="text-slate-400 font-bold mt-2 max-w-xs mx-auto">We couldn't find any courses that match your search. Try adjusting your filters.</p>
                <Button variant="ghost" onClick={clearAllFilters} className="mt-8 font-black hover:bg-slate-50">Clear Filters</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Path Recommendation */}
      <section className="mt-24 container px-6">
        <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden text-white shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-6">Not sure where to start?</h2>
            <p className="text-lg text-indigo-100/70 font-medium max-w-2xl mx-auto mb-10">Get a personalized learning plan based on your career goals and interests.</p>
            <Button className="h-16 px-10 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-black text-lg">Get Started</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

