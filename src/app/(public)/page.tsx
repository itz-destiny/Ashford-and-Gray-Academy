
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowRight, 
  BookOpen, 
  Star, 
  Users, 
  PlayCircle,
  Palette,
  Briefcase,
  Code,
  Megaphone,
  BarChart,
  Camera,
  Music,
  Cpu,
  Quote,
  GraduationCap,
  Handshake,
  Wrench,
  Video
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import type { Course } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {
  const firestore = useFirestore();
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  const trendingCoursesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'), limit(4));
  }, [firestore]);

  const allCoursesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'));
  }, [firestore]);


  const { data: trendingCourses, loading: coursesLoading } = useCollection<Course>(trendingCoursesQuery);
  const { data: allCourses } = useCollection<Course>(allCoursesQuery);

  const categories = useMemo(() => {
    if (!allCourses) return [];
    const categoryMap = new Map<string, React.ElementType>();
    const iconMap: { [key: string]: React.ElementType } = {
      'Hospitality': Handshake,
      'Facilities Management': Wrench,
      'Business': Briefcase,
      'Art & Design': Palette,
      'Finance': BarChart,
      'Graphic': Code,
      'Programming': Code,
      'Marketing': Megaphone,
      'Technology': Cpu,
      'Photography': Camera,
      'Music': Music,
    };

    allCourses.forEach(course => {
      if (!categoryMap.has(course.category)) {
        categoryMap.set(course.category, iconMap[course.category] || BookOpen);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, Icon]) => ({ name, icon: Icon }));
  }, [allCourses]);

  const testimonials = [
    {
      id: 1,
      quote: "The course structure and mentor support at Ashford & Gray are second to none. I was able to transition into a new career with confidence and a strong portfolio. Highly recommended for anyone serious about skilling up.",
      name: 'Devon Lane',
      title: 'UI/UX Designer at Google',
      avatarUrl: "https://picsum.photos/seed/testimonial-person/100"
    },
    {
      id: 2,
      quote: "An incredible learning experience. The instructors are top-notch, and the curriculum is perfectly aligned with industry demands. I landed a promotion just months after completing my course.",
      name: 'Sarah Jenkins',
      title: 'Senior Developer at Microsoft',
      avatarUrl: "https://picsum.photos/seed/testimonial-person-2/100"
    },
    {
      id: 3,
      quote: "This platform transformed my understanding of digital marketing. The practical, hands-on projects were invaluable. The community is vibrant and supportive, which made a huge difference.",
      name: 'Michael Chen',
      title: 'Marketing Lead at Amazon',
      avatarUrl: "https://picsum.photos/seed/testimonial-person-3/100"
    },
  ]

  React.useEffect(() => {
    if (!carouselApi) {
      return
    }
 
    setCurrent(carouselApi.selectedScrollSnap() + 1)
 
    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1)
    })
  }, [carouselApi])

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-accent text-white py-20 md:py-32 overflow-hidden">
         <div 
          className="absolute inset-0 bg-no-repeat bg-cover" 
          style={{ backgroundImage: "url('/wavy-background.svg')", opacity: 0.1, backgroundSize: '150%'}}
        ></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="motion-safe:animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
                Master New Skills, Advance with Confidence
              </h1>
              <p className="mt-6 text-lg text-white/80">
                Join thousands of learners and experts on a journey of growth, knowledge, and excellence.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/courses">Start Learning Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-accent">
                  <PlayCircle className="mr-2" />
                  Watch Video
                </Button>
              </div>
            </div>
            <div className="relative motion-safe:animate-fade-in duration-500 [animation-delay:0.2s] hidden md:block">
              <Image
                src="https://picsum.photos/seed/hero-person/500"
                alt="A confident professional woman with a laptop"
                width={500}
                height={500}
                className="rounded-full aspect-square object-cover"
                data-ai-hint="professional woman"
              />
              <div className="absolute top-1/4 -left-16 bg-white/10 backdrop-blur-md p-3 rounded-lg shadow-lg text-sm">
                <p className="font-bold">✨ Expert-led Course</p>
              </div>
               <div className="absolute bottom-1/4 -right-10 bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg text-sm">
                <div className="flex items-center gap-2">
                   <Avatar>
                      <AvatarImage src="https://picsum.photos/seed/mentor1/100" />
                      <AvatarFallback>DL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">Devon Lane</p>
                      <p className="text-xs">UI/UX Mentor</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-white" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}></div>
      </section>

      {/* Strategy Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative flex justify-center items-center">
                <div className="bg-primary/10 rounded-full p-4">
                  <Image
                      src="https://picsum.photos/seed/strategy-person/400"
                      alt="A smiling student holding books"
                      width={400}
                      height={400}
                      className="rounded-full shadow-xl"
                      data-ai-hint="smiling student"
                  />
                </div>
                 <div className="absolute -top-4 -left-4 bg-white p-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500 w-5 h-5"/>
                    <span className="font-bold">4.9 Star Rating</span>
                 </div>
                 <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
                    <GraduationCap className="text-primary w-5 h-5"/>
                    <span className="font-bold">20k+ Students</span>
                 </div>
            </div>
             <div>
                <p className="text-primary font-semibold text-sm">FEATURES</p>
                <h2 className="text-3xl font-bold font-headline mt-2">The Strategy for Exponential Learning Growth</h2>
                <p className="mt-4 text-muted-foreground">We are a modern learning platform that provides you with the best online courses and resources. Our goal is to help you achieve your career goals.</p>
                <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-full"><Users/></div>
                        <p className="font-semibold">Expert Mentor</p>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-full"><BookOpen/></div>
                        <p className="font-semibold">Effective Method</p>
                    </div>
                </div>
                 <Button className="mt-8" asChild><Link href="/about">Read More</Link></Button>
            </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-headline">Explore Our Categories</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">We offer a wide range of courses in various fields. Choose the one that best fits your career goals.</p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 justify-center">
            {categories.map((cat) => (
              <div key={cat.name} className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                <div className="bg-primary/10 text-primary p-4 rounded-lg">
                  <cat.icon className="w-8 h-8" />
                </div>
                <p className="font-semibold text-sm">{cat.name}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-12" asChild>
            <Link href="/courses">View All Categories</Link>
          </Button>
        </div>
      </section>
      
      {/* Trending Courses Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-lg tracking-wider">TOP COURSES</p>
            <h2 className="text-3xl font-bold font-headline mt-2">A Journey Built on Knowledge, Growth, and Excellence</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-background overflow-hidden group motion-safe:animate-fade-in-up" style={{ animationDelay: `${'index * 0.1 + 0.1'}s` }}>
                  <Skeleton className="w-full h-40" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-9 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              trendingCourses?.map((item, index) => (
                <Card key={item.id} className="bg-background overflow-hidden group motion-safe:animate-fade-in-up" style={{ animationDelay: `${'index * 0.1 + 0.1'}s` }}>
                  <div className="relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={item.imageHint}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center text-xs">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">{item.category}</Badge>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {item.rating}
                        </div>
                    </div>
                    <h3 className="font-semibold truncate group-hover:text-primary mt-2">{item.title}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <p className="font-bold text-lg text-primary">${item.price}</p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses?dialog=${'item.id'}`}>View Details <ArrowRight className="ml-2 h-4 w-4"/></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Live Class Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div>
                <p className="text-primary font-semibold text-sm">LIVE SESSIONS</p>
                <h2 className="text-3xl font-bold font-headline mt-2">Join Our Live Classes</h2>
                <p className="mt-4 text-muted-foreground">Engage with instructors in real-time, ask questions, and collaborate with peers. Our interactive live classes provide an immersive learning experience that helps you master new skills faster.</p>
                 <Button className="mt-8" asChild><Link href="/events">Browse Live Classes</Link></Button>
            </div>
             <div className="relative flex justify-center items-center">
                <Image
                    src="https://picsum.photos/seed/liveclass/600/400"
                    alt="A teacher interacting with students in a live online class"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-xl"
                    data-ai-hint="live online class"
                />
                 <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
                    <Video className="text-red-500 w-5 h-5"/>
                    <span className="font-bold">Live Now: Quantum Physics</span>
                 </div>
            </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm">TESTIMONIAL</p>
            <h2 className="text-3xl font-bold font-headline mt-2">What Clients Have to Say About Us</h2>
          </div>
            <Carousel 
                setApi={setCarouselApi}
                plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                className="max-w-3xl mx-auto"
            >
                <CarouselContent>
                    {testimonials.map((t) => (
                      <CarouselItem key={t.id}>
                        <Card className="p-8 text-center bg-white shadow-xl">
                           <Image src={t.avatarUrl} alt={t.name} width={80} height={80} className="rounded-full mx-auto" data-ai-hint="person portrait" />
                           <Quote className="w-12 h-12 text-primary/20 mx-auto mt-6" />
                          <p className="text-muted-foreground text-lg mt-4">"{t.quote}"</p>
                          <div className="mt-6">
                            <div className="flex items-center justify-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                            <p className="font-bold mt-4">{t.name}</p>
                            <p className="text-sm text-muted-foreground">{t.title}</p>
                          </div>
                        </Card>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                 <div className="flex justify-center gap-2 mt-6">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => carouselApi?.scrollTo(i)}
                            className={`h-2 w-2 rounded-full ${'i === current - 1' ? 'bg-primary' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </Carousel>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary/90 text-primary-foreground p-12 rounded-lg text-center relative overflow-hidden">
                 <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
                 <div className="absolute -bottom-12 -right-8 w-40 h-40 bg-white/10 rounded-full"></div>
                 <div className="relative z-10">
                    <h2 className="text-3xl font-bold font-headline">Subscribe Our Newsletter</h2>
                    <p className="mt-2 text-white/80 max-w-xl mx-auto">Join our subscribers list to get the latest news, updates, and special offers delivered directly in your inbox.</p>
                    <div className="mt-6 flex max-w-md mx-auto">
                        <input type="email" placeholder="Your email address" className="w-full rounded-l-md px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary" />
                        <Button variant="secondary" className="rounded-l-none text-black">Subscribe</Button>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </>
  );
}

    