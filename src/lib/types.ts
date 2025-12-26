export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Student' | 'Admin' | 'Instructor';
};

export type Course = {
  id: string;
  title: string;
  category: string;
  instructor: {
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  rating: number;
  reviews: number;
  duration: number; // in weeks
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: number;
  originalPrice?: number;
  imageUrl: string;
  imageHint: string;
  description?: string; // Optional, as it's not on the main card
  progress?: number; // Optional
};

export type Resource = {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Slides';
  course: string;
  dateAdded: string;
  imageUrl: string;
  imageHint: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  course: string;
  type: 'Live Class' | 'Quiz Due' | 'Assignment';
  startTime: string;
  endTime: string;
};
