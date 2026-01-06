
"use client";

import React, { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Enrollment, Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function MyCoursesPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const enrollmentsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'enrollments'),
      where('userId', '==', user.uid)
    );
  }, [user, firestore]);

  const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(enrollmentsQuery);

  const loading = userLoading || enrollmentsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Courses</h1>
          <p className="text-muted-foreground">Continue your learning journey.</p>
        </div>
        <Button asChild>
            <Link href="/courses">Browse All Courses</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
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
                  <CardDescription className="uppercase font-semibold tracking-wider text-primary">
                    {enrollment.course.category}
                  </CardDescription>
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
      </div>

      {!loading && enrollments?.length === 0 && (
        <div className="text-center py-16 bg-muted/50 rounded-lg">
          <h3 className="text-xl font-semibold">You haven't enrolled in any courses yet.</h3>
          <p className="text-muted-foreground mt-2">Start your learning journey by browsing our course catalog.</p>
          <Button asChild className="mt-4">
            <Link href="/courses">Explore Courses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default MyCoursesPage;
