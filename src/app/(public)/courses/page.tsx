

"use client";

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
  DialogFooter,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider";
import { mockCourses } from "@/lib/data";
import { BookOpen, Briefcase, CheckCircle, Handshake, Search, Star, Video, Wrench, Building, Lightbulb, Users, BarChart, FileText } from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import type { Course } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

export default function CoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("popular");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([500]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);


  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };
  
  const filterCategories = [
    { id: 'Hospitality', label: 'Hospitality', icon: Handshake },
    { id: 'Facilities Management', label: 'Facilities Management', icon: Wrench },
    { id: 'Business', label: 'Business', icon: Briefcase },
  ];

  const quickSearchCategories = [
    'Hospitality',
    'Facilities Management',
    'Business',
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

  const handleEnrollClick = (courseTitle: string) => {
    if (!user) {
      router.push(`/login?redirectUrl=${pathname}`);
    } else {
      toast({
        title: "Successfully Enrolled!",
        description: `You have been enrolled in "${courseTitle}".`,
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortOrder("popular");
    setSelectedCategories([]);
    setSelectedDifficulty("all");
    setSelectedDurations([]);
    setPriceRange([500]);
    setSelectedRatings([]);
  };
  
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = mockCourses.filter(course => {
      // Search query filter
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  }, [searchQuery, sortOrder, selectedCategories, selectedDifficulty, selectedDurations, priceRange, selectedRatings]);


  const durationFilters = [
    { id: 'under-4', label: 'Under 4 weeks' },
    { id: '4-8-weeks', label: '4-8 weeks' },
    { id: '8-12-weeks', label: '8-12 weeks' },
    { id: '12-plus-weeks', label: '12+ weeks' }
  ];


  return (
    <div className="space-y-8">
      <header className="py-16 text-center bg-secondary">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Explore Our Courses</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover skills that advance your career. Find the perfect course to help you grow.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search courses, topics, or instructors..." 
                  className="h-14 pl-12 text-base" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-14 rounded-l-none">Search</Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickSearchCategories.map(cat => (
                    <Button 
                      key={cat} 
                      variant={selectedCategories.includes(cat) ? "default" : "outline"} 
                      className="rounded-full"
                      onClick={() => handleCategoryChange(cat)}
                    >
                      {cat}
                    </Button>
                ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-8">
          {/* Categories Filter */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-3">
                {filterCategories.map(cat => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={cat.id} 
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => handleCategoryChange(cat.id)}
                    />
                    <Label htmlFor={cat.id} className="flex items-center gap-2 font-normal cursor-pointer">
                      <cat.icon className="w-4 h-4 text-muted-foreground" />
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Difficulty Level Filter */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Difficulty Level</h3>
              <RadioGroup value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-levels" />
                    <Label htmlFor="all-levels" className="font-normal">All Levels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Beginner" id="beginner" />
                    <Label htmlFor="beginner" className="font-normal">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="font-normal">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Advanced" id="advanced" />
                    <Label htmlFor="advanced" className="font-normal">Advanced</Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

           {/* Duration Filter */}
           <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Duration</h3>
              <div className="space-y-3">
                 {durationFilters.map(d => (
                    <div key={d.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={d.id} 
                        checked={selectedDurations.includes(d.id)}
                        onCheckedChange={() => handleDurationChange(d.id)}
                      />
                      <Label htmlFor={d.id} className="font-normal">{d.label}</Label>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range Filter */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <Slider 
                value={priceRange} 
                onValueChange={setPriceRange} 
                max={500} 
                step={10} 
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>$0</span>
                <span>${priceRange[0]}</span>
              </div>
            </CardContent>
          </Card>

          {/* Rating Filter */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Rating</h3>
              <div className="space-y-3">
                {[4, 3, 2].map(rating => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`rating-${rating}`} 
                      checked={selectedRatings.includes(rating)}
                      onCheckedChange={() => handleRatingChange(rating)}
                    />
                    <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 font-normal cursor-pointer">
                      {renderStars(rating)}
                      <span className="text-muted-foreground">& up</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full" onClick={clearAllFilters}>Clear All Filters</Button>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-muted-foreground">Showing {filteredAndSortedCourses.length} of {mockCourses.length} courses</p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort">Sort by:</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sort" className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAndSortedCourses.map((course) => (
               <Dialog key={course.id}>
                <DialogTrigger asChild>
                  <Card className="flex flex-col overflow-hidden group cursor-pointer">
                    <div className="relative">
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={600}
                        height={400}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={course.imageHint}
                      />
                      <Badge className="absolute top-3 left-3 bg-primary/80 backdrop-blur-sm">{course.category}</Badge>
                    </div>
                    <CardContent className="flex-grow pt-4 flex flex-col">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={course.instructor.avatarUrl} />
                            <AvatarFallback>{getInitials(course.instructor.name)}</AvatarFallback>
                        </Avatar>
                        <span>{course.instructor.name}</span>
                        {course.instructor.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <span className="font-bold text-yellow-600">{course.rating.toFixed(1)}</span>
                        <div className="flex">{renderStars(course.rating)}</div>
                        <span className="text-sm text-muted-foreground">({course.reviews})</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.duration} weeks</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          <span>{course.level}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-end justify-between flex-grow">
                        <div>
                            <p className="text-2xl font-bold">${course.price}</p>
                            {course.originalPrice && <p className="text-sm text-muted-foreground line-through">${course.originalPrice}</p>}
                        </div>
                        <Button variant="outline" className="pointer-events-none">Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover rounded-lg"
                        data-ai-hint={course.imageHint}
                      />
                    </div>
                    <div className="flex flex-col">
                      <DialogHeader>
                        <Badge className="w-fit">{course.category}</Badge>
                        <DialogTitle className="text-3xl font-headline mt-2">{course.title}</DialogTitle>
                        <DialogDescription className="text-base">{course.description}</DialogDescription>
                      </DialogHeader>
                      
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={course.instructor.avatarUrl} />
                            <AvatarFallback>{getInitials(course.instructor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>Taught by <span className="font-semibold text-foreground">{course.instructor.name}</span></p>
                          {course.instructor.verified && <div className="flex items-center gap-1 text-xs text-blue-500"><CheckCircle className="w-3 h-3"/> Verified Instructor</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">{course.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({course.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>{course.duration} weeks</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{course.level}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 flex flex-col gap-2">
                        <p className="text-4xl font-bold">${course.price} {course.originalPrice && <span className="text-xl text-muted-foreground line-through ml-2">${course.originalPrice}</span>}</p>
                        <Button size="lg" className="w-full" onClick={() => handleEnrollClick(course.title)}>Enroll Now</Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
             {filteredAndSortedCourses.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3 text-center py-16">
                <h3 className="text-xl font-semibold">No Courses Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                <Button variant="link" onClick={clearAllFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

       <section className="py-16 bg-primary/10">
        <div className="container text-center">
            <h2 className="text-3xl font-bold font-headline">Not sure where to start?</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Let us help you find the perfect course for your goals. Get personalized recommendations based on your interests and career aspirations.</p>
            <Button size="lg" className="mt-6">Get Personalized Recommendations</Button>
        </div>
      </section>
    </div>
  );
}

    