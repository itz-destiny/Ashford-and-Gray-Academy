export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Student' | 'Admin' | 'Instructor';
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  imageUrl: string;
  imageHint: string;
  progress: number;
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
