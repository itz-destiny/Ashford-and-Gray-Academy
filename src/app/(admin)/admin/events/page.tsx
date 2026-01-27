"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, MapPin, Users, MoreVertical, Edit2, Trash2, Clock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchEvents();
            } else {
                alert('Failed to delete event');
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
            e.time,
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events Management</h1>
                    <p className="text-slate-500 text-sm">Organize and monitor all academy workshops and seminars.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" /> Create Event
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-indigo-50/50">
                    <CardContent className="p-4">
                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Upcoming</p>
                        <h3 className="text-2xl font-bold">{events.length}</h3>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-emerald-50/50">
                    <CardContent className="p-4">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Total Registrations</p>
                        <h3 className="text-2xl font-bold">450+</h3>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-amber-50/50">
                    <CardContent className="p-4">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Live Workshops</p>
                        <h3 className="text-2xl font-bold">12</h3>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-rose-50/50">
                    <CardContent className="p-4">
                        <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Requires Attention</p>
                        <h3 className="text-2xl font-bold">2</h3>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b px-6 py-4 flex flex-row items-center justify-between space-y-0">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by title or location..."
                            className="pl-10 bg-slate-50 border-none focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleExport} className="text-slate-500 font-bold">Export CSV</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900 pl-6">Event Details</TableHead>
                                <TableHead className="font-bold text-slate-900">Date & Time</TableHead>
                                <TableHead className="font-bold text-slate-900">Location</TableHead>
                                <TableHead className="font-bold text-slate-900">Registrations</TableHead>
                                <TableHead className="font-bold text-slate-900">Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEvents.map((event) => (
                                <TableRow key={event._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="font-bold text-slate-700">{event.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{new Date(event.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" /> {event.time}
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
                                            <span className="text-xs font-bold text-slate-700">{event.registrationCount} Attendee(s)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none px-2 py-0.5 text-[10px] font-bold">
                                            Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="gap-2 text-indigo-600 font-bold cursor-pointer"
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
                            ))}
                        </TableBody>
                    </Table>
                    {loading && <div className="p-8 text-center text-slate-400 italic">Finding academy events...</div>}
                </CardContent>
            </Card>
        </div>
    );
}
