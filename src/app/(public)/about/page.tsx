
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Building2, Goal, Users } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    const getPlaceholderImage = (id: string) => {
        return PlaceHolderImages.find(p => p.id === id)?.imageUrl ?? 'https://placehold.co/600x400';
    }

    const leaders = [
        { name: 'Dr. Eleanor Vance', title: 'President & Founder', avatarId: 'leader-1', imageHint: 'female principal' },
        { name: 'Marcus Thorne', title: 'Dean of Academics', avatarId: 'leader-2', imageHint: 'male dean' },
        { name: 'Isabella Rossi', title: 'Director of Student Affairs', avatarId: 'leader-3', imageHint: 'female director' },
        { name: 'David Chen', title: 'Head of Curriculum Development', avatarId: 'leader-4', imageHint: 'male teacher' },
    ];
    
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-16">
      <header className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center text-white">
        <Image
          src={getPlaceholderImage('about-hero')}
          alt="Ashford & Gray modern campus building"
          fill
          className="object-cover brightness-50"
          data-ai-hint="modern school building"
        />
        <div className="relative z-10 container">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-headline">About Ashford & Gray</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            Pioneering the future of integrated learning and professional development.
          </p>
        </div>
      </header>

      <section className="container grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold font-headline mb-4">Our Mission</h2>
          <p className="text-muted-foreground text-lg mb-6">
            To provide a dynamic, accessible, and comprehensive ecosystem for lifelong learning. We empower students, instructors, and event organizers by unifying world-class education with seamless event management, fostering a global community dedicated to growth and innovation.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full"><Goal className="w-6 h-6"/></div>
                <div>
                    <h3 className="font-semibold">Our Vision</h3>
                    <p className="text-sm text-muted-foreground">To be the world's leading platform for blended education and professional networking.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full"><Users className="w-6 h-6"/></div>
                <div>
                    <h3 className="font-semibold">Our Values</h3>
                    <p className="text-sm text-muted-foreground">Community, Innovation, Accessibility, and Excellence.</p>
                </div>
            </div>
          </div>
        </div>
        <div>
            <Image 
                src="https://picsum.photos/seed/mission/600/450"
                alt="Students collaborating in a bright, modern space"
                width={600}
                height={450}
                className="rounded-lg shadow-xl"
                data-ai-hint="students collaborating"
            />
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold font-headline">Meet Our Leadership</h2>
            <p className="mt-2 text-muted-foreground">
              The driving force behind our commitment to educational excellence.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {leaders.map((leader) => (
              <Card key={leader.name} className="text-center">
                <CardContent className="pt-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                        <AvatarImage src={getPlaceholderImage(leader.avatarId)} data-ai-hint={leader.imageHint} />
                        <AvatarFallback>{getInitials(leader.name)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold">{leader.name}</h3>
                    <p className="text-primary">{leader.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container text-center">
        <div className="max-w-3xl mx-auto">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-3xl font-bold font-headline">Join Our Community</h2>
            <p className="mt-2 text-muted-foreground text-lg">
                Whether you're looking to advance your career, share your knowledge, or connect with peers, Ashford & Gray is your partner in growth. Explore our platform and discover your potential.
            </p>
        </div>
      </section>

    </div>
  );
}
