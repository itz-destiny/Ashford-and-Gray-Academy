import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { BookOpen, ShoppingBag, ExternalLink, Tablet, Bookmark } from "lucide-react";
import { ExpandableBlurb } from "./expandable-blurb";

export const metadata = {
    title: "Academic Press — Ashford & Gray Fusion Academy",
    description: "Scholarly works and published volumes from Ashford & Gray Fusion Academy — including Beyond Service by Myne Wilfred.",
};

type Retailer = {
    label: string;
    href: string;
    icon: React.ElementType;
    note?: string;
};

type Book = {
    id: string;
    title: string;
    subtitle: string;
    author: string;
    year?: string;
    isbn?: string;
    publisher?: string;
    blurb: string;
    coverImage?: string;
    backCoverImage?: string;
    retailers: Retailer[];
};

const BOOKS: Book[] = [
    {
        id: "beyond-service",
        title: "Beyond Service",
        subtitle: "Hospitality Management as Structure, Standards, and Sustainability",
        author: "Myne Wilfred",
        year: "2025",
        isbn: "978-978-684-132-8",
        publisher: "Ashford & Gray Academic Press",
        blurb:
            "Hospitality is often judged by what is seen. Management is revealed by what endures.\n\nBeyond Service reframes hospitality management as a responsibility-bearing profession grounded in structure, judgement, and institutional discipline. Written from professional practice rather than theory, this book examines what truly sustains hospitality environments beyond visible service delivery — operational systems, people management, professional conduct, business discipline, and long-term continuity.\n\nIt moves beyond surface-level service to present hospitality management as governance: the coordination of people, resources, and standards in environments where discretion, accountability, and consistency are essential.\n\nThis book is designed for:\n• Hospitality professionals and managers\n• Estate and facility managers\n• Executives and institutional leaders\n• Students and emerging professionals\n\nClear, grounded, and authoritative, Beyond Service challenges conventional thinking and positions hospitality management not as performance — but as professional responsibility.\n\nThis is not a book about service. It is a book about what sustains it.",
        coverImage: "https://m.media-amazon.com/images/I/61i6msVdsSL._SY466_.jpg",
        backCoverImage: "https://m.media-amazon.com/images/I/51nrofcUhiL._SY466_.jpg",
        retailers: [
            {
                label: "Buy on Selar",
                href: "https://selar.com/2i222737u7",
                icon: ShoppingBag,
                note: "Direct from author",
            },
            {
                label: "Paperback on Amazon",
                href: "https://www.amazon.com/Beyond-Service-Hospitality-Management-Sustainability/dp/9786841328",
                icon: BookOpen,
                note: "ISBN 978-978-684-132-8",
            },
            {
                label: "Kindle Edition",
                href: "https://www.amazon.com/Beyond-Service-Hospitality-Management-Sustainability-ebook/dp/B0H2JZC9NV",
                icon: Tablet,
                note: "eBook",
            },
        ],
    },
    {
        id: "beyond-labour",
        title: "Beyond Labour",
        subtitle: "Redefining Domestic Service through Dignity, Structure and Professionalism",
        author: "Myne Wilfred",
        year: "2026",
        isbn: "978-9786287126",
        publisher: "Ashford & Gray Academic Press",
        blurb:
            "Beyond Labour is not just a book—it is a necessary correction.\n\n" +
            "Domestic service has long operated in silence. Behind closed doors, within private homes, across estates, offices, and institutions, a system has continued to function without structure, without standardization, and too often, without dignity.\n\n" +
            "Workers carry responsibility without recognition. Employers carry risk without systems. Trust is expected, yet rarely managed. Performance is demanded, yet rarely developed.\n\n" +
            "This book changes that. In Beyond Labour, Myne Wilfred delivers a powerful, experience-driven framework that redefines domestic service as a professional system—not informal labour.\n\n" +
            "Drawing from over two decades of expertise in hospitality, private service, and executive management, this book exposes the realities within domestic service while offering a clear, structured path forward.\n\n" +
            "Inside this book, you will discover:\n" +
            "• Why domestic service remains one of the most misunderstood yet critical systems in modern life\n" +
            "• The hidden risks of unstructured household management\n" +
            "• The realities of abuse, underpayment, and performance gaps\n" +
            "• The employer’s vulnerability in high-trust environments\n" +
            "• The mindset shift required for both workers and employers\n" +
            "• The importance of documentation, training, and accountability\n" +
            "• A complete system for structuring roles, welfare, and performance\n" +
            "• The MW Framework—a practical model for transforming domestic service into a professional discipline\n\n" +
            "Who this book is for:\n" +
            "• Employers and household heads\n" +
            "• Estate and facility managers\n" +
            "• Domestic staff and service professionals\n" +
            "• Hospitality leaders and practitioners\n" +
            "• Recruitment agencies\n" +
            "• Training institutions\n" +
            "• Policy and labour advocates\n\n" +
            "This book is a call to action. A call to:\n" +
            "• Move from assumption to structure\n" +
            "• Replace silence with clarity\n" +
            "• Build systems that protect both employer and worker\n" +
            "• Redefine dignity in service\n" +
            "• Create a future where domestic service is respected, trained, and professionally managed\n\n" +
            "Because service should never mean invisibility. And labour should never exist without dignity.",
        coverImage: "/books/secondbook.jpg",
        backCoverImage: "/books/back%20of%20beyond%20the%20labour.jpg",
        retailers: [
            {
                label: "Paperback on Amazon",
                href: "https://www.amazon.com/dp/9786287126",
                icon: BookOpen,
                note: "Paperback",
            },
            {
                label: "Kindle Edition",
                href: "https://www.amazon.com/dp/B0H3ML3GZ1",
                icon: Tablet,
                note: "eBook",
            },
        ],
    },
];

