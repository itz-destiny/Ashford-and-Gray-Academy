
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, BookOpen, Calendar, CheckCircle2, Download, HelpCircle, Library, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useMemo } from "react";
import { collection, query, where, limit } from "firebase/firestore";
import type { Course, Enrollment } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const enrolledCoursesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'enrollments'),
      where('userId', '==', user.uid),
      limit(2)
    );
  }, [firestore, user]);

  const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(enrolledCoursesQuery);
  
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, {user?.displayName?.split(' ')[0]}</h1>
              <p className="text-muted-foreground">You have 2 upcoming deadlines and 1 live session today.</p>
          </div>
          <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register for Event
          </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
            <BarChart className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Calendar className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="p-6 flex-1">
                 <Badge variant="destructive" className="mb-2">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Live Now
                </Badge>
                <h2 className="text-2xl font-bold font-headline">Physics 101 - Advanced Mechanics</h2>
                <p className="text-muted-foreground mt-1">Starts in 15 mins • Prof. Richard Feynman</p>
                <div className="mt-6 flex gap-4">
                    <Button>Join Session</Button>
                    <Button variant="outline">View Materials</Button>
                </div>
              </div>
              <div className="flex-shrink-0 md:w-2/5">
                <Image 
                  src="https://picsum.photos/seed/physics/600/400"
                  alt="Chalkboard with physics equations"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  data-ai-hint="physics equations chalkboard"
                />
              </div>
            </div>
          </Card>

           <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Enrolled Courses</h2>
              <Button variant="link" asChild>
                <Link href="/my-courses">View All</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {enrollmentsLoading ? (
                 Array.from({ length: 2 }).map((_, index) => (
                    <Card key={index}>
                      <Skeleton className="h-40 w-full rounded-t-lg" />
                      <CardHeader>
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full mt-2" />
                      </CardHeader>
                      <CardContent>
                          <Skeleton className="h-6 w-1/2" />
                      </CardContent>
                      <CardFooter>
                          <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                 ))
              ) : (
                enrollments?.map((enrollment) => (
                    enrollment.course && (
                    <Card key={enrollment.id}>
                        <CardHeader>
                        <Image 
                            src={enrollment.course.imageUrl}
                            alt={enrollment.course.title}
                            width={600}
                            height={400}
                            className="w-full h-40 object-cover rounded-t-lg mb-4"
                            data-ai-hint={enrollment.course.imageHint}
                        />
                        <CardDescription className="uppercase font-semibold tracking-wider text-primary">{enrollment.course.category}</CardDescription>
                        <CardTitle>{enrollment.course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground pt-2">{enrollment.course.description}</p>
                        </CardHeader>
                        <CardContent>
                        <div>
                            <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-muted-foreground">Progress</span>
                            <span>{enrollment.course.progress || 0}%</span>
                            </div>
                            <Progress value={enrollment.course.progress || 0} aria-label={`${enrollment.course.title} progress`} />
                        </div>
                        </CardContent>
                        <CardFooter>
                        <Button variant="outline" className="w-full">Resume Course</Button>
                        </CardFooter>
                    </Card>
                    )
                ))
              )}
               {!enrollmentsLoading && enrollments?.length === 0 && (
                <p className="text-muted-foreground sm:col-span-2">You are not enrolled in any courses yet.</p>
              )}
            </div>
          </div>
        </main>
        
        <aside className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-4">
                            <div className="text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
                                <p className="text-xs text-red-600 dark:text-red-300 font-bold">TODAY</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-400">12</p>
                            </div>
                            <div>
                                <p className="font-semibold">Physics 101 Live</p>
                                <p className="text-sm text-muted-foreground">10:00 AM - 11:30 AM</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="text-center bg-muted p-2 rounded-md">
                                <p className="text-xs text-muted-foreground font-bold">TOM</p>
                                <p className="text-lg font-bold">13</p>
                            </div>
                            <div>
                                <p className="font-semibold">UX Design Workshop</p>
                                <p className="text-sm text-muted-foreground">02:00 PM - 04:00 PM</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="text-center bg-muted p-2 rounded-md">
                                <p className="text-xs text-muted-foreground font-bold">FRI</p>
                                <p className="text-lg font-bold">15</p>
                            </div>
                            <div>
                                <p className="font-semibold">Campus Career Fair</p>
                                <p className="text-sm text-muted-foreground">Main Hall</p>
                            </div>
                        </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-6">View Full Calendar</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Assignments</CardTitle>
                    <Badge variant="secondary">2 Pending</Badge>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        <li className="p-3 bg-muted/50 rounded-md">
                            <p className="text-sm text-muted-foreground">Design History</p>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">Essay: Evolution of Bauhaus</p>
                                <p className="text-sm font-medium text-red-500">Due Tomorrow</p>
                            </div>
                        </li>
                         <li className="p-3 bg-muted/50 rounded-md">
                            <p className="text-sm text-muted-foreground">Data Science</p>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">Python Quiz 2</p>
                                <p className="text-sm font-medium text-muted-foreground">In 3 days</p>
                            </div>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Resources</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <Library className="w-5 h-5 text-muted-foreground" />
                            <Link href="#" className="hover:underline text-sm">University Library</Link>
                        </li>
                        <li className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-muted-foreground" />
                            <Link href="#" className="hover:underline text-sm">Student Support</Link>
                        </li>
                        <li className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-muted-foreground" />
                            <Link href="#" className="hover:underline text-sm">Download Syllabus</Link>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}

