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
      <div className="relative flex-col items-center justify-center hidden bg-slate-950 lg:flex overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/academy_hero_students.png"
            alt="Students at Ashford and Gray Academy"
            fill
            className="object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 p-12 lg:p-20 text-white w-full max-w-2xl mx-auto flex flex-col justify-between h-full">
            <div>
                <Logo className="text-white w-48" />
                <h1 className="text-5xl lg:text-7xl font-black mt-20 tracking-tighter leading-[1.1]">
                    Welcome to the <br />
                    <span className="text-indigo-400">Next Level.</span>
                </h1>
                <p className="mt-8 text-xl text-slate-300 font-medium max-w-lg leading-relaxed">
                    Join an elite community of professionals mastering hospitality, domestic management, and global relations.
                </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] mt-auto">
               <div className="flex gap-1 text-yellow-500 mb-6">
                 {Array.from({length: 5}).map((_, i) => (
                   <Star key={i} className="w-5 h-5 fill-current" />
                 ))}
               </div>
               <p className="text-xl font-black text-white mb-8 tracking-tight leading-snug">"The certification program completely transformed my career trajectory in luxury hospitality."</p>
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-500 border-2 border-white/20" />
                  <div>
                    <h4 className="font-black text-white text-lg">Sarah Jenkins</h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Executive Butler</p>
                  </div>
               </div>
            </div>

            <div className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mt-12 pb-8">
                &copy; {new Date().getFullYear()} Ashford & Gray Academy.
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
