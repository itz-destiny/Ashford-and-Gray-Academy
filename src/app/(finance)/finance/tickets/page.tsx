"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Ticket,
    Calendar,
    Users,
    TrendingUp,
    MapPin,
    RefreshCw,
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
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Financial Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-4">
                        Event Ticketing
                        <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10 rounded-none font-black text-[9px] uppercase tracking-widest">
                            {stats.totalEvents} Events
                        </Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Manage institutional events, seminar tickets, and workshop bookings.</p>
                </div>
                <Button onClick={fetchEvents} className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh Events
                </Button>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active Events", value: stats.totalEvents.toString(), icon: Calendar, accent: "border-t-[#C8A96A]", color: "text-[#C8A96A]" },
                    { label: "Registrations", value: stats.totalRegistrations.toString(), icon: Ticket, accent: "border-t-[#1F7A5A]", color: "text-[#1F7A5A]" },
                    { label: "Revenue", value: formatCurrency(stats.totalRevenue), icon: TrendingUp, accent: "border-t-[#0B1F3A]", color: "text-[#0B1F3A]" },
                    { label: "Avg. Attendance", value: stats.totalEvents > 0 ? Math.round(stats.totalRegistrations / stats.totalEvents).toString() : "0", icon: Users, accent: "border-t-rose-400", color: "text-rose-500" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white border border-[#0B1F3A]/10 border-t-4 ${stat.accent} p-8 group hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-start justify-between mb-6">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-serif text-[#0B1F3A]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-20 text-center">
                    <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium italic font-serif">No events found.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden group hover:shadow-lg transition-all duration-500">
                            <div className="h-40 bg-[#F6F4F2] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A]/20 to-[#0B1F3A]/40 mix-blend-overlay" />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/90 text-[#0B1F3A] border-none rounded-none backdrop-blur shadow-sm font-black text-[9px] uppercase tracking-widest">
                                        {event.category}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-serif text-[#0B1F3A] mb-4 leading-tight group-hover:text-[#C8A96A] transition-colors">
                                    {event.title}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                        <Calendar className="w-4 h-4 text-[#C8A96A]" />
                                        {formatDate(event.date)}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                        <MapPin className="w-4 h-4 text-[#C8A96A]" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-[#0B1F3A] font-black text-lg">
                                        <Ticket className="w-5 h-5 text-[#1F7A5A]" />
                                        {event.price ? formatCurrency(event.price) : 'Free'}
                                        {event.price && <span className="text-xs text-slate-400 font-medium ml-1 italic">/ per seat</span>}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Registrations</span>
                                        <span>{event.registrationCount || 0}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 overflow-hidden">
                                        <div
                                            className="h-full bg-[#C8A96A] group-hover:bg-[#1F7A5A] transition-all duration-700"
                                            style={{ width: `${Math.min((event.registrationCount || 0) / 100 * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full bg-[#F6F4F2] hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A] font-black h-12 rounded-none shadow-none transition-all text-[10px] uppercase tracking-widest">
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
