
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { coursesToSeed, eventsToSeed } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SeedPage() {
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not available.",
        });
        return;
    }
    setLoading(true);
    setCompleted(false);

    try {
      // Check if courses exist
      const coursesCollection = collection(firestore, 'courses');
      const coursesSnapshot = await getDocs(coursesCollection);
      if (coursesSnapshot.empty) {
        for (const course of coursesToSeed) {
          await addDoc(coursesCollection, course);
        }
        toast({ title: 'Success', description: `${coursesToSeed.length} courses have been added.` });
      } else {
        toast({ title: 'Skipped', description: 'Courses collection is not empty.' });
      }

      // Check if events exist
      const eventsCollection = collection(firestore, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      if (eventsSnapshot.empty) {
        for (const event of eventsToSeed) {
          await addDoc(eventsCollection, event);
        }
        toast({ title: 'Success', description: `${eventsToSeed.length} events have been added.` });
      } else {
         toast({ title: 'Skipped', description: 'Events collection is not empty.' });
      }
      
      setCompleted(true);

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error seeding database",
        description: error.message,
      });
      console.error('Error seeding database:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-24">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Click the button below to populate your Firestore database with the initial course and event data. This will only run if the collections are empty.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Button onClick={handleSeed} disabled={loading || completed} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {completed && <CheckCircle className="mr-2 h-4 w-4" />}
            {completed ? 'Seeding Complete' : (loading ? 'Seeding...' : 'Start Seeding')}
          </Button>
           {completed && <p className="text-sm text-green-600">Your database has been populated. You can now visit the courses and events pages.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
