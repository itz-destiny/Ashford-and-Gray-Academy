"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, BookOpen, ShoppingCart, Tablet } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   PUBLICATIONS DATA
   Add new books here as they are published.
───────────────────────────────────────────────────────────── */
interface PurchaseLink {
  platform: "Selar" | "Amazon Paperback" | "Amazon Kindle" | "Ko-fi";
  url: string;
  label: string;
  icon: "cart" | "book" | "tablet" | "heart";
}

interface Publication {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorTitle: string;
  year?: string;
  isbn?: string;
  coverImage: string;
  description: string;
  featured: boolean;
  purchaseLinks: PurchaseLink[];
}

const PUBLICATIONS: Publication[] = [
  {
    id: "beyond-service",
    title: "Beyond Service",
    subtitle: "Hospitality Management as Structure, Standards, and Sustainability",
    author: "Myne Wilfred",
    authorTitle: "Founder/President, Ashford & Gray Academy",
    year: "2024",
    isbn: "978-978-684132-8",
    coverImage: "/beyond_service_book_1779871505249.png",
    featured: true,
    description:
      "Beyond Service reframes hospitality management as a responsibility-bearing profession grounded in structure, judgement, and institutional discipline. Written from professional practice rather than theory, this book examines what truly sustains hospitality environments — operational systems, people management, professional conduct, business discipline, and long-term continuity.",
    purchaseLinks: [
      {
        platform: "Selar",
        url: "https://selar.co/beyondservice",
        label: "Buy on Selar",
        icon: "cart",
      },
      {
        platform: "Amazon Paperback",
        url: "https://www.amazon.com/s?k=9789786841328",
        label: "Paperback — Amazon",
        icon: "book",
      },
      {
        platform: "Amazon Kindle",
        url: "https://www.amazon.com/s?k=Beyond+Service+Myne+Wilfred+Kindle",
        label: "Kindle eBook — Amazon",
        icon: "tablet",
      },
    ],
  },
  {
    id: "beyond-labour",
    title: "Beyond Labour",
    subtitle: "Redefining Domestic Service through Dignity, Structure and Professionalism",
    author: "Myne Wilfred",
    authorTitle: "Founder/President, Ashford & Gray Academy",
    year: "2026",
    isbn: "978-9786287126",
    coverImage: "/books/secondbook.jpg",
    featured: true,
    description:
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
    purchaseLinks: [
      {
        platform: "Amazon Paperback",
        url: "https://www.amazon.com/dp/9786287126",
        label: "Paperback — Amazon",
        icon: "book",
      },
      {
        platform: "Amazon Kindle",
        url: "https://www.amazon.com/dp/B0H3ML3GZ1",
        label: "Kindle eBook — Amazon",
        icon: "tablet",
      },
    ],
  },
  {
    id: "hospitality-with-authority",
    title: "Hospitality with Authority",
    subtitle: "Lead with Control. Deliver Excellence.",
    author: "Myne Wilfred",
    authorTitle: "Founder/President, Ashford & Gray Academy",
    year: "2025",
    isbn: "978-9786872576",
    coverImage: "/books/hospitality-with-authority.png",
    featured: true,
    description:
      "Hospitality is not service. It is control.\n\n" +
      "In an industry where excellence is often assumed but rarely sustained, Hospitality with Authority challenges conventional thinking and redefines what it means to operate at the highest level of hospitality leadership.\n\n" +
      "This is not a book about doing more. It is about doing what matters—with precision, discipline, structure, and consistency under pressure.\n\n" +
      "Drawing from years of practical experience in hospitality operations, executive support, estate management, protocol coordination, and high-level service environments, Myne Wilfred presents a powerful framework for professionals seeking to move beyond routine service into intentional excellence.\n\n" +
      "Inside this book, you will discover:\n" +
      "• How to build systems that sustain excellence\n" +
      "• The difference between management and authority\n" +
      "• How to maintain control under pressure\n" +
      "• Strategies for managing high-profile clients and environments\n" +
      "• The role of discipline, consistency, and operational precision in hospitality leadership\n" +
      "• How to create guest experiences that are deliberate, not accidental\n" +
      "• The future of hospitality leadership in a rapidly changing world\n\n" +
      "Whether you are a hospitality professional, executive assistant, estate manager, protocol officer, business leader, entrepreneur, or aspiring leader, this book will challenge how you think, lead, and execute.\n\n" +
      "You are not here to participate in hospitality. You are here to define it.",
    purchaseLinks: [
      {
        platform: "Amazon Kindle",
        url: "https://www.amazon.com/dp/B0GX2Z6J6X",
        label: "Kindle eBook — Amazon",
        icon: "tablet",
      },
      {
        platform: "Amazon Paperback",
        url: "https://www.amazon.com/dp/9786872576",
        label: "Paperback — Amazon",
        icon: "book",
      },
    ],
  },
  // Future publications go here — copy the structure above
];

