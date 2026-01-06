
export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'admin' | 'instructor';
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
  description: string;
  progress?: number; 
};

export type AppEvent = {
  id: string;
  title: string;
  category: 'Conference' | 'Workshop' | 'Webinar' | 'Networking' | 'Seminar';
  date: string;
  location: string;
  price?: number;
  imageUrl: string;
  imageHint: string;
  organizer: string;
};

export type Assignment = {
    id: string;
    course: string;
    title: string;
    dueDate: string;
};

export type Enrollment = {
    id?: string;
    userId: string;
    courseId: string;
    enrolledAt: any;
    course?: Course;
};

export type Registration = {
  id?: string;
  userId: string;
  eventId: string;
  registeredAt: any;
  event?: AppEvent;
};

export type InstructorMessage = {
    id: string;
    student: {
        name: string;
        avatarUrl: string;
    };
    message: string;
    time: string;
};
