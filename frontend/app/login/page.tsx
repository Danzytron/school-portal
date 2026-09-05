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
  HelpCircle, 
  Building2, 
  Home, 
  ExternalLink,
  CheckCircle2,
  Info
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
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans overflow-x-hidden bg-slate-100 lg:bg-transparent">
      
      {/* Full-Screen Campus Background Image - Visible on Desktop/Large screens only; Hidden on small screens */}
      <div 
        className="hidden lg:block fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/cec-campus.jpg')" }}
      >
        {/* Pure neutral black overlay (no blueish tint) */}
        <div className="absolute inset-0 bg-black/55"></div>
      </div>

      {/* Top Slim Institutional Identification Bar */}
      <header className="relative z-10 w-full px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between text-slate-800 lg:text-white border-b border-slate-200 lg:border-white/10 bg-white lg:bg-black/30 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img 
            src="/cec-logo.png" 
            alt="Cebu Eastern College Seal" 
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-xs" 
          />
          <div>
            <div className="font-heading font-bold text-xs sm:text-sm tracking-tight text-slate-900 lg:text-white leading-tight">
              CEBU EASTERN COLLEGE
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 lg:text-slate-300 uppercase tracking-wider leading-none mt-0.5 font-sans font-medium">
              OFFICE OF THE REGISTRAR & ACADEMIC SERVICES
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 lg:text-white bg-slate-100 lg:bg-black/40 px-3 py-1 rounded-full border border-slate-200 lg:border-white/15">
          <span className="w-2 h-2 rounded-full bg-emerald-500 lg:bg-emerald-400"></span>
          <span>A.Y. 2026–2027 • 1st Semester</span>
        </div>
      </header>

      {/* Main Responsive Layout: Two-Column Balance on Desktop; Focused Fluid Layout on Mobile */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-12 w-full">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: University Branding (Desktop Only: hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-6 text-white space-y-4 px-2 sm:px-4">
            <div className="space-y-4">
              <div>
                <img 
                  src="/cec-logo.png" 
                  alt="Cebu Eastern College" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl shrink-0" 
                />
              </div>
              <div className="space-y-1">
                <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight m-0 drop-shadow-sm">
                  CEBU EASTERN COLLEGE
                </h1>
                <p className="text-sm sm:text-base text-slate-200 font-medium tracking-wide m-0">
                  School Portal System
                </p>
              </div>

              <h2 className="font-heading text-lg sm:text-xl font-bold text-white/90 pt-2 m-0 drop-shadow-xs">
                Sign in to your account
              </h2>
            </div>
          </div>

          {/* Right Column / Mobile Centered Authentication Card */}
          <div className="w-full lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-none shadow-md lg:shadow-xl overflow-hidden border-t-4 border-t-[#1D4ED8]">
              
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
                      School Portal System
                    </div>
                  </div>
                </div>

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
                  <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 m-0 tracking-tight leading-tight">
                    Sign In
                  </h3>
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
          </div>

        </div>
      </main>

      {/* University Compliance Bottom Bar */}
      <footer className="relative z-10 w-full px-4 sm:px-8 lg:px-12 py-3 text-center text-xs text-slate-500 lg:text-slate-300 font-sans bg-white lg:bg-black/50 backdrop-blur-xs border-t border-slate-200 lg:border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <div>
            © 2026 School Portal Prototype. For demonstration purposes only. Not affiliated with CEC.
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
            Student Development Prototype
          </div>
        </div>
      </footer>

    </div>
  );
}