/* ─────────────────────────────────────────────────────────────
   PLATFORM ICON HELPER
───────────────────────────────────────────────────────────── */
function PlatformIcon({ type }: { type: PurchaseLink["icon"] }) {
  const cls = "w-3.5 h-3.5 flex-shrink-0";
  if (type === "cart") return <ShoppingCart className={cls} />;
  if (type === "tablet") return <Tablet className={cls} />;
  if (type === "heart") return <ExternalLink className={cls} />;
  return <BookOpen className={cls} />;
}

/* ─────────────────────────────────────────────────────────────
   PLATFORM COLOUR MAP
───────────────────────────────────────────────────────────── */
const PLATFORM_STYLES: Record<PurchaseLink["platform"], string> = {
  Selar:
    "bg-[#0B1F3A] text-white hover:bg-[#C8A96A] hover:text-[#0B1F3A]",
  "Amazon Paperback":
    "bg-white text-[#0B1F3A] border border-[#0B1F3A]/10 hover:border-[#0B1F3A] hover:bg-[#FAF9F6]",
  "Amazon Kindle":
    "bg-white text-[#0B1F3A] border border-[#0B1F3A]/10 hover:border-[#0B1F3A] hover:bg-[#FAF9F6]",
  "Ko-fi":
    "bg-white text-[#0B1F3A] border border-[#0B1F3A]/10 hover:border-[#C8A96A] hover:bg-[#FAF9F6]",
};

