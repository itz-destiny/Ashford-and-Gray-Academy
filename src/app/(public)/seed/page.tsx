
'use client';

import { useState } from 'react';
import { coursesToSeed, eventsToSeed } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    setCompleted(false);

    try {
      const res = await fetch('/api/seed');
      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Success', description: data.message });
        setCompleted(true);
      } else {
        throw new Error(data.error || 'Failed to seed database');
      }

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
            Click the button below to populate your Firestore database with the initial course and event data. This will add all courses and will only add events if the collection is empty.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Button onClick={handleSeed} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {completed && !loading && <CheckCircle className="mr-2 h-4 w-4" />}
            {completed && !loading ? 'Seeding Complete' : (loading ? 'Seeding...' : 'Start Seeding')}
          </Button>
          {completed && !loading && <p className="text-sm text-green-600 text-center">Your database has been populated. You can now visit the courses and events pages.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