export default function PressPage() {
    return (
        <div className="bg-white">
            {/* Banner */}
            <header className="py-24 md:py-32 text-center border-b border-slate-50">
                <div className="container px-6 lg:px-12">
                    <ScrollAnimation animation="fade-in-up">
                        <div className="inline-flex items-center gap-3 mb-8">
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Publications</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                            Ashford &amp; Gray <br />
                            <span className="text-[#C8A96A]">Academic Press.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
                            Scholarly works, professional volumes, and institutional writings from our founder and faculty — shaping the literature of hospitality, leadership, and global service excellence.
                        </p>
                    </ScrollAnimation>
                </div>
            </header>

            {/* Books grid */}
            <section className="py-24 md:py-32">
                <div className="container px-6 lg:px-12 space-y-24">
                    {BOOKS.map((book, idx) => (
                        <ScrollAnimation key={book.id} animation="fade-in-up" delay={idx * 100}>
                            <article className="grid lg:grid-cols-[440px_1fr] gap-12 md:gap-20 items-start">
                                {/* Book covers (front + back) */}
                                <div className="mx-auto lg:mx-0 w-full max-w-sm space-y-6">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-[#C8A96A]/10 blur-3xl rounded-full" />
                                        <div className="relative aspect-[3/4] bg-[#0B1F3A] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                                            {book.coverImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={book.coverImage} alt={`${book.title} — front cover`} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
                                                    <div>
                                                        <div className="w-10 h-[2px] bg-[#C8A96A] mb-6" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Ashford &amp; Gray Press</p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h2 className="font-serif text-4xl md:text-5xl leading-[1.05]">{book.title}</h2>
                                                        <p className="text-sm text-slate-300 italic leading-relaxed">{book.subtitle}</p>
                                                    </div>
                                                    <div className="flex items-end justify-between pt-8 border-t border-white/10">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{book.author}</p>
                                                        <Bookmark className="w-5 h-5 text-[#C8A96A]" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {book.backCoverImage && (
                                        <div className="flex items-center gap-4 bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100">
                                            <div className="relative w-20 aspect-[3/4] rounded-xl overflow-hidden shrink-0 shadow-sm">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={book.backCoverImage} alt={`${book.title} — back cover`} className="absolute inset-0 w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Back Cover</p>
                                                <p className="text-xs text-slate-500 font-medium mt-1">Cover synopsis &amp; endorsements</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="space-y-8">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge className="bg-[#0B1F3A] text-white border-none font-black text-[10px] uppercase tracking-[0.3em] px-3 py-1.5">Now Available</Badge>
                                        {book.year && (
                                            <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] border-none font-black text-[10px] uppercase tracking-[0.3em] px-3 py-1.5">{book.year}</Badge>
                                        )}
                                        {book.publisher && (
                                            <Badge className="bg-slate-100 text-slate-700 border-none font-black text-[10px] uppercase tracking-[0.3em] px-3 py-1.5">{book.publisher}</Badge>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] leading-[1.1]">
                                            {book.title}
                                        </h2>
                                        <p className="text-lg md:text-xl text-slate-500 font-medium italic leading-relaxed">
                                            {book.subtitle}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-[1px] bg-[#C8A96A]" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]">By {book.author}</p>
                                    </div>

                                    <ExpandableBlurb
                                        text={book.blurb}
                                        className="text-base md:text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-line"
                                    />

                                    {book.isbn && (
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">ISBN {book.isbn}</p>
                                    )}

                                    {/* Retailer buttons */}
                                    <div className="pt-4 grid sm:grid-cols-3 gap-3">
                                        {book.retailers.map((retailer) => (
                                            <Button
                                                key={retailer.label}
                                                asChild
                                                variant="outline"
                                                className="h-auto py-5 px-5 border border-slate-200 hover:border-[#C8A96A] hover:bg-[#C8A96A]/5 rounded-2xl flex flex-col items-start gap-2 text-left transition-all"
                                            >
                                                <a href={retailer.href} target="_blank" rel="noopener noreferrer">
                                                    <span className="flex items-center justify-between w-full">
                                                        <retailer.icon className="w-5 h-5 text-[#C8A96A]" />
                                                        <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                                                    </span>
                                                    <span className="font-bold text-sm text-[#0B1F3A] normal-case tracking-normal">
                                                        {retailer.label}
                                                    </span>
                                                    {retailer.note && (
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                            {retailer.note}
                                                        </span>
                                                    )}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        </ScrollAnimation>
                    ))}
                </div>
            </section>

            {/* Forthcoming */}
            <section className="py-24 md:py-32 bg-slate-50">
                <div className="container px-6 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
                            <span className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.4em]">Forthcoming Works</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] mb-6">
                            More volumes in <span className="text-[#C8A96A]">preparation.</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            Additional titles from our founder and faculty are presently in editorial. We will publish updates here as each volume is released. To be notified, subscribe to the Academy newsletter.
                        </p>
                        <div className="pt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild className="h-14 px-8 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-xl">
                                <Link href="/#newsletter">Subscribe for Updates</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-14 px-8 border-slate-200 text-[#0B1F3A] hover:bg-white rounded-full font-black text-[10px] uppercase tracking-[0.3em]">
                                <Link href="/contact">Press Enquiries</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
