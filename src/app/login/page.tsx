"use client";

import React, { useState, useEffect }from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";
import { Star } from "lucide-react";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [isLoginView, setIsLoginView] = useState(true);

  useEffect(() => {
    setIsLoginView(searchParams.get('view') !== 'signup');
  }, [searchParams]);

  const toggleView = (view: 'login' | 'signup') => {
    const url = new URL(window.location.href);
    if (view === 'signup') {
        url.searchParams.set('view', 'signup');
    } else {
        url.searchParams.delete('view');
    }
    window.history.replaceState({ ...window.history.state, as: url.toString(), url: url.toString() }, '', url.toString());
    setIsLoginView(view === 'login');
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Left Image Section */}
      <div className="relative flex-col items-center justify-center hidden bg-[#0B1F3A] lg:flex overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/academy_hero_students.png"
            alt="Students at Ashford and Gray Academy"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 p-12 lg:p-24 text-white w-full max-w-3xl mx-auto flex flex-col justify-between h-full">
            <div>
                <Logo variant="white" />
                <h1 className="text-5xl lg:text-8xl font-serif mt-24 tracking-tight leading-[0.9]">
                    The Portal to <br />
                    <span className="italic text-[#C8A96A]">Excellence.</span>
                </h1>
                <p className="mt-10 text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                    Enter the world’s most prestigious platform for executive mastery and professional distinction.
                </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] mt-auto">
               <div className="flex gap-2 text-[#C8A96A] mb-8">
                 {Array.from({length: 5}).map((_, i) => (
                   <Star key={i} className="w-5 h-5 fill-current" />
                 ))}
               </div>
               <p className="text-2xl font-serif text-white mb-10 tracking-tight leading-relaxed">"The Ashford & Gray certification was the catalyst for my career transition into global leadership."</p>
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-slate-500 border-2 border-white/20 overflow-hidden relative">
                    <Image src="/sarah-jenkins.jpg" alt="Sarah Jenkins" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-white text-xl">Sarah Jenkins</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A96A]">Executive Alumna</p>
                  </div>
               </div>
            </div>

            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-16">
                &copy; {new Date().getFullYear()} Ashford & Gray Academy. Distinction in every detail.
            </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-white max-h-screen overflow-y-auto w-full">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
         
         <div className="w-full max-w-[480px] relative z-10 py-10">
            <div className="lg:hidden mb-12 flex justify-center">
              <Logo className="text-slate-950 w-48" />
            </div>

            {isLoginView ? (
                <LoginForm onSwitchToSignUp={() => toggleView('signup')} />
            ) : (
                <SignUpForm onSwitchToLogin={() => toggleView('login')} />
            )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black">Loading...</div>}>
      <LoginPageContent />
    </React.Suspense>
  )
}
