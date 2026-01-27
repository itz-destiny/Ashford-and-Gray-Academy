
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

  const [repairing, setRepairing] = useState(false);

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

  const handleRepair = async () => {
    setRepairing(true);
    try {
      const res = await fetch('/api/instructor-repair');
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Repair Complete', description: data.message });
      } else {
        throw new Error(data.error || 'Repair failed');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="container py-24 space-y-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Populate database with initial course and event data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Button onClick={handleSeed} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Seeding'}
          </Button>
          {completed && !loading && <p className="text-sm text-green-600 text-center">Seeding complete.</p>}
        </CardContent>
      </Card>

      <Card className="max-w-md mx-auto border-orange-200 bg-orange-50/10">
        <CardHeader>
          <CardTitle className="text-orange-700">Database Repair</CardTitle>
          <CardDescription>
            Fix instructor accounts mislabeled as students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRepair} disabled={repairing} variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
            {repairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Repair Instructor Roles'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

