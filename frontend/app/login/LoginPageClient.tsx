"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { 
  AlertCircle,
  Shield, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  ArrowRight, 
  HelpCircle, 
  Building2, 
  Home, 
  ExternalLink,
  CheckCircle2,
  Info
} from "lucide-react";
import Link from "next/link";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/security/TurnstileWidget";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function LoginPageClient() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError((prev) => (prev.includes("verification") ? "" : prev));
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("");
    setError("Security verification expired. Please verify again.");
  }, []);

  const handleTurnstileError = useCallback((errorCode: string) => {
    setTurnstileToken("");
    console.warn("[TURNSTILE] Login page error callback:", errorCode);
    setError("Security verification could not be completed. Please refresh the page and try again.");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!turnstileToken) {
      setError("Please complete the Cloudflare security verification before signing in.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password, turnstileToken });
    } catch (err: any) {
      setError(err.message || "The email or password you entered is incorrect.");
      setLoading(false);
      // Reset Turnstile token on failed attempt
      setTurnstileToken("");
      turnstileRef.current?.reset();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans overflow-x-hidden bg-slate-50 lg:bg-transparent">
      
      {/* Campus Background Image with All-Blue Institutional Gradient Overlay - Visible on Desktop only */}
      <div 
        className="hidden lg:block fixed inset-0 bg-[#061B3E] bg-cover bg-center bg-no-repeat z-0 pointer-events-none"
        style={{ backgroundImage: "url('/cec-campus.jpg')" }}
      >
        {/* Base All-Blue Gradient: Deep Institutional Navy on Left -> Rich Royal/Sapphire Blue on Right */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-[#061B3E]/94 via-[#0A2960]/90 via-50%-[#0E3A88]/88 to-[#164798]/90"
        />
        
        {/* Ambient Radial Glow for Rich Blue Depth */}
        <div className="absolute inset-y-0 left-0 w-3/5 bg-[radial-gradient(ellipse_at_15%_35%,rgba(29,78,216,0.4),transparent_75%)]" />
        <div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(ellipse_at_85%_65%,rgba(37,99,235,0.25),transparent_75%)]" />
        
        {/* Soft Ambient Depth Spheres in Cohesive Blue Tones */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[#1E40AF]/30 blur-3xl" />
        <div className="absolute -bottom-32 left-[10%] w-[580px] h-[580px] rounded-full bg-[#071836]/40 blur-3xl" />
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-[#1E3A8A]/25 blur-3xl" />
        <div className="absolute -bottom-32 right-[5%] w-[520px] h-[520px] rounded-full bg-[#1D4ED8]/20 blur-3xl" />

        {/* Subtle Watermark Seal on Left side (Original Colors, NOT inverted) */}
        <div className="absolute top-1/2 left-[5%] -translate-y-1/2 w-[560px] h-[560px] opacity-[0.14] select-none pointer-events-none">
          <img 
            src="/cec-logo.png" 
            alt="Cebu Eastern College Seal Watermark" 
            aria-hidden="true" 
            className="w-full h-full object-contain" 
          />
        </div>
      </div>

      {/* Main Responsive Layout: Two-Column Balance on Desktop; Focused Fluid Layout on Mobile */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-12 w-full my-auto">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: University Branding & Information (Desktop Only: hidden on mobile) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center text-white px-4 sm:px-6 lg:pr-8 select-text">
            
            {/* Primary Institutional Branding Block */}
            <div className="space-y-4">
              <div className="inline-block">
                <img 
                  src="/cec-logo.png" 
                  alt="Cebu Eastern College Official Seal and Logo" 
                  className="w-20 h-20 xl:w-24 xl:h-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] shrink-0 select-none" 
                  draggable={false}
                />
              </div>

              {/* School Name & Subtitle */}
              <div className="space-y-2 select-text">
                <h1 className="font-heading font-black text-3xl sm:text-4xl xl:text-[40px] text-white tracking-tight leading-[1.14] drop-shadow-md m-0 uppercase select-text">
                  CEBU EASTERN COLLEGE
                </h1>
                
                <div className="text-white font-sans text-xs sm:text-sm font-semibold tracking-widest uppercase select-text">
                  <span className="select-text text-white">Easternian School Portal System</span>
                </div>
              </div>
            </div>

            {/* Supporting Information Section - cleanly spaced after subtitle without divider line */}
            <div className="mt-8 space-y-3 select-text">
              <h2 className="font-heading text-lg sm:text-xl xl:text-[22px] font-bold text-white tracking-tight m-0 leading-snug select-text">
                Sign in to your account
              </h2>

              <p className="text-xs sm:text-[13.5px] text-blue-100/85 font-sans leading-relaxed max-w-md m-0 font-normal select-text">
                Cebu Eastern College Portal provides students, faculty, and academic staff with online access to enrollment, academic grades, class schedules, and other academic services.
              </p>
            </div>

          </div>

          {/* Right Column / Mobile Centered Authentication Card */}
          <div className="w-full lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-xl shadow-md lg:shadow-2xl overflow-hidden border-t-4 border-t-[#1D4ED8]">
              
              <div className="p-5 sm:p-8">
                
                {/* Mobile-Only Institution Header Capsule */}
                <div className="lg:hidden flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                  <img 
                    src="/cec-logo.png" 
                    alt="Cebu Eastern College Seal" 
                    className="w-10 h-10 object-contain shrink-0 drop-shadow-xs" 
                  />
                  <div>
                    <div className="font-sans font-bold text-sm tracking-tight text-slate-900 leading-tight">
                      CEBU EASTERN COLLEGE
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-none mt-0.5 font-sans font-medium">
                      Easternian School Portal System
                    </div>
                  </div>
                </div>

                {/* DEMO NOTICE — Clean banner matching reference layout */}
                <div className="mb-4 sm:mb-5 font-sans">
                  <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-xl px-3.5 py-3 flex items-start gap-2.5 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-white fill-[#BE123C] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-[12.5px] text-[#9F1239] leading-relaxed m-0 font-sans">
                      This prototype is for demo purposes only and is <span className="font-semibold text-[#881337]">NOT the official CEC School Portal</span>. Demo accounts and data are simulated. Created by Roldan Jr.
                    </p>
                  </div>
                </div>

                {/* Form Header */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 m-0 tracking-tight leading-tight">
                    Sign In
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-2 font-sans leading-relaxed">
                    Enter your registered email or student ID to access your portal dashboard.
                  </p>
                </div>

                {/* Authentication Form */}
                <form onSubmit={handleSubmit} className="space-y-4 font-sans pt-1">
                  
                  {/* Floating Label Input: Email / Username */}
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 z-10 transition-colors">
                      <User size={18} className={error ? 'text-red-500' : (emailFocused ? 'text-[#1D4ED8]' : 'text-slate-400')} />
                    </div>
                    
                    <input
                      ref={emailInputRef}
                      id="institutional-email"
                      name="email"
                      type="text"
                      className={`w-full h-12 pl-10 pr-3.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-all ${
                        error
                          ? 'border-red-500 ring-2 ring-red-500/15'
                          : (emailFocused 
                              ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/15' 
                              : 'border-slate-300 hover:border-slate-400')
                      }`}
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder={emailFocused ? "Enter your email or student ID" : ""}
                      required
                      autoFocus
                    />

                    <label
                      htmlFor="institutional-email"
                      className={`absolute transition-all duration-200 pointer-events-none ${
                        emailFocused || email
                          ? '-top-2.5 left-8 bg-white px-1.5 text-xs font-bold ' + (error ? 'text-red-600' : (emailFocused ? 'text-[#1D4ED8]' : 'text-slate-700'))
                          : (error ? 'left-10 top-1/2 -translate-y-1/2 text-sm text-red-500 font-normal' : 'left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-normal')
                      }`}
                    >
                      Email or Student ID
                    </label>
                  </div>

                  {/* Floating Label Input: Password */}
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 z-10 transition-colors">
                      <Lock size={18} className={error ? 'text-red-500' : (passwordFocused ? 'text-[#1D4ED8]' : 'text-slate-400')} />
                    </div>
                    
                    <input
                      ref={passwordInputRef}
                      id="security-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full h-12 pl-10 pr-10 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-all ${
                        error
                          ? 'border-red-500 ring-2 ring-red-500/15'
                          : (passwordFocused 
                              ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/15' 
                              : 'border-slate-300 hover:border-slate-400')
                      }`}
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder={passwordFocused ? "Enter your password" : ""}
                      required
                    />

                    <label
                      htmlFor="security-password"
                      className={`absolute transition-all duration-200 pointer-events-none ${
                        passwordFocused || password
                          ? '-top-2.5 left-8 bg-white px-1.5 text-xs font-bold ' + (error ? 'text-red-600' : (passwordFocused ? 'text-[#1D4ED8]' : 'text-slate-700'))
                          : (error ? 'left-10 top-1/2 -translate-y-1/2 text-sm text-red-500 font-normal' : 'left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-normal')
                      }`}
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer z-10"
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  </div>

                  {/* Inline Error Message below Password Field */}
                  {error && (
                    <p className="-mt-2.5 mb-1 text-xs text-red-500 font-normal text-left animate-in fade-in duration-150 font-sans leading-relaxed">
                      {error}
                    </p>
                  )}

                  {/* Options Row: Forgot Password */}
                  <div className="flex items-center justify-end text-xs pt-0.5">
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert('Please contact the Registrar IT Helpdesk (registrar@cebueasterncollege.edu.ph) to reset your password.'); }}
                      className="text-xs text-[#1D4ED8] hover:text-[#1E40AF] hover:underline font-medium"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Cloudflare Turnstile Verification Widget - Clean Original Layout */}
                  <div className="flex items-center justify-center my-2 overflow-hidden">
                    <TurnstileWidget
                      ref={turnstileRef}
                      onVerify={handleTurnstileVerify}
                      onExpire={handleTurnstileExpire}
                      onError={handleTurnstileError}
                      theme="light"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#172554] text-white py-2.5 sm:py-3 px-4 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border border-[#1E40AF] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 font-sans min-h-[44px]"
                  >
                    {loading ? (
                      <span>Signing In...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                {/* Card Institutional Footer */}
                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500 font-sans">
                  <span>
                    Need help?{" "}
                    <a 
                      href="mailto:registrar@cebueasterncollege.edu.ph"
                      className="text-[#1D4ED8] hover:underline font-semibold"
                    >
                      Helpdesk
                    </a>
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Professional University Portal Footer */}
      <PublicFooter />

    </div>
  );
}
