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
import { Calendar, DollarSign, MapPin, Search, Tag, Users, ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import type { AppEvent } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

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
            title: "Registration Successful",
            description: `You have been registered for "${event.title}".`,
          });
        } else {
          throw new Error('Failed to register');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: "There was a problem processing your registration.",
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
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);
      const matchesLocation = selectedLocations.length === 0 ||
        (selectedLocations.includes('online') && (event.location.toLowerCase().includes('virtual') || event.location.toLowerCase().includes('online'))) ||
        (selectedLocations.includes('in-person') && !(event.location.toLowerCase().includes('virtual') || event.location.toLowerCase().includes('online')));
      const matchesPrice = selectedPrices.length === 0 ||
        (selectedPrices.includes('free') && (event.price === 0 || !event.price)) ||
        (selectedPrices.includes('paid') && event.price && event.price > 0);

      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });

    switch (sortOrder) {
      case 'date':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popular':
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
    <div className="bg-white min-h-screen pb-24">
      {/* Event Hero */}
      <header className="relative py-32 px-6 md:py-48 overflow-hidden bg-[#0B1F3A]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <ScrollAnimation animation="fade-in-up">
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="w-8 h-[1px] bg-[#C8A96A]" />
              <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.4em]">Global Gatherings</span>
              <div className="w-8 h-[1px] bg-[#C8A96A]" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-8">
              Institutional <span className="italic text-[#C8A96A]">Events.</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
              Distinctive. Global. Authoritative. Engage with world-class faculty and industry visionaries.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative group bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl transition-all focus-within:border-[#C8A96A]/50">
                <div className="flex">
                  <div className="relative flex-grow">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#C8A96A] transition-colors" />
                    <Input
                      placeholder="Search by event, speaker, or topic..."
                      className="h-14 pl-14 bg-transparent border-none text-white text-base focus-visible:ring-0 placeholder:text-slate-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button size="lg" className="h-14 px-8 rounded-full bg-[#C8A96A] hover:bg-[#B69759] text-white font-black">Search</Button>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </header>

      <div className="container px-6 lg:px-12 -mt-12 relative z-20">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-28 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-10">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] mb-6 flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-[#1F7A5A] rounded-full" /> Event Type
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {filterCategories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <Checkbox
                        id={cat.id}
                        className="rounded-md border-slate-200 data-[state=checked]:bg-[#1F7A5A] data-[state=checked]:border-[#1F7A5A]"
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => handleCategoryChange(cat.id)}
                      />
                      <Label htmlFor={cat.id} className="text-sm font-bold text-slate-600 cursor-pointer">{cat.label}</Label>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] mb-6 flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-[#0B1F3A] rounded-full" /> Location
                </h3>
                <div className="space-y-4">
                  {[
                    { id: 'online', label: 'Virtual' },
                    { id: 'in-person', label: 'In-person' }
                  ].map(loc => (
                    <div key={loc.id} className="flex items-center gap-3">
                      <Checkbox
                        id={loc.id}
                        className="rounded-md border-slate-200 data-[state=checked]:bg-[#0B1F3A] data-[state=checked]:border-[#0B1F3A]"
                        checked={selectedLocations.includes(loc.id)}
                        onCheckedChange={() => handleLocationChange(loc.id)}
                      />
                      <Label htmlFor={loc.id} className="text-sm font-bold text-slate-600 cursor-pointer">{loc.label}</Label>
                    </div>
                  ))}
                </div>
              </section>

              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl" onClick={clearAllFilters}>
                 Clear Filters
              </Button>
            </div>
          </aside>

          {/* Event List */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
              <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">Event Schedule</h2>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sort:</span>
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

            <div className="grid gap-12">
              {eventsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-[3rem] bg-white" />
                ))
              ) : filteredAndSortedEvents.map((event, idx) => (
                <ScrollAnimation key={event.id} animation="fade-in-up" delay={idx * 100}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="group relative flex flex-col md:flex-row bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden cursor-pointer">
                        {/* Image */}
                        <div className="md:w-1/3 aspect-video md:aspect-auto overflow-hidden relative">
                          <Image src={event.imageUrl} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-[#0B1F3A]/20 group-hover:bg-transparent transition-all" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-4 mb-6">
                             <Badge className="bg-[#1F7A5A] text-white font-black text-[9px] uppercase tracking-widest rounded-full border-none px-3 py-1">{event.category}</Badge>
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-[#C8A96A]" />
                                {format(new Date(event.date), 'MMMM d, yyyy')}
                             </div>
                          </div>

                          <h3 className="text-2xl font-serif text-[#0B1F3A] group-hover:text-[#1F7A5A] transition-colors mb-6 leading-tight">{event.title}</h3>
                          
                          <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-slate-50">
                             <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#1F7A5A]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.location}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#0B1F3A]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.organizer}</span>
                             </div>
                          </div>
                        </div>

                        {/* Price/Button */}
                        <div className="p-12 border-t md:border-t-0 md:border-l border-slate-50 flex flex-col items-center justify-center bg-slate-50 lg:w-56 group-hover:bg-slate-100 transition-colors">
                           <p className="text-3xl font-serif text-[#0B1F3A] mb-6">{event.price ? `₦${event.price.toLocaleString()}` : 'Complimentary'}</p>
                           <Button className="w-full rounded-full bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90 transition-all font-black text-[10px] uppercase tracking-widest h-12 shadow-xl">Join Now</Button>
                        </div>
                      </div>
                    </DialogTrigger>
                    
                    <DialogContent className="sm:max-w-5xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
                      <div className="grid md:grid-cols-2">
                        <div className="relative h-64 md:h-auto overflow-hidden bg-[#0B1F3A]">
                          <Image src={event.imageUrl} alt={event.title} fill className="object-cover opacity-60" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-transparent flex items-end p-12">
                             <div className="space-y-4">
                                <Badge className="bg-[#C8A96A] text-white border-none font-black text-[9px] uppercase tracking-[0.2em]">{event.category}</Badge>
                                <DialogTitle asChild>
                                  <h2 className="text-4xl font-serif text-white tracking-tight leading-tight">{event.title}</h2>
                                </DialogTitle>
                             </div>
                          </div>
                        </div>
                        <div className="p-16 flex flex-col">
                          <DialogDescription className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                            An exclusive {event.category.toLowerCase()} curated for current and future industry leaders. Immerse yourself in institutional excellence.
                          </DialogDescription>

                          <div className="space-y-8 mb-12">
                            <div className="flex items-center gap-6 group">
                               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1F7A5A] shadow-sm">
                                  <Calendar className="w-6 h-6" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Date & Time</p>
                                  <p className="text-lg font-serif text-[#0B1F3A]">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6 group">
                               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0B1F3A] shadow-sm">
                                  <MapPin className="w-6 h-6" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Location</p>
                                  <p className="text-lg font-serif text-[#0B1F3A]">{event.location}</p>
                               </div>
                            </div>
                          </div>

                          <div className="mt-auto pt-12 border-t border-slate-100 flex flex-col gap-6">
                             <div className="flex justify-between items-baseline">
                                <p className="text-4xl font-serif text-[#0B1F3A]">{event.price ? `₦${event.price.toLocaleString()}` : 'Complimentary'}</p>
                                <p className="text-[10px] font-black text-[#1F7A5A] uppercase tracking-[0.2em]">Limited Access</p>
                             </div>
                             <Button size="lg" className="h-16 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-lg shadow-xl" onClick={() => handleRegisterClick(event)}>Confirm Attendance</Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </ScrollAnimation>
              ))}
            </div>

            {filteredAndSortedEvents.length === 0 && !eventsLoading && (
              <div className="text-center py-40 bg-slate-50 rounded-[4rem] mt-12 border-2 border-dashed border-slate-200">
                <Search className="w-20 h-20 text-slate-200 mx-auto mb-8" />
                <h3 className="text-2xl font-serif text-[#0B1F3A]">No Events Found</h3>
                <p className="text-slate-500 font-medium mt-4">We could not find any events matching your current selection.</p>
                <Button variant="link" onClick={clearAllFilters} className="mt-8 font-black text-[#1F7A5A] uppercase tracking-widest text-xs">Reset Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="py-32 container px-6 lg:px-12">
         <ScrollAnimation animation="fade-in-up">
            <div className="bg-[#0B1F3A] rounded-[4rem] p-24 md:p-32 relative overflow-hidden text-center text-white">
               <div className="absolute top-0 right-0 w-[50%] h-full bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2" />
               <h2 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight mb-10">Host Your Next <br /><span className="italic text-[#C8A96A]">Signature Event.</span></h2>
               <p className="text-slate-400 font-medium text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                 Leverage our institutional infrastructure to host high-impact workshops, seminars, and corporate retreats.
               </p>
               <Button size="lg" className="h-16 px-12 rounded-full bg-[#C8A96A] hover:bg-[#B69759] text-white font-black text-lg shadow-2xl transition-all hover:scale-105">Request Partnership</Button>
            </div>
         </ScrollAnimation>
      </section>
    </div>
  );
}

