import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { mockCourses } from "@/lib/data";
import { PlusCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-10" />
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          New Course
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockCourses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
              <Image
                src={course.imageUrl}
                alt={course.title}
                width={600}
                height={400}
                className="w-full h-40 object-cover"
                data-ai-hint={course.imageHint}
              />
            </CardHeader>
            <CardContent className="flex-grow pt-6">
              <CardTitle className="font-headline text-lg leading-tight">{course.title}</CardTitle>
              <CardDescription className="mt-2 text-sm">{course.instructor}</CardDescription>
              <div className="mt-4">
                <Progress value={course.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/courses/${course.id}`}>View Course</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