/* ─────────────────────────────────────────────────────────────
   FEATURED BOOK CARD
───────────────────────────────────────────────────────────── */
function FeaturedBookCard({ book }: { book: Publication }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border border-[#0B1F3A]/10 bg-white shadow-sm overflow-hidden border-t-4 border-t-[#0B1F3A]">

      {/* Cover */}
      <div className="lg:col-span-2 bg-[#0B1F3A] flex items-center justify-center p-12 lg:p-16 min-h-[360px] relative overflow-hidden">
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)",
          }}
        />
        <div className="relative z-10 w-44 lg:w-56 shadow-[0_24px_64px_rgba(0,0,0,0.55)] rotate-[-1.5deg] hover:rotate-0 transition-transform duration-700">
          <Image
            src={book.coverImage}
            alt={`${book.title} cover`}
            width={360}
            height={504}
            className="w-full h-auto block"
            priority
          />
        </div>
        {/* Featured ribbon */}
        <div className="absolute top-6 left-0 bg-[#C8A96A] text-[#0B1F3A] px-4 py-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.35em]">Featured Publication</span>
        </div>
      </div>

      {/* Details */}
      <div className="lg:col-span-3 p-10 lg:p-14 flex flex-col justify-between gap-10">
        <div className="space-y-6">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4">
            {book.isbn && (
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-[#0B1F3A]/8 px-3 py-1">
                ISBN {book.isbn}
              </span>
            )}
            {book.year && (
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-[#0B1F3A]/8 px-3 py-1">
                {book.year}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-4xl lg:text-5xl font-serif text-[#0B1F3A] leading-tight tracking-tight">
              {book.title}
            </h2>
            <p className="text-base font-serif italic text-slate-400 leading-relaxed max-w-lg">
              {book.subtitle}
            </p>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-6 h-px bg-[#C8A96A]" />
            <div>
              <p className="text-xs font-black text-[#0B1F3A] uppercase tracking-wider">{book.author}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{book.authorTitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm font-serif text-slate-500 leading-loose max-w-xl border-l-2 border-[#C8A96A]/30 pl-5 whitespace-pre-line">
            {book.description}
          </p>
        </div>

        {/* Purchase links */}
        <div className="space-y-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em]">
            Available on
          </p>
          <div className="flex flex-wrap gap-3">
            {book.purchaseLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2.5 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${PLATFORM_STYLES[link.platform]}`}
              >
                <PlatformIcon type={link.icon} />
                {link.label}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STANDARD BOOK CARD (for non-featured books)
───────────────────────────────────────────────────────────── */
function BookCard({ book }: { book: Publication }) {
  return (
    <div className="border border-[#0B1F3A]/10 bg-white shadow-sm overflow-hidden border-t-4 border-t-[#C8A96A] flex flex-col">
      {/* Cover thumbnail */}
      <div className="bg-[#0B1F3A] flex items-center justify-center p-8 min-h-[220px] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)",
          }}
        />
        <div className="relative z-10 w-28 shadow-[0_16px_40px_rgba(0,0,0,0.5)] rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
          <Image
            src={book.coverImage}
            alt={`${book.title} cover`}
            width={240}
            height={336}
            className="w-full h-auto block"
          />
        </div>
      </div>

      {/* Details */}
      <div className="p-8 flex flex-col flex-1 gap-6">
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-2xl font-serif text-[#0B1F3A] leading-tight">{book.title}</h3>
            <p className="text-xs font-serif italic text-slate-400 mt-1 leading-relaxed">{book.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-[#C8A96A]" />
            <p className="text-[10px] font-black text-[#0B1F3A] uppercase tracking-wider">{book.author}</p>
          </div>
          <p className="text-xs font-serif text-slate-500 leading-relaxed line-clamp-3">{book.description}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#0B1F3A]/8">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available on</p>
          <div className="flex flex-col gap-2">
            {book.purchaseLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 w-full justify-between ${PLATFORM_STYLES[link.platform]}`}
              >
                <span className="flex items-center gap-2">
                  <PlatformIcon type={link.icon} />
                  {link.label}
                </span>
                <ExternalLink className="w-3 h-3 opacity-40" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function AcademicPressPage() {
  const featured = PUBLICATIONS.filter((b) => b.featured);
  const rest = PUBLICATIONS.filter((b) => !b.featured);

  return (
    <div className="bg-[#FAF9F6] min-h-screen">

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div className="bg-white border-b border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
        <div className="container mx-auto px-6 lg:px-20 py-16 lg:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-[#C8A96A]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">
                Ashford & Gray Academy
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif text-[#0B1F3A] leading-tight tracking-tight">
              Academic Press
            </h1>
            <p className="text-base font-serif italic text-slate-400 leading-relaxed max-w-xl">
              Publications from the faculty and leadership of Ashford & Gray Academy —
              grounded in professional practice, written for practitioners.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-20 py-16 lg:py-24 space-y-20">

        {/* ── FEATURED PUBLICATIONS ──────────────────────── */}
        {featured.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-[#0B1F3A]/10 pb-6">
              <BookOpen className="w-5 h-5 text-[#C8A96A]" />
              <h2 className="text-sm font-black text-[#0B1F3A] uppercase tracking-[0.3em]">
                Latest Publication
              </h2>
            </div>
            <div className="space-y-10">
              {featured.map((book) => (
                <FeaturedBookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* ── ALL OTHER PUBLICATIONS ─────────────────────── */}
        {rest.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-[#0B1F3A]/10 pb-6">
              <BookOpen className="w-5 h-5 text-[#C8A96A]" />
              <h2 className="text-sm font-black text-[#0B1F3A] uppercase tracking-[0.3em]">
                All Publications
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* ── COMING SOON PLACEHOLDER (shows when only 1 book) */}
        {PUBLICATIONS.length < 3 && (
          <section className="space-y-8">
            {rest.length === 0 && (
              <div className="flex items-center gap-4 border-b border-[#0B1F3A]/10 pb-6">
                <BookOpen className="w-5 h-5 text-[#C8A96A]" />
                <h2 className="text-sm font-black text-[#0B1F3A] uppercase tracking-[0.3em]">
                  All Publications
                </h2>
              </div>
            )}
            <div className={`grid grid-cols-1 gap-6 ${rest.length > 0 ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {/* Placeholder slots */}
              {Array.from({ length: Math.max(0, 3 - PUBLICATIONS.length) }).map((_, i) => (
                <div
                  key={i}
                  className="border border-[#0B1F3A]/8 border-dashed bg-white/40 flex flex-col items-center justify-center min-h-[380px] p-10 text-center space-y-4"
                >
                  <div className="w-12 h-12 border border-[#0B1F3A]/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#C8A96A]/40" />
                  </div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.35em]">
                    Forthcoming
                  </p>
                  <p className="text-xs font-serif italic text-slate-300 max-w-[160px] leading-relaxed">
                    The next publication from our press is in preparation.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SUBMISSION / INFO NOTICE ───────────────────── */}
        <section className="border border-[#0B1F3A]/10 bg-white p-10 lg:p-14 border-t-4 border-t-[#0B1F3A]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-[#C8A96A]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">
                  Academic Press Office
                </span>
              </div>
              <h3 className="text-3xl font-serif text-[#0B1F3A] leading-tight">
                Publishing with Ashford & Gray
              </h3>
              <p className="text-sm font-serif text-slate-500 leading-relaxed">
                Our press publishes works grounded in professional practice — for
                hospitality, estate management, executive education, and institutional governance.
                If you are a faculty member or practitioner with a manuscript, we welcome
                enquiries through our registry office.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-start">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 bg-[#0B1F3A] hover:bg-[#C8A96A] hover:text-[#0B1F3A] text-white px-8 py-4 font-black text-[10px] uppercase tracking-widest transition-all duration-300"
              >
                Contact the Press Office
              </Link>
              <Link
                href="/faculty"
                className="inline-flex items-center justify-center gap-3 border border-[#0B1F3A]/10 bg-[#FAF9F6] hover:border-[#0B1F3A] text-[#0B1F3A] px-8 py-4 font-black text-[10px] uppercase tracking-widest transition-all duration-300"
              >
                Meet Our Faculty
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
