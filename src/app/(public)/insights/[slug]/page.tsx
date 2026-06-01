import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ARTICLES, getArticleBySlug, type ArticleBlock } from "@/lib/insights-data";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

type RouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: RouteProps) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) return { title: "Article not found — Ashford & Gray" };
    return {
        title: `${article.title} — Ashford & Gray Fusion Academy`,
        description: article.excerpt,
    };
}

export default async function ArticlePage({ params }: RouteProps) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) notFound();

    const idx = ARTICLES.findIndex((a) => a.slug === slug);
    const next = idx >= 0 ? ARTICLES[(idx + 1) % ARTICLES.length] : null;

    return (
        <div className="bg-white">
            {/* Hero */}
            <header className="relative bg-[#0B1F3A] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A96A]/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                </div>

                {/* Top utility bar — back link sits anchored at the top edge */}
                <div className="relative z-10 border-b border-white/5">
                    <div className="container px-6 lg:px-12 py-5 max-w-4xl mx-auto">
                        <Link
                            href="/insights"
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] inline-flex items-center gap-2 hover:gap-3 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Research &amp; Insights
                        </Link>
                    </div>
                </div>

                {/* Title block */}
                <div className="container px-6 lg:px-12 py-14 md:py-20 relative z-10 max-w-4xl mx-auto">
                    <div className="space-y-5">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">
                            {article.category}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.1]">
                            {article.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 pt-4">
                            <span className="text-white">By {article.author}</span>
                            <span>·</span>
                            <span>{article.date}</span>
                            <span>·</span>
                            <span>{article.readTime}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Body */}
            <article className="container px-6 lg:px-12 py-20 md:py-28 max-w-3xl mx-auto">
                <ScrollAnimation animation="fade-in-up">
                    <p className="text-xl md:text-2xl font-serif italic text-[#0B1F3A] leading-relaxed mb-12 pb-12 border-b border-slate-100">
                        {article.excerpt}
                    </p>
                </ScrollAnimation>

                <div className="space-y-6 text-base md:text-lg text-slate-700 leading-[1.85] font-medium">
                    {article.body.map((block, i) => renderBlock(block, i))}
                </div>

                {/* Author footer */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-[#C8A96A]/30">
                        <Image
                            src="/CEO.jpeg"
                            alt={article.author}
                            fill
                            sizes="64px"
                            className="object-cover object-top"
                        />
                    </div>
                    <div>
                        <p className="font-serif text-xl text-[#0B1F3A] leading-tight">{article.author}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mt-2">Founder/President · Ashford &amp; Gray Fusion Academy</p>
                    </div>
                </div>
            </article>

            {/* Next article */}
            {next && next.slug !== article.slug && (
                <section className="bg-slate-50 py-20 md:py-28">
                    <div className="container px-6 lg:px-12 max-w-4xl mx-auto">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-6">Continue Reading</p>
                        <Link href={`/insights/${next.slug}`} className="group block">
                            <h3 className="font-serif text-3xl md:text-4xl text-[#0B1F3A] leading-tight group-hover:text-[#1F7A5A] transition-colors mb-4">
                                {next.title}
                            </h3>
                            <p className="text-base text-slate-600 font-medium leading-relaxed mb-6 max-w-2xl">
                                {next.excerpt}
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1F7A5A] group-hover:gap-3 transition-all">
                                Read article <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}

function renderBlock(block: ArticleBlock, key: number) {
    switch (block.type) {
        case 'p':
            return <p key={key}>{block.text}</p>;
        case 'list':
            return (
                <ul key={key} className="space-y-3 pl-1">
                    {block.items.map((item, j) => (
                        <li key={j} className="flex gap-4">
                            <span className="text-[#C8A96A] font-bold mt-1">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            );
    }
}
