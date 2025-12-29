
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, BookOpen, Calendar, CheckCircle2, Download, HelpCircle, Library, Mail, MessageSquare, MoreHorizontal, Plus, Users } from "lucide-react";
import { mockCourses, mockUser, mockAssignments, mockRecentEnrollments, mockInstructorMessages } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function InstructorDashboardPage() {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Professor Smith</h1>
              <p className="text-muted-foreground">Here is an overview of your active content and tasks.</p>
          </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground text-green-600">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240</div>
            <p className="text-xs text-muted-foreground text-green-600">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Mail className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-8">
           <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Active Courses</h2>
              <Button variant="link" asChild>
                <Link href="/courses">View All</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {mockCourses.slice(0,2).map((course, index) => (
                <Card key={course.id}>
                    <CardHeader className="relative h-40">
                        <Image 
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="w-full h-full object-cover rounded-t-lg"
                        data-ai-hint={course.imageHint}
                        />
                        <Badge className="absolute top-2 right-2">{course.category}</Badge>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">Fall Semester 2023</p>
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-medium text-muted-foreground">Progress</span>
                                <span>{index === 0 ? '65' : '32'}%</span>
                            </div>
                            <Progress value={index === 0 ? 65 : 32} aria-label={`${course.title} progress`} />
                        </div>
                    </CardContent>
                   <CardFooter className="gap-2">
                    <Button variant="outline" className="w-full">Manage</Button>
                    <Button variant="secondary" className="w-full">Grade</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
           <Card>
                <CardHeader>
                    <CardTitle>Recent Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRecentEnrollments.map(enrollment => (
                                <TableRow key={enrollment.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={enrollment.student.avatarUrl} />
                                                <AvatarFallback>{getInitials(enrollment.student.name)}</AvatarFallback>
                                            </Avatar>
                                            <span>{enrollment.student.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{enrollment.course}</TableCell>
                                    <TableCell>{enrollment.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={enrollment.status === 'Approved' ? 'secondary' : 'default'} className={enrollment.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            <span className={`mr-2 h-2 w-2 rounded-full ${enrollment.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {enrollment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {enrollment.status === 'Pending' ? (
                                          <Button variant="link" size="sm">Review</Button>
                                      ) : (
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </main>
        
        <aside className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Schedule</CardTitle>
                    <CardDescription><Link href="#" className="text-primary hover:underline">View Calendar</Link></CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Today, 10:00 AM</p>
                                <p className="font-semibold">BIO-101 Live Lecture</p>
                                <p className="text-sm text-muted-foreground">Topic: Cell Structure</p>
                                <Button size="sm" className="mt-2 w-full">Join Session</Button>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                             <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
                            <div>
                                <p className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</p>
                                <p className="font-semibold">Office Hours</p>
                                <p className="text-sm text-muted-foreground">Open for all students</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                           <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
                            <div>
                                <p className="text-xs text-muted-foreground">Fri, Oct 27, 9:00 AM</p>
                                <p className="font-semibold">Department Meeting</p>
                                <p className="text-sm text-muted-foreground">Quarterly review</p>
                            </div>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Messages</CardTitle>
                    <Badge variant="destructive">3 New</Badge>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {mockInstructorMessages.map(msg => (
                            <li key={msg.id} className="flex gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={msg.student.avatarUrl} />
                                    <AvatarFallback>{getInitials(msg.student.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-baseline justify-between">
                                        <p className="font-semibold">{msg.student.name}</p>
                                        <p className="text-xs text-muted-foreground">{msg.time}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Button variant="outline" className="w-full mt-4">View Inbox</Button>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
