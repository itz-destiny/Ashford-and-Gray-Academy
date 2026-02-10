"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Ticket,
    Calendar,
    Users,
    TrendingUp,
    MapPin,
    Plus,
    Loader2
} from "lucide-react";

interface Event {
    _id: string;
    title: string;
    date: string;
    location: string;
    price?: number;
    category: string;
    imageUrl: string;
    imageHint: string;
    organizer: string;
    registrationCount?: number;
}

export default function EventTicketsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalRegistrations: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/events');
            const data = await res.json();

            setEvents(data || []);

            // Calculate stats
            const totalReg = data.reduce((sum: number, e: Event) => sum + (e.registrationCount || 0), 0);
            const revenue = data.reduce((sum: number, e: Event) => sum + ((e.price || 0) * (e.registrationCount || 0)), 0);

            setStats({
                totalEvents: data.length,
                totalRegistrations: totalReg,
                totalRevenue: revenue
            });
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Event Ticketing
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none rounded-full px-4">
                            {stats.totalEvents} Events
                        </Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage institutional events, seminar tickets, and workshop bookings.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95" onClick={fetchEvents}>
                    <Plus className="w-4 h-4 mr-2" /> Refresh Events
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Events", value: stats.totalEvents.toString(), trend: "All Categories", icon: Calendar, color: "bg-indigo-500" },
                    { label: "Registrations", value: stats.totalRegistrations.toString(), trend: "Total Attendees", icon: Ticket, color: "bg-emerald-500" },
                    { label: "Revenue", value: formatCurrency(stats.totalRevenue), trend: "From Tickets", icon: TrendingUp, color: "bg-amber-500" },
                    { label: "Avg. Attendance", value: stats.totalEvents > 0 ? Math.round(stats.totalRegistrations / stats.totalEvents).toString() : "0", trend: "Per Event", icon: Users, color: "bg-rose-500" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
            ) : events.length === 0 ? (
                <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] p-20 text-center">
                    <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No events found</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card key={event._id} className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-slate-900/20 mix-blend-overlay" />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/90 text-slate-900 border-none backdrop-blur shadow-sm font-black">
                                        {event.category}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors uppercase">
                                    {event.title}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        {formatDate(event.date)}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-900 font-black text-lg">
                                        <Ticket className="w-5 h-5 text-emerald-500" />
                                        {event.price ? formatCurrency(event.price) : 'Free'}
                                        {event.price && <span className="text-xs text-slate-400 font-bold ml-1 italic">/ per seat</span>}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                                        <span>Registrations</span>
                                        <span>{event.registrationCount || 0}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full group-hover:bg-emerald-500 transition-all duration-700"
                                            style={{ width: `${Math.min((event.registrationCount || 0) / 100 * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 font-black h-12 rounded-2xl transition-all">
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
