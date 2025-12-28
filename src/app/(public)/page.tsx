

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, BookOpen, Calendar, GraduationCap, Lock, Monitor, Star, Users, Mail, Youtube, Twitter, Instagram, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const trendingContent = [
    {
      id: "1",
      type: "COURSE",
      rating: 4.8,
      title: "Advanced UI/UX Principles",
      description: "Master the art of user interface design with practical projects.",
      author: "By Sarah Jenkins",
      price: "$49.99",
      imageUrl: "https://picsum.photos/seed/course1/600/400",
      imageHint: "abstract gradient"
    },
    {
      id: "2",
      type: "EVENT",
      date: "Nov 24",
      title: "Global Tech Summit 2024",
      description: "Join industry leaders for a 3-day virtual conference on AI.",
      location: "Online",
      action: "Register",
      imageUrl: "https://picsum.photos/seed/event1/600/400",
      imageHint: "tech conference"
    },
    {
      id: "3",
      type: "COURSE",
      rating: 4.9,
      title: "Python for Data Science",
      description: "From zero to hero in Python with real-world data analysis.",
      author: "By Michael Chen",
      price: "$89.99",
      imageUrl: "https://picsum.photos/seed/course2/600/400",
      imageHint: "python code"
    },
    {
      id: "4",
      type: "WORKSHOP",
      date: "Dec 02",
      title: "Leadership in Crisis",
      description: "Interactive workshop on managing teams during...",
      location: "New York",
      action: "Details",
      imageUrl: "https://picsum.photos/seed/workshop1/600/400",
      imageHint: "team meeting"
    },
  ];

  const testimonials = [
    {
      id: 1,
      quote: "The structured learning path helped me transition into a new career within 3 months. The community support is incredible.",
      name: "Elena Rodriguez",
      title: "UX Designer",
      avatarUrl: "https://picsum.photos/seed/avatar1/100/100"
    },
    {
      id: 2,
      quote: "Managing events used to be a nightmare. This platform simplified everything from registration to feedback collection.",
      name: "James K.",
      title: "Event Organizer",
      avatarUrl: "https://picsum.photos/seed/avatar2/100/100"
    },
    {
      id: 3,
      quote: "As an instructor, the tools provided to create courses are intuitive and powerful. I can focus on teaching.",
      name: "Dr. Anita P.",
      title: "Professor",
      avatarUrl: "https://picsum.photos/seed/avatar3/100/100"
    }
  ]

  return (
    <>
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="motion-safe:animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Elevate Your Skills & Manage Events Seamlessly
            </h1>
            <p className="mt-6 text-lg text-foreground/80">
              The all-in-one platform for learners, educators, and event organizers. Join thousands of users achieving their goals today.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/courses">Explore Courses</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/events">Host an Event</Link>
              </Button>
            </div>
          </div>
          <div className="motion-safe:animate-fade-in duration-500 [animation-delay:0.2s]">
            <Image
              src="https://picsum.photos/seed/hero-team/600/450"
              alt="A team of young professionals collaborating around a table."
              width={600}
              height={450}
              className="rounded-lg shadow-xl"
              data-ai-hint="team collaboration"
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center motion-safe:animate-fade-in-up">
          <h2 className="text-3xl font-bold font-headline">Choose Your Path</h2>
          <p className="mt-2 text-muted-foreground">Sign in to your dedicated dashboard to get started</p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-left motion-safe:animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>For Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access over 500+ courses and track your learning progress with ease. Earn certificates and build your portfolio.
                </p>
                <Button variant="link" className="px-0 mt-4" asChild>
                  <Link href="/login">Sign Up as Student <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="text-left motion-safe:animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>For Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create courses, manage students, and share your expertise with the world. Monetize your skills.
                </p>
                <Button variant="link" className="px-0 mt-4" asChild>
                   <Link href="/login">Become an Instructor <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="text-left motion-safe:animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>For Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage events, approve courses, and oversee platform analytics. Control your institution's settings.
                </p>
                 <Button variant="link" className="px-0 mt-4" asChild>
                  <Link href="/login">Admin Login <Lock className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 motion-safe:animate-fade-in-up">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Trending Content</h2>
            <Button variant="link" asChild>
                <Link href="/courses">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="text-muted-foreground mb-12">Explore popular courses and upcoming events</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingContent.map((item, index) => (
              <Card key={item.id} className="overflow-hidden group motion-safe:animate-fade-in-up" style={{animationDelay: `${index * 0.1 + 0.1}s`}}>
                <div className="relative">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={item.imageHint}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                     <Badge variant="secondary" className="text-xs uppercase backdrop-blur-sm">{item.type}</Badge>
                     {item.rating && (
                        <Badge variant="secondary" className="flex items-center gap-1 backdrop-blur-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {item.rating}
                        </Badge>
                     )}
                     {item.date && item.type !== 'COURSE' && <Badge variant="secondary" className="backdrop-blur-sm">{item.date}</Badge>}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate group-hover:text-primary">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 h-10">{item.author || item.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    {item.price ? (
                      <p className="font-bold text-primary">{item.price}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4"/>
                        {item.location}
                      </p>
                    )}
                    <Button variant={item.action === 'Register' ? 'default' : 'outline'} size="sm">
                      {item.action || 'View'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center motion-safe:animate-fade-in-up">
          <h2 className="text-3xl font-bold font-headline">Trusted by 10,000+ Learners</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <Card key={t.id} className="p-6 text-left bg-background motion-safe:animate-fade-in-up" style={{animationDelay: `${index * 0.1 + 0.1}s`}}>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <Image src={t.avatarUrl} alt={t.name} width={40} height={40} className="rounded-full" data-ai-hint="person portrait" />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
