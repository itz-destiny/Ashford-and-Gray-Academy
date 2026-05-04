import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Goal, Users, Heart, Lightbulb, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export default function AboutPage() {
  const coreValues = [
    { name: 'Excellence', icon: ShieldCheck, desc: 'Unwavering commitment to the highest global standards.' },
    { name: 'Innovation', icon: Lightbulb, desc: 'Pioneering new ways to learn and lead in business.' },
    { name: 'Integrity', icon: Heart, desc: 'Fostering a community built on trust and authority.' },
    { name: 'Community', icon: Users, desc: 'Building a global network of distinct professionals.' },
  ];

  return (
    <div className="bg-white">
      {/* Top Banner */}
      <header className="py-32 bg-white text-center border-b border-slate-50">
        <div className="container px-6 lg:px-12">
          <ScrollAnimation animation="fade-in-up">
            <div className="inline-block px-4 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-[0.4em] rounded-full mb-8">
              Since 1994
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
              An Institution of <br />
              <span className="italic">Distinction.</span>
            </h1>
          </ScrollAnimation>
        </div>
      </header>

      {/* Who We Are */}
      <section className="py-32 container px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <ScrollAnimation animation="fade-in">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src="/imagefx-1.png"
                alt="Ashford & Gray modern campus"
                width={800}
                height={800}
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-in-up">
            <div className="space-y-8">
              <h2 className="text-4xl font-serif text-[#0B1F3A]">Who We Are</h2>
              <div className="w-16 h-1 bg-[#C8A96A]" />
              <p className="text-xl text-slate-500 leading-relaxed font-medium">
                Ashford & Gray Fusion Academy is more than an institution; it is a global ecosystem where professional mastery meets academic authority. We specialize in hospitality management, business innovation, and executive leadership.
              </p>
              <p className="text-lg text-slate-400 leading-relaxed">
                Our blended approach to education combines the rigor of traditional scholarship with the agility of modern industry practices.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="container px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollAnimation animation="fade-in-up" className="bg-[#0B1F3A] p-16 rounded-[3rem] text-white">
              <h3 className="text-3xl font-serif mb-6 text-[#C8A96A]">Our Vision</h3>
              <p className="text-xl leading-relaxed font-medium text-slate-300">
                To be the world’s most recognized authority in professional transformation, where every student graduates with the distinction to lead global markets.
              </p>
            </ScrollAnimation>
            
            <ScrollAnimation animation="fade-in-up" delay={100} className="bg-white p-16 rounded-[3rem] border border-slate-200">
              <h3 className="text-3xl font-serif mb-6 text-[#0B1F3A]">Our Mission</h3>
              <p className="text-xl leading-relaxed font-medium text-slate-500">
                To empower an elite community of learners by providing practical, industry-led curricula that commands authority and fosters international excellence.
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-32 bg-white">
        <div className="container px-6 lg:px-12 text-center max-w-4xl mx-auto">
          <ScrollAnimation animation="fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-serif text-[#0B1F3A] mb-12">The Philosophy</h2>
            <p className="text-2xl text-slate-600 leading-relaxed font-medium italic">
              "We believe that luxury is not an expense, but a standard of excellence. We teach our students to architect perception, command space, and lead with refined confidence."
            </p>
            <div className="mt-12 flex justify-center">
              <div className="w-px h-24 bg-[#C8A96A]" />
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 bg-slate-50 border-t border-slate-100">
        <div className="container px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif text-[#0B1F3A]">Core Values</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-12">
            {coreValues.map((value, idx) => (
              <ScrollAnimation key={value.name} animation="fade-in-up" delay={idx * 50}>
                <div className="text-center group">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center text-[#1F7A5A] shadow-sm group-hover:bg-[#1F7A5A] group-hover:text-white transition-all mb-6">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-serif text-[#0B1F3A] mb-3">{value.name}</h4>
                  <p className="text-slate-500 font-medium">{value.desc}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
