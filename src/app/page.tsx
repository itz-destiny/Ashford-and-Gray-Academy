import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, BookOpen, Calendar, GraduationCap, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-learning');
const courseImages = {
  'course-programming': PlaceHolderImages.find(img => img.id === 'course-programming'),
  'course-data-science': PlaceHolderImages.find(img => img.id === 'course-data-science'),
  'course-design': PlaceHolderImages.find(img => img.id === 'course-design'),
}

export default function Home() {
  const features = [
    {
      icon: <Video className="w-8 h-8 text-accent" />,
      title: "Live Classes & Webinars",
      description: "Engage in real-time with expert instructors through our integrated video sessions.",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-accent" />,
      title: "Automated Assessments",
      description: "Receive instant feedback with auto-graded quizzes and earn downloadable certificates.",
    },
    {
      icon: <BookOpen className="w-8 h-8 text-accent" />,
      title: "Resource Library",
      description: "Access a rich repository of course materials including PDFs, slides, and videos.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-accent" />,
      title: "Event Scheduling",
      description: "Stay organized with our integrated calendar, timetables, and automated reminders.",
    },
  ];

  const featuredCourses = [
    {
      title: "Full-Stack Web Development",
      description: "Master front-end and back-end technologies to build complete web applications.",
      image: courseImages['course-programming'],
    },
    {
      title: "Data Science & Machine Learning",
      description: "Unlock insights from data and build predictive models with Python, R, and SQL.",
      image: courseImages['course-data-science'],
    },
    {
      title: "UI/UX Design Fundamentals",
      description: "Learn the principles of user-centered design to create intuitive and beautiful interfaces.",
      image: courseImages['course-design'],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary">Ashford & Gray</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32">
          {heroImage && 
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold font-headline tracking-tight text-primary sm:text-5xl md:text-6xl">
                Unlock Your Potential, Redefine Your Future.
              </h2>
              <p className="mt-6 text-lg leading-8 text-foreground/80">
                Ashford and Gray Fusion Academy offers a dynamic blend of live instruction, AI-powered tools, and a supportive community to accelerate your learning journey.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
                  <Link href="/login">
                    Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="link" asChild>
                  <Link href="#">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-base font-semibold leading-7 text-accent font-headline">Everything You Need</h3>
              <p className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">A Modern Platform for Modern Learners</p>
              <p className="mt-6 text-lg leading-8 text-foreground/80">
                We've combined cutting-edge technology with proven educational strategies to create an unparalleled learning experience.
              </p>
            </div>
            <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-background shadow-md">
                    {feature.icon}
                  </div>
                  <h4 className="mt-5 text-lg font-semibold leading-6 text-primary">{feature.title}</h4>
                  <p className="mt-2 text-base leading-7 text-foreground/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-base font-semibold leading-7 text-accent font-headline">Our Courses</h3>
              <p className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">Pathways to a New Career</p>
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80">
                Dive into our curated selection of courses designed to equip you with in-demand skills for the future.
              </p>
            </div>
            <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <Card key={course.title} className="flex flex-col overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
                  <CardHeader className="p-0">
                    {course.image && 
                      <Image
                        src={course.image.imageUrl}
                        alt={course.image.description}
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover"
                        data-ai-hint={course.image.imageHint}
                      />
                    }
                  </CardHeader>
                  <CardContent className="flex-grow pt-6">
                    <CardTitle className="font-headline">{course.title}</CardTitle>
                    <CardDescription className="mt-2">{course.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <p className="text-sm text-foreground/60">&copy; {new Date().getFullYear()} Ashford and Gray Fusion Academy. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-foreground/60 hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="text-sm text-foreground/60 hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
