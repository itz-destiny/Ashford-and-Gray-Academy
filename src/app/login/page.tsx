"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";

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
  };

  return isLoginView ? (
    <LoginForm onSwitchToSignUp={() => toggleView('signup')} />
  ) : (
    <SignUpForm onSwitchToLogin={() => toggleView('login')} />
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">
          Loading
        </div>
      }
    >
      <LoginPageContent />
    </React.Suspense>
  );
}
