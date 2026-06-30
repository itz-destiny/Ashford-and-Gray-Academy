import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ARTICLES } from "@/lib/insights-data";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export const metadata = {
    title: "Research & Insights — Hospitality Leadership & Strategy",
    description:
        "Articles and insights by Myne Wilfred and the Ashford & Gray Fusion Academy team on hospitality leadership, luxury service philosophy, domestic service, event management, and the silent standard of professional excellence in Nigeria and globally.",
    keywords: [
        "hospitality insights Nigeria",
        "hospitality leadership articles",
        "Myne Wilfred articles",
        "luxury hospitality blog Nigeria",
        "hospitality management tips",
        "domestic service insights",
    ],
    alternates: { canonical: "https://www.ashfordandgrayfusionacademy.com/insights" },
    openGraph: {
        title: "Research & Insights — Ashford & Gray Fusion Academy",
        description: "Articles on hospitality leadership, luxury service, and the silent standard of professional excellence.",
        url: "https://www.ashfordandgrayfusionacademy.com/insights",
    },
};

export default function InsightsIndexPage() {
    return (
        <div className="bg-white">
            {/* Banner */}
            <header className="py-24 md:py-32 text-center border-b border-slate-50">
                <div className="container px-6 lg:px-12">
                    <ScrollAnimation animation="fade-in-up">
                        <div className="inline-flex items-center gap-3 mb-8">
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Editorial</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                            Research &amp; <span className="text-[#C8A96A]">Insights.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
                            Articles by Myne Wilfred — Founder/President of Ashford &amp; Gray Fusion Academy — on hospitality leadership, luxury service philosophy, business innovation, and the silent standard of professional excellence.
                        </p>
                    </ScrollAnimation>
                </div>
            </header>

            {/* Article grid */}
            <section className="py-24 md:py-32">
                <div className="container px-6 lg:px-12">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-14">
                        {ARTICLES.map((article, idx) => (
                            <ScrollAnimation key={article.slug} animation="fade-in-up" delay={idx * 80}>
                                <Link
                                    href={`/insights/${article.slug}`}
                                    className="group block bg-white border border-slate-100 hover:border-[#C8A96A] hover:shadow-2xl rounded-[2.5rem] p-10 md:p-12 transition-all duration-500 h-full"
                                >
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F7A5A] mb-6">
                                        {article.category}
                                    </div>
                                    <h2 className="font-serif text-2xl md:text-3xl text-[#0B1F3A] leading-tight mb-6 group-hover:text-[#1F7A5A] transition-colors">
                                        {article.title}
                                    </h2>
                                    <p className="text-base text-slate-600 leading-relaxed font-medium line-clamp-4 mb-8">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                            <span className="text-[#0B1F3A]">{article.author}</span>
                                            <span className="mx-2">·</span>
                                            <span>{article.date}</span>
                                            <span className="mx-2">·</span>
                                            <span>{article.readTime}</span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-[#C8A96A] group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
