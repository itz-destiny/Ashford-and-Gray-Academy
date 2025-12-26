
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { 
  Building, 
  Lightbulb, 
  Handshake, 
  Users, 
  Trophy, 
  Flag,
  Target,
  Eye
} from "lucide-react";
import React from "react";
import { mockUser } from "@/lib/data";

const leadershipTeam = [
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Principal',
    bio: 'Leading with 20+ years of educational experience and a passion for curriculum innovation.',
    imageUrl: 'https://picsum.photos/seed/leader1/400/400',
    imageHint: 'female principal'
  },
  {
    name: 'Michael Thorne',
    role: 'Dean of Students',
    bio: 'Dedicated to fostering a supportive and disciplined student community life.',
    imageUrl: 'https://picsum.photos/seed/leader2/400/400',
    imageHint: 'male dean'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Director of Admissions',
    bio: 'Helping families navigate the journey to joining the Ashford and Gray community.',
    imageUrl: 'https://picsum.photos/seed/leader3/400/400',
    imageHint: 'female director'
  },
  {
    name: 'David Chen',
    role: 'Head of STEM',
    bio: 'Spearheading our technology initiatives and robotics programs.',
    imageUrl: 'https://picsum.photos/seed/leader4/400/400',
    imageHint: 'male teacher'
  }
];

const journeyMilestones = [
  {
    year: '1998',
    title: 'Foundation',
    description: 'Ashford and Gray is founded with a vision to create a new model of secondary education, starting with just 50 students and 5 visionary teachers.'
  },
  {
    year: '2005',
    title: 'Campus Expansion',
    description: 'To accommodate growing demand, we inaugurate our Science and Arts wing, adding state-of-the-art laboratories and a 500-seat theater.'
  },
  {
    year: '2014',
    title: 'Fusion Methodology',
    description: 'We officially launched our "Fusion" curriculum, integrating digital literacy and project-based learning into every subject.'
  },
  {
    year: 'Today',
    title: 'Global Recognition',
    description: 'Today, we serve over 1,200 students and are recognized nationally for excellence in STEM and the Arts.'
  }
]

export default function AboutPage() {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-center text-white">
        <Image 
          src="https://picsum.photos/seed/school-building/1800/1200"
          alt="Ashford and Gray Academy building"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 brightness-50"
          data-ai-hint="modern school building"
        />
        <div className="relative z-10 p-4 motion-safe:animate-fade-in-up">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm">Established 2010</Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">Defining Excellence in Education</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-white/90">
            Welcome to Ashford and Gray Fusion Academy. Empowering the future through a unique fusion of academic tradition and modern innovation.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg">Our Programs</Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">Virtual Tour</Button>
          </div>
        </div>
      </section>

      {/* Bridging Tradition & Innovation Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container text-center max-w-4xl mx-auto motion-safe:animate-fade-in-up">
          <h2 className="text-3xl font-bold font-headline">Bridging Tradition & Innovation</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Ashford and Gray Fusion Academy bridges the gap between traditional academic rigor and modern, innovative learning techniques. We believe in nurturing the whole student through a curriculum that values creativity alongside critical thinking, preparing students not just for college, but for a life of purpose and impact.
          </p>
        </div>
      </section>
      
      {/* Guided by a commitment Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="motion-safe:animate-fade-in-up">
                <p className="font-semibold text-primary uppercase tracking-wider">Our Purpose</p>
                <h2 className="text-3xl font-bold font-headline mt-2">Guided by a commitment to student success.</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    We don't just teach subjects; we cultivate mindsets. Our approach is holistic, ensuring every student finds their unique path to success.
                </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 motion-safe:animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <div className="bg-primary/10 text-primary w-12 h-12 flex items-center justify-center rounded-lg mb-2">
                           <Flag className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">To cultivate critical thinkers who are prepared to navigate a complex world with integrity, skill, and an unwavering commitment to lifelong learning.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-secondary/50">
                    <CardHeader>
                        <div className="bg-primary/10 text-primary w-12 h-12 flex items-center justify-center rounded-lg mb-2">
                           <Eye className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">Our Vision</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">A world where every student leads with confidence, compassion, and creativity, driving positive change in their communities and beyond.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container text-center motion-safe:animate-fade-in-up">
          <h2 className="text-3xl font-bold font-headline">Our Core Values</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">The pillars that uphold our community and guide our daily interactions.</p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Lightbulb, title: "Innovation", description: "Embracing new ideas and technologies to enhance the learning experience." },
              { icon: Handshake, title: "Integrity", description: "Acting with honesty and strong moral principles in everything we do." },
              { icon: Users, title: "Inclusivity", description: "Celebrating diverse perspectives and fostering a welcoming environment." },
              { icon: Trophy, title: "Excellence", description: "Striving for the highest standards in academics, arts, and athletics." }
            ].map((value, index) => (
              <div key={value.title} className="flex flex-col items-center motion-safe:animate-fade-in-up" style={{animationDelay: `${index * 0.1 + 0.1}s`}}>
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="mt-1 text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-12 items-start motion-safe:animate-fade-in-up">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold font-headline">Our Journey</h2>
            <p className="mt-4 text-muted-foreground">From a small local initiative to a leading institution, explore the milestones that have shaped Ashford and Gray.</p>
          </div>
          <div className="lg:col-span-2 relative">
             <div className="absolute left-3.5 top-2 h-full w-0.5 bg-border -translate-x-1/2"></div>
             <div className="space-y-12">
               {journeyMilestones.map((item, index) => (
                 <div key={index} className="relative flex items-start gap-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary flex-shrink-0 z-10">
                        <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                    </div>
                    <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-primary">{item.year}</p>
                        <h4 className="font-semibold text-lg mt-1">{item.title}</h4>
                        <p className="mt-1 text-muted-foreground">{item.description}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Leadership Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container text-center motion-safe:animate-fade-in-up">
          <h2 className="text-3xl font-bold font-headline">Meet Our Leadership</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">A team of dedicated educators and administrators passionate about student growth.</p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadershipTeam.map((leader, index) => (
              <Card key={leader.name} className="overflow-hidden text-center motion-safe:animate-fade-in-up" style={{animationDelay: `${index * 0.1 + 0.1}s`}}>
                <Image 
                  src={leader.imageUrl}
                  alt={leader.name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover object-top"
                  data-ai-hint={leader.imageHint}
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{leader.name}</h3>
                  <p className="text-primary text-sm font-medium">{leader.role}</p>
                  <p className="text-muted-foreground text-sm mt-2">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Join Section */}
      <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center motion-safe:animate-fade-in-up">
              <h2 className="text-3xl font-bold font-headline">Ready to Join the Fusion?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/80">Take the first step towards a transformative educational experience. Applications for the next academic year are now open.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button size="lg" variant="secondary">Apply Now</Button>
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">Contact Admissions</Button>
              </div>
          </div>
      </section>
    </div>
  );
}
