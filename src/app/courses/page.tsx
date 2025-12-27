
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
import { Slider } from "@/components/ui/slider";
import { mockCourses } from "@/lib/data";
import { BookOpen, Building, CheckCircle, Code, DollarSign, PenTool, Search, Star, TrendingUp, User, Video } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function CoursesPage() {

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
    { id: 'business', label: 'Business', icon: Building },
    { id: 'technology', label: 'Technology', icon: Code },
    { id: 'design', label: 'Design', icon: PenTool },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp },
    { id: 'data-science', label: 'Data Science', icon: Code },
    { id: 'personal-dev', label: 'Personal Development', icon: User },
  ]

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="py-16 text-center bg-secondary rounded-lg">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Explore Our Courses</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover skills that advance your career. Find the perfect course to help you grow.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search courses, topics, or instructors..." className="h-14 pl-12 text-base" />
              </div>
              <Button size="lg" className="h-14 rounded-l-none">Search</Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="rounded-full">Web Development</Button>
              <Button variant="outline" className="rounded-full">Data Science</Button>
              <Button variant="outline" className="rounded-full">UI/UX Design</Button>
              <Button variant="outline" className="rounded-full">Marketing</Button>
              <Button variant="outline" className="rounded-full">Business</Button>
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
                    <Checkbox id={cat.id} />
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
              <RadioGroup defaultValue="all">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-levels" />
                    <Label htmlFor="all-levels" className="font-normal">All Levels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="font-normal">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="font-normal">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
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
                 <div className="flex items-center space-x-2">
                    <Checkbox id="under-4" />
                    <Label htmlFor="under-4" className="font-normal">Under 4 weeks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="4-8-weeks" />
                    <Label htmlFor="4-8-weeks" className="font-normal">4-8 weeks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="8-12-weeks" />
                    <Label htmlFor="8-12-weeks" className="font-normal">8-12 weeks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="12-plus-weeks" />
                    <Label htmlFor="12-plus-weeks" className="font-normal">12+ weeks</Label>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Range Filter */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <Slider defaultValue={[50]} max={500} step={10} />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>$0</span>
                <span>$500</span>
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
                    <Checkbox id={`rating-${rating}`} />
                    <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 font-normal cursor-pointer">
                      {renderStars(rating)}
                      <span className="text-muted-foreground">& up</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full">Clear All Filters</Button>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-muted-foreground">Showing {mockCourses.length} courses</p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort">Sort by:</Label>
              <Select defaultValue="popular">
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
            {mockCourses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden group">
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
                     <Button variant="outline">Enroll Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
