
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAppEvents } from "@/lib/data";
import { format } from 'date-fns';
import { Calendar, DollarSign, MapPin, Search, Tag, Users } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function EventsPage() {
    
  const filterCategories = [
    { id: 'conference', label: 'Conference' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'webinar', label: 'Webinar' },
    { id: 'networking', label: 'Networking' },
  ]

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="py-16 text-center bg-secondary rounded-lg">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Discover Upcoming Events</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with peers, learn from experts, and grow your network.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search events, topics, or organizers..." className="h-14 pl-12 text-base" />
              </div>
              <Button size="lg" className="h-14 rounded-l-none">Search</Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="rounded-full">Conference</Button>
              <Button variant="outline" className="rounded-full">Workshop</Button>
              <Button variant="outline" className="rounded-full">Webinar</Button>
              <Button variant="outline" className="rounded-full">Networking</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-8">
          {/* Categories Filter */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Event Type</h3>
              <div className="space-y-3">
                {filterCategories.map(cat => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox id={cat.id} />
                    <Label htmlFor={cat.id} className="flex items-center gap-2 font-normal cursor-pointer">
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Location Filter */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="online" />
                    <Label htmlFor="online" className="font-normal">Online / Virtual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="in-person" />
                    <Label htmlFor="in-person" className="font-normal">In-person</Label>
                  </div>
              </div>
            </CardContent>
          </Card>

           {/* Price Filter */}
           <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Price</h3>
              <div className="space-y-3">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="free" />
                    <Label htmlFor="free" className="font-normal">Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="paid" />
                    <Label htmlFor="paid" className="font-normal">Paid</Label>
                  </div>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full">Clear All Filters</Button>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-muted-foreground">Showing {mockAppEvents.length} events</p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort">Sort by:</Label>
              <Select defaultValue="date">
                <SelectTrigger id="sort" className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {mockAppEvents.map((event) => (
              <Card key={event.id} className="flex flex-col overflow-hidden group">
                <div className="relative">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    width={600}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={event.imageHint}
                  />
                  <Badge className="absolute top-3 left-3 bg-primary/80 backdrop-blur-sm">{event.category}</Badge>
                </div>
                <CardContent className="flex-grow pt-4 flex flex-col">
                  <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">by {event.organizer}</p>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-end justify-between flex-grow">
                     <div>
                        <p className="text-2xl font-bold">{event.price ? `$${event.price}` : 'Free'}</p>
                     </div>
                     <Button variant="outline">Register Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

       <section className="py-16 bg-primary/10">
        <div className="container text-center">
            <h2 className="text-3xl font-bold font-headline">Host Your Own Event</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Our platform provides all the tools you need to create, manage, and promote your events seamlessly. Reach a wider audience and manage registrations with ease.</p>
            <Button size="lg" className="mt-6">Become an Organizer</Button>
        </div>
      </section>
    </div>
  );
}

