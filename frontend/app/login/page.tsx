"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { 
  Shield, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building2, 
  GraduationCap
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      setError(err.message || "The email or password you entered is incorrect.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-slate-100 lg:bg-white selection:bg-[#1D4ED8] selection:text-white">
      
      {/* LEFT SIDE: School Branding & Campus Image (Desktop & Tablet: hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative flex-col justify-between p-8 sm:p-12 xl:p-16 min-h-screen overflow-hidden">
        
        {/* Full-Height Campus Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: "url('/cec-campus.jpg')" }}
        >
          {/* Dark semi-transparent overlay for maximum text readability */}
          <div className="absolute inset-0 bg-slate-950/75"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/70"></div>
        </div>

        {/* Top Branding Section: Logo and School Titles directly below */}
        <div className="relative z-10 space-y-6 pt-2">
          {/* Official Cebu Eastern College Logo */}
          <div className="flex items-center">
            <img 
              src="/cec-logo.png" 
              alt="Cebu Eastern College Official Seal" 
              className="w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 object-contain rounded-full bg-white/95 p-1.5 shadow-2xl ring-2 ring-white/30" 
            />
          </div>

          {/* School Branding Text directly BELOW the logo */}
          <div className="space-y-2">
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl xl:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
              Cebu Eastern College
            </h1>
            <p className="text-base sm:text-lg xl:text-xl text-slate-200 font-medium tracking-wide drop-shadow-xs">
              School Portal System
            </p>
          </div>
        </div>

        {/* Bottom Academic Info & Semester Badge */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="font-medium tracking-wide text-slate-300">
            Office of the Registrar & Academic Services
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>A.Y. 2026–2027 • 1st Semester</span>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Authentication Panel */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between min-h-screen bg-slate-50 lg:bg-white p-4 sm:p-8 xl:p-12 overflow-y-auto">
        
        {/* Top Spacer or Mobile Header */}
        <div className="w-full max-w-md mx-auto pt-2 sm:pt-4">
          
          {/* Mobile-Only Institution Header Capsule */}
          <div className="lg:hidden flex items-center gap-3 pb-4 mb-4 border-b border-slate-200">
            <img 
              src="/cec-logo.png" 
              alt="Cebu Eastern College Seal" 
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-slate-200 shrink-0 shadow-xs" 
            />
            <div>
              <div className="font-sans font-bold text-sm tracking-tight text-slate-900 leading-tight">
                CEBU EASTERN COLLEGE
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-none mt-0.5 font-sans font-medium">
                School Portal System
              </div>
            </div>
          </div>
        </div>

        {/* Centered Login Card Form */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="bg-white border border-slate-200/90 rounded-none shadow-md lg:shadow-none p-5 sm:p-8">
            
            {/* DEMO NOTICE — Red-themed prominent disclaimer */}
            <div className="mb-4 sm:mb-5 font-sans">
              <div className="bg-red-50/80 border border-red-200 rounded-none px-3.5 py-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-[3px] shrink-0">
                    <Shield size={14} className="text-red-500" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 m-0 leading-none">
                      Demo Notice
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-red-700/90 leading-relaxed m-0 font-sans">
                      This prototype is for demo purposes only and is <span className="font-bold text-red-700">NOT the official CEC School Portal</span>. Demo accounts and data are simulated. Created by Roldan Jr.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-5 sm:mb-6">
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 m-0 tracking-tight leading-tight">
                Sign In
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 mt-2 font-sans leading-relaxed">
                Enter your registered university email or student ID to access your portal dashboard.
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
                  className={`w-full h-12 pl-10 pr-3.5 bg-white border rounded-none text-sm text-slate-900 focus:outline-none transition-all ${
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
                  Institutional Email or User ID
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
                  className={`w-full h-12 pl-10 pr-10 bg-white border rounded-none text-sm text-slate-900 focus:outline-none transition-all ${
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
                  Security Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-none hover:bg-slate-100 transition-colors cursor-pointer z-10"
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

              {/* Options Row: Remember & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="rounded-none border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]/30" 
                  />
                  <span className="text-slate-600 font-normal">Remember this workstation</span>
                </label>

                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Please contact the Registrar IT Helpdesk (registrar@cebueasterncollege.edu.ph) to reset your password.'); }}
                  className="text-xs text-[#1D4ED8] hover:text-[#1E40AF] hover:underline font-medium"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#172554] text-white py-2.5 sm:py-3 px-4 rounded-none text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border border-[#1E40AF] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3 font-sans min-h-[44px]"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Card Institutional Footer */}
            <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
              <span>
                Need help?{" "}
                <a 
                  href="mailto:registrar@cebueasterncollege.edu.ph"
                  className="text-[#1D4ED8] hover:underline font-semibold"
                >
                  Helpdesk
                </a>
              </span>

              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Building2 size={12} />
                <span>Cebu City</span>
              </span>
            </div>

          </div>
        </div>

        {/* Compliance Bottom Bar for Right Column */}
        <div className="w-full max-w-md mx-auto pt-4 pb-2 text-center text-xs text-slate-500 font-sans border-t border-slate-200/80">
          <div className="text-[11px] text-slate-500">
            © 2026 School Portal Prototype. For demonstration purposes only.
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Student Development Prototype • Not affiliated with CEC
          </div>
        </div>

      </div>

    </div>
  );
}
