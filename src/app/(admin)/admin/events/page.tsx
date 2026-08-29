"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Calendar, MapPin, Users, MoreVertical, Edit2, Trash2, Clock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

type AdminEvent = {
    _id: string;
    id: string;
    title: string;
    category: string;
    date: string;
    time?: string;
    location: string;
    price?: number;
    imageUrl: string;
    imageHint: string;
    organizer: string;
    registrationCount: number;
};

const CATEGORIES = ['Conference', 'Workshop', 'Webinar', 'Networking', 'Seminar'];

const EMPTY_FORM = {
    title: '',
    category: 'Workshop',
    date: '',
    time: '',
    location: '',
    price: '',
    imageUrl: '',
    imageHint: '',
    organizer: '',
};

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function AdminEventsPage() {
    const { toast } = useToast();
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const openCreateDialog = () => {
        setEditingEvent(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEditDialog = (event: AdminEvent) => {
        setEditingEvent(event);
        setForm({
            title: event.title,
            category: event.category,
            date: event.date.slice(0, 10),
            time: event.time ?? '',
            location: event.location,
            price: event.price != null ? String(event.price) : '',
            imageUrl: event.imageUrl,
            imageHint: event.imageHint,
            organizer: event.organizer,
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                title: form.title,
                category: form.category,
                date: form.date,
                time: form.time || undefined,
                location: form.location,
                imageUrl: form.imageUrl,
                imageHint: form.imageHint,
                organizer: form.organizer,
            };
            if (form.price) payload.price = Number(form.price);

            const res = editingEvent
                ? await apiFetch(`/api/events/${editingEvent._id}`, { method: 'PATCH', body: JSON.stringify(payload) })
                : await apiFetch('/api/events', { method: 'POST', body: JSON.stringify(payload) });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Request failed');
            }

            toast({ title: editingEvent ? 'Event updated' : 'Event created' });
            setDialogOpen(false);
            fetchEvents();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Something went wrong', description: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const res = await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchEvents();
            } else {
                toast({ variant: 'destructive', title: 'Failed to delete event' });
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleExport = () => {
        if (events.length === 0) return;
        const headers = ["Title", "Date", "Time", "Location", "Registrations"];
        const rows = events.map(e => [
            e.title,
            new Date(e.date).toLocaleDateString(),
            e.time ?? '',
            e.location,
            e.registrationCount
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'events_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = useMemo(() => {
        const today = startOfToday();
        const upcoming = events.filter(e => new Date(e.date) >= today);
        const totalRegistrations = events.reduce((sum, e) => sum + (e.registrationCount || 0), 0);
        const liveWorkshops = upcoming.filter(e => e.category === 'Workshop').length;
        const requiresAttention = upcoming.filter(e => (e.registrationCount || 0) === 0).length;
        return { upcomingCount: upcoming.length, totalRegistrations, liveWorkshops, requiresAttention };
    }, [events]);

    const eventStatus = (dateStr: string): { label: string; className: string } => {
        const today = startOfToday();
        const eventDate = new Date(dateStr);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate.getTime() === today.getTime()) {
            return { label: 'Live Today', className: 'bg-amber-50 text-amber-700 hover:bg-amber-50' };
        }
        if (eventDate < today) {
            return { label: 'Past', className: 'bg-slate-100 text-slate-500 hover:bg-slate-100' };
        }
        return { label: 'Upcoming', className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' };
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Academy Calendar</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Events <span className="text-[#C8A96A]">Management.</span></h1>
                    <p className="text-slate-500 font-medium font-serif">Organize and monitor all academy workshops and seminars.</p>
                </div>
                <Button className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none gap-2" onClick={openCreateDialog}>
                    <Plus className="w-4 h-4" /> Create Event
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Upcoming</p>
                    <h3 className="text-3xl font-serif text-[#0B1F3A]">{stats.upcomingCount}</h3>
                </div>
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Total Registrations</p>
                    <h3 className="text-3xl font-serif text-[#0B1F3A]">{stats.totalRegistrations}</h3>
                </div>
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Live Workshops</p>
                    <h3 className="text-3xl font-serif text-[#0B1F3A]">{stats.liveWorkshops}</h3>
                </div>
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-rose-400 p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Requires Attention</p>
                    <h3 className="text-3xl font-serif text-[#0B1F3A]">{stats.requiresAttention}</h3>
                </div>
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="px-8 py-6 border-b border-[#0B1F3A]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by title or location..."
                            className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleExport} className="text-[#C8A96A] hover:text-[#0B1F3A] font-black uppercase text-[10px] tracking-widest rounded-none">Export CSV</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-[#0B1F3A]/5">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-8 py-5">Event Details</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registrations</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEvents.map((event) => {
                            const status = eventStatus(event.date);
                            return (
                                <TableRow key={event._id} className="hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                    <TableCell className="pl-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#F6F4F2] border border-[#0B1F3A]/5 p-2">
                                                <Calendar className="w-5 h-5 text-[#0B1F3A]" />
                                            </div>
                                            <span className="font-bold text-[#0B1F3A]">{event.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#0B1F3A]">{new Date(event.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" /> {event.time || '—'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-3 h-3" /> {event.location}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#0B1F3A]">{event.registrationCount} Attendee(s)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${status.className} border-none rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-wider`}>
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-none"><MoreVertical className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-none border-[#0B1F3A]/10">
                                                <DropdownMenuItem
                                                    className="gap-2 text-[#0B1F3A] font-bold cursor-pointer"
                                                    onClick={() => openEditDialog(event)}
                                                >
                                                    <Edit2 className="w-4 h-4" /> Edit Event
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2"><Users className="w-4 h-4" /> View Attendees</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2 text-red-600 font-bold cursor-pointer"
                                                    onClick={() => handleDelete(event._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {loading && <div className="p-8 text-center text-slate-400 font-serif italic">Finding academy events...</div>}
                {!loading && filteredEvents.length === 0 && (
                    <div className="p-12 text-center text-slate-400 font-serif italic">
                        No events yet. Click <span className="font-bold text-[#0B1F3A] not-italic">Create Event</span> to add the first one.
                    </div>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-none border-[#0B1F3A]/10">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#0B1F3A]">{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizer">Organizer</Label>
                                <Input id="organizer" required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className="rounded-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time (optional)</Label>
                                <Input id="time" placeholder="e.g. 10:00 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₦, optional)</Label>
                                <Input id="price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imageHint">Image Hint</Label>
                                <Input id="imageHint" required value={form.imageHint} onChange={(e) => setForm({ ...form, imageHint: e.target.value })} className="rounded-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input id="imageUrl" required placeholder="/events/example.jpg" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="rounded-none" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none">Cancel</Button>
                            <Button type="submit" disabled={submitting} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white rounded-none font-black text-[10px] uppercase tracking-widest">
                                {submitting ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
