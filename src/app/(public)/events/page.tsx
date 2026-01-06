

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockAppEvents } from "@/lib/data";
import { format } from 'date-fns';
import { Calendar, DollarSign, MapPin, Search, Tag, Users } from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import type { AppEvent } from "@/lib/types";

export default function EventsPage() {
    
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  const filterCategories = [
    { id: 'Conference', label: 'Conference' },
    { id: 'Workshop', label: 'Workshop' },
    { id: 'Webinar', label: 'Webinar' },
    { id: 'Networking', label: 'Networking' },
    { id: 'Seminar', label: 'Seminar' },
  ]

  const quickSearchCategories = ['Conference', 'Workshop', 'Webinar', 'Networking', 'Seminar'];

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleLocationChange = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handlePriceChange = (price: string) => {
    setSelectedPrices(prev =>
      prev.includes(price)
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortOrder("date");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedPrices([]);
  };

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = mockAppEvents.filter(event => {
      // Search query filter
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);

      // Location filter
      const matchesLocation = selectedLocations.length === 0 || 
        (selectedLocations.includes('online') && (event.location.toLowerCase().includes('virtual') || event.location.toLowerCase().includes('online'))) ||
        (selectedLocations.includes('in-person') && !(event.location.toLowerCase().includes('virtual') || event.location.toLowerCase().includes('online')));

      // Price filter
      const matchesPrice = selectedPrices.length === 0 ||
        (selectedPrices.includes('free') && (event.price === 0 || !event.price)) ||
        (selectedPrices.includes('paid') && event.price && event.price > 0);

      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });

    // Sorting logic
    switch (sortOrder) {
      case 'date':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popular':
        // Assuming no popularity metric, we'll just reverse for variety
        filtered.reverse();
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
    }

    return filtered;
  }, [searchQuery, sortOrder, selectedCategories, selectedLocations, selectedPrices]);


  return (
    <div className="space-y-8">
      <header className="py-16 text-center bg-secondary">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Discover Upcoming Events</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with peers, learn from experts, and grow your network.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search events, topics, or organizers..." 
                  className="h-14 pl-12 text-base" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-14 rounded-l-none">Search</Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {quickSearchCategories.map(cat => (
                  <Button 
                    key={cat} 
                    variant={selectedCategories.includes(cat) ? "default" : "outline"} 
                    className="rounded-full"
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </Button>
              ))}
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
                    <Checkbox 
                      id={cat.id} 
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => handleCategoryChange(cat.id)}
                    />
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
                    <Checkbox 
                      id="online" 
                      checked={selectedLocations.includes('online')}
                      onCheckedChange={() => handleLocationChange('online')}
                    />
                    <Label htmlFor="online" className="font-normal">Online / Virtual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-person"
                      checked={selectedLocations.includes('in-person')}
                      onCheckedChange={() => handleLocationChange('in-person')}
                    />
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
                    <Checkbox 
                      id="free"
                      checked={selectedPrices.includes('free')}
                      onCheckedChange={() => handlePriceChange('free')}
                    />
                    <Label htmlFor="free" className="font-normal">Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="paid"
                      checked={selectedPrices.includes('paid')}
                      onCheckedChange={() => handlePriceChange('paid')}
                    />
                    <Label htmlFor="paid" className="font-normal">Paid</Label>
                  </div>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full" onClick={clearAllFilters}>Clear All Filters</Button>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-muted-foreground">Showing {filteredAndSortedEvents.length} of {mockAppEvents.length} events</p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort">Sort by:</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
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
            {filteredAndSortedEvents.map((event) => (
              <Dialog key={event.id}>
                <DialogTrigger asChild>
                  <Card className="flex flex-col overflow-hidden group cursor-pointer">
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
                        <Button variant="outline" className="pointer-events-none">Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                   <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover rounded-lg"
                        data-ai-hint={event.imageHint}
                      />
                    </div>
                    <div className="flex flex-col">
                      <DialogHeader>
                        <Badge className="w-fit">{event.category}</Badge>
                        <DialogTitle className="text-3xl font-headline mt-2">{event.title}</DialogTitle>
                        <DialogDescription className="text-base">
                          A detailed description of the event will go here, outlining the agenda, speakers, and what attendees can expect to learn.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-muted-foreground"/> 
                           <span className="font-semibold">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                         <div className="flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-muted-foreground"/> 
                           <span className="font-semibold">{event.location}</span>
                        </div>
                         <div className="flex items-center gap-2">
                           <Users className="w-4 h-4 text-muted-foreground"/> 
                           <span>Organized by <span className="font-semibold">{event.organizer}</span></span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 flex flex-col gap-2">
                        <p className="text-4xl font-bold">{event.price ? `$${event.price}` : 'Free'}</p>
                        <Button size="lg" className="w-full">Register Now</Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
            {filteredAndSortedEvents.length === 0 && (
              <div className="md:col-span-2 text-center py-16">
                <h3 className="text-xl font-semibold">No Events Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                <Button variant="link" onClick={clearAllFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            )}
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
