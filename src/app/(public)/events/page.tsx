

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
import { format } from 'date-fns';
import { Calendar, DollarSign, MapPin, Search, Tag, Users } from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import type { AppEvent } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { toast } = useToast();
  const [appEvents, setAppEvents] = useState<AppEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setAppEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

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

  const handleRegisterClick = async (event: AppEvent) => {
    if (!user) {
      router.push(`/login?redirectUrl=${pathname}?dialog=${event.id}`);
    } else {
      try {
        const res = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, eventId: event.id }),
        });

        if (res.ok) {
          toast({
            title: "Successfully Registered!",
            description: `You have registered for "${event.title}".`,
          });
        } else {
          throw new Error('Failed to register');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: "There was a problem registering you for this event.",
        });
      }
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortOrder("date");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedPrices([]);
  };

  const filteredAndSortedEvents = useMemo(() => {
    if (!appEvents) return [];
    let filtered = appEvents.filter(event => {
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
  }, [appEvents, searchQuery, sortOrder, selectedCategories, selectedLocations, selectedPrices]);


  return (
    <div className="bg-slate-50/50 min-h-screen pb-24">
      {/* Event Hero */}
      <header className="relative py-24 px-6 md:py-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/10 blur-[150px] rounded-full" />
          <div className="absolute inset-0 bg-[url('/wavy-background.svg')] bg-cover opacity-5 mix-blend-overlay" />
        </div>

        <div className="container relative z-10 text-center">
          <Badge className="bg-white/10 text-blue-300 border-white/20 mb-8 px-4 py-1.5 backdrop-blur-md">
             🗓 Workshops & Webinars
          </Badge>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Events.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Join our upcoming workshops and webinars to learn from industry experts and connect with other students.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative group bg-white/5 p-1.5 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl transition-all focus-within:border-blue-500/50">
              <div className="flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Search for an event, topic, or speaker..."
                    className="h-14 pl-14 bg-transparent border-none text-white text-base focus-visible:ring-0 placeholder:text-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="lg" className="h-14 px-8 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black">Search</Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 lg:px-12 -mt-12 relative z-20">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-28 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-10">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-blue-500 rounded-full" /> Event Type
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {filterCategories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <Checkbox
                        id={cat.id}
                        className="rounded-md border-slate-200"
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => handleCategoryChange(cat.id)}
                      />
                      <Label htmlFor={cat.id} className="text-sm font-bold text-slate-600 transition-colors group-hover:text-blue-600 cursor-pointer">{cat.label}</Label>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-indigo-500 rounded-full" /> Location
                </h3>
                <div className="space-y-4">
                  {[
                    { id: 'online', label: 'Online / Virtual' },
                    { id: 'in-person', label: 'In-person' }
                  ].map(loc => (
                    <div key={loc.id} className="flex items-center gap-3">
                      <Checkbox
                        id={loc.id}
                        className="rounded-md border-slate-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        checked={selectedLocations.includes(loc.id)}
                        onCheckedChange={() => handleLocationChange(loc.id)}
                      />
                      <Label htmlFor={loc.id} className="text-sm font-bold text-slate-600 cursor-pointer">{loc.label}</Label>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Investment
                </h3>
                <div className="space-y-4">
                  {[
                    { id: 'free', label: 'Free Workshops' },
                    { id: 'paid', label: 'Paid Sessions' }
                  ].map(pr => (
                    <div key={pr.id} className="flex items-center gap-3">
                      <Checkbox
                        id={pr.id}
                        className="rounded-md border-slate-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        checked={selectedPrices.includes(pr.id)}
                        onCheckedChange={() => handlePriceChange(pr.id)}
                      />
                      <Label htmlFor={pr.id} className="text-sm font-bold text-slate-600 cursor-pointer">{pr.label}</Label>
                    </div>
                  ))}
                </div>
              </section>

              <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl" onClick={clearAllFilters}>
                 Clear Filters
              </Button>
            </div>
          </aside>

          {/* Event List */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
              <h2 className="text-3xl font-black text-white md:text-slate-900 tracking-tighter">Event Schedule</h2>
              <div className="flex items-center gap-4 md:bg-white md:p-1 md:rounded-2xl">
                 <span className="text-xs font-black uppercase text-slate-400 tracking-widest ml-3">Sort:</span>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[180px] h-12 rounded-xl bg-white border-slate-100 font-bold shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 font-bold">
                    <SelectItem value="date">Soonest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-asc">Price: Low-High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-10">
              {eventsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-[3rem] bg-white" />
                ))
              ) : filteredAndSortedEvents.map((event, idx) => (
                <Dialog key={event.id}>
                  <DialogTrigger asChild>
                    <div className="group relative flex flex-col md:flex-row bg-white rounded-[3rem] border border-slate-50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden animate-in slide-in-from-bottom-6" style={{ animationDelay: `${idx * 150}ms` }}>
                      {/* Image */}
                      <div className="md:w-1/3 aspect-video md:aspect-auto overflow-hidden relative">
                        <Image src={event.imageUrl} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                           <Badge className="bg-slate-950 text-white font-black text-[10px] uppercase rounded-lg border-none">{event.category}</Badge>
                           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              {format(new Date(event.date), 'MMM d, yyyy')}
                           </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-950 group-hover:text-indigo-600 transition-colors mb-4 leading-tight">{event.title}</h3>
                        
                        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-50">
                           <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{event.location}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{event.organizer}</span>
                           </div>
                        </div>
                      </div>

                      {/* Price/Button */}
                      <div className="p-10 border-t md:border-t-0 md:border-l border-slate-50 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-slate-50/50 transition-colors lg:w-48">
                         <p className="text-3xl font-black text-slate-950 tracking-tighter mb-4">{event.price ? `₦${event.price.toLocaleString()}` : 'Free'}</p>
                         <Button className="w-full rounded-2xl bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest h-12">Register</Button>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl p-0 overflow-hidden rounded-[4rem] border-none shadow-2xl">
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-64 md:h-auto overflow-hidden">
                        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end p-12">
                           <div>
                              <Badge className="bg-indigo-600 mb-3">{event.category}</Badge>
                              <DialogTitle asChild>
                                <h2 className="text-4xl font-black text-white tracking-tighter">{event.title}</h2>
                              </DialogTitle>
                           </div>
                        </div>
                      </div>
                      <div className="p-12 md:py-24 bg-white flex flex-col">
                        <DialogHeader>
                          <DialogDescription className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                            Join us for this {event.category.toLowerCase()}. You'll have the chance to learn from experts and meet others in your field.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 mb-12">
                          <div className="flex items-center gap-4 group">
                             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Calendar className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</p>
                                <p className="font-black text-slate-950">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 group">
                             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <MapPin className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location</p>
                                <p className="font-black text-slate-950">{event.location}</p>
                             </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-10 border-t border-slate-100 flex flex-col gap-4">
                           <div className="flex justify-between items-end">
                              <p className="text-4xl font-black text-slate-950 tracking-tighter">{event.price ? `₦${event.price.toLocaleString()}` : 'Free'}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">Limited Seats Available</p>
                           </div>
                           <Button size="lg" className="h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg" onClick={() => handleRegisterClick(event)}>Register Now</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            {filteredAndSortedEvents.length === 0 && !eventsLoading && (
              <div className="text-center py-40 bg-white border border-dashed border-slate-200 rounded-[3rem] mt-10">
                <Search className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No Events Found</h3>
                <p className="text-slate-400 font-bold mt-2">Try adjusting your filters to find upcoming workshops and webinars.</p>
                <Button variant="link" onClick={clearAllFilters} className="mt-6 font-black text-indigo-600">Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="py-24 container px-6 lg:px-12">
         <div className="bg-slate-950 rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-center text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-8">Want to host an event?</h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto mb-12">We provide the tools you need to create and manage your own workshops and seminars on our platform.</p>
            <Button size="lg" className="h-16 px-12 rounded-[2rem] bg-white text-slate-950 hover:bg-blue-50 hover:scale-105 transition-all font-black text-lg">Contact Us</Button>
         </div>
      </section>
    </div>
  );
}

