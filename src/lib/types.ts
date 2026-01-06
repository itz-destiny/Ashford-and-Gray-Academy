
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
  description: string;
  progress?: number; 
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

export type AppEvent = {
  id: string;
  title: string;
  category: 'Conference' | 'Workshop' | 'Webinar' | 'Networking';
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
    id: string;
    student: {
        name: string;
        avatarUrl: string;
    };
    course: string;
    date: string;
    status: 'Pending' | 'Approved';
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
