
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
import { useUser } from "@/firebase";
import React from "react";
import type { Enrollment, Registration } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useUser();

  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = React.useState(true);
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const fetchEnrollments = async () => {
      try {
        const res = await fetch(`/api/enrollments?userId=${user.uid}`);
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setEnrollmentsLoading(false);
      }
    };

    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`/api/registrations?userId=${user.uid}`);
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setRegistrationsLoading(false);
      }
    }

    fetchEnrollments();
    fetchRegistrations();
  }, [user]);

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-headline">Welcome back, {user?.displayName?.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm md:text-base">You have {enrollments.length} active courses and {registrations.filter(r => new Date(r.event?.date || '') > new Date()).length} upcoming events.</p>
        </div>
        <Button asChild>
          <Link href="/events">
            <Plus className="mr-2 h-4 w-4" />
            Register for Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <BarChart className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.length > 0
                ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.course?.progress || 0), 0) / enrollments.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Events Registered</CardTitle>
            <Calendar className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-8">

          {/* Live Now / Featured Event - Logic can be added here if needed, for now hiding if we don't have a specific "live" flag */}
          {/* keeping the card as a placeholder for a featured upcoming event if exists */}
          {registrations.length > 0 && registrations[0].event && (
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="p-6 flex-1">
                  <Badge variant="secondary" className="mb-2">
                    Upcoming
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-bold font-headline">{registrations[0].event.title}</h2>
                  <p className="text-muted-foreground mt-1">
                    {new Date(registrations[0].event.date).toLocaleDateString()} • {registrations[0].event.location}
                  </p>
                  <div className="mt-6 flex gap-4">
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
                <div className="flex-shrink-0 md:w-2/5 relative min-h-[200px]">
                  <Image
                    src={registrations[0].event.imageUrl || 'https://placehold.co/600x400'}
                    alt={registrations[0].event.title}
                    fill
                    className="object-cover"
                    data-ai-hint={registrations[0].event.imageHint}
                  />
                </div>
              </div>
            </Card>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold">Enrolled Courses</h2>
              <Button variant="link" asChild>
                <Link href="/courses">Browse More</Link>
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
                    <Card key={enrollment.id} className="flex flex-col">
                      <div className="relative h-40 w-full">
                        <Image
                          src={enrollment.course.imageUrl}
                          alt={enrollment.course.title}
                          fill
                          className="object-cover rounded-t-lg"
                          data-ai-hint={enrollment.course.imageHint}
                        />
                      </div>
                      <CardHeader>
                        <CardDescription className="uppercase font-semibold tracking-wider text-primary text-xs">{enrollment.course.category}</CardDescription>
                        <CardTitle className="text-lg line-clamp-2">{enrollment.course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
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
                <div className="col-span-full text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <p className="text-muted-foreground mb-4">You are not enrolled in any courses yet.</p>
                  <Button asChild><Link href="/courses">Find a Course</Link></Button>
                </div>
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
              {registrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events.</p>
              ) : (
                <ul className="space-y-4">
                  {registrations.slice(0, 3).map((reg) => (
                    <li key={reg.id} className="flex items-center gap-4">
                      <div className="text-center bg-muted p-2 rounded-md min-w-[3.5rem]">
                        <p className="text-xs text-muted-foreground font-bold uppercase">{new Date(reg.event?.date || '').toLocaleString('default', { month: 'short' })}</p>
                        <p className="text-lg font-bold">{new Date(reg.event?.date || '').getDate()}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{reg.event?.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{reg.event?.location}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link href="/events">View All Events</Link>
              </Button>
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

