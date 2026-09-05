"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { 
  Shield, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building2, 
  GraduationCap,
  Sparkles
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-slate-100 lg:bg-[#0A1128] text-slate-900 selection:bg-blue-500 selection:text-white">
      
      {/* =========================================================================
          LEFT SIDE: Hero Branding & Campus Showcase (Desktop & Large screens only)
          ========================================================================= */}
      <section className="hidden lg:flex lg:w-7/12 xl:w-3/5 relative flex-col justify-between p-10 xl:p-16 text-white overflow-hidden z-0">
        
        {/* Full-Height Campus Background Image with Dark Semi-Transparent Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 z-0"
          style={{ backgroundImage: "url('/cec-campus.jpg')" }}
        >
          {/* Multi-stage High-Legibility Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/65"></div>
          <div className="absolute inset-0 bg-radial-[at_top_left] from-blue-900/40 via-transparent to-black/80"></div>
        </div>

        {/* Top Header Area: Cebu Eastern College Logo & Institutional Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 group">
            <div className="relative p-1 rounded-full bg-white/95 ring-2 ring-white/30 shadow-lg backdrop-blur-xs transition-transform duration-300 group-hover:scale-105 shrink-0">
              <img 
                src="/cec-logo.jpg" 
                alt="Cebu Eastern College Official Seal" 
                className="w-12 h-12 object-contain rounded-full" 
              />
            </div>
            <div>
              <div className="font-heading font-extrabold text-base tracking-tight text-white drop-shadow-sm leading-tight">
                CEBU EASTERN COLLEGE
              </div>
              <div className="text-[10px] text-blue-200/90 font-semibold tracking-wider uppercase mt-0.5 font-sans">
                Office of the Registrar & Academic Services
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-blue-100 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">A.Y. 2026–2027 • 1st Semester</span>
          </div>
        </div>

        {/* Center Hero Content: Two-Part Headline & Description */}
        <div className="relative z-10 my-auto py-12 max-w-2xl space-y-6">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide backdrop-blur-sm shadow-xs">
            <Sparkles size={14} className="text-blue-300" />
            <span>University Information System</span>
          </div>

          {/* Large Two-Part Headline (Accent Color + Light Text) */}
          <h1 className="font-heading text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md">
            <span className="text-[#60A5FA] bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
              Academic
            </span>{" "}
            Portal
          </h1>

          {/* Explanatory Description */}
          <p className="text-base xl:text-lg text-slate-200/90 leading-relaxed font-normal max-w-xl drop-shadow-xs">
            The comprehensive online portal for students, faculty, and administrators of Cebu Eastern College. Access academic records, schedules, enrollment, and official school services in one unified platform.
          </p>

          {/* Academic Features Pill List */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {[
              "Student Enrollment",
              "Academic Grades",
              "Class Timetable",
              "Faculty Services",
              "Announcements"
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/10 text-xs font-medium text-blue-100 transition-colors cursor-default"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Left Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <div>
            © 2026 Cebu Eastern College Portal Prototype
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Building2 size={13} className="text-blue-400" />
            <span>Cebu City, Philippines</span>
          </div>
        </div>

      </section>

      {/* =========================================================================
          RIGHT SIDE: Clean, Bright, Minimal Authentication Panel
          ========================================================================= */}
      <main className="w-full lg:w-5/12 xl:w-2/5 flex flex-col justify-between bg-white min-h-screen z-10 shadow-2xl relative">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden w-full px-5 py-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/80 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <img 
              src="/cec-logo.jpg" 
              alt="Cebu Eastern College" 
              className="w-8 h-8 object-contain rounded-full bg-white p-0.5 border border-slate-200 shrink-0" 
            />
            <div>
              <div className="font-heading font-bold text-xs tracking-tight text-slate-900 leading-tight">
                CEBU EASTERN COLLEGE
              </div>
              <div className="text-[9px] text-slate-500 font-medium tracking-wider uppercase">
                School Portal
              </div>
            </div>
          </div>

          <div className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-100">
            A.Y. 2026–2027
          </div>
        </header>

        {/* Centered Login Form Content Area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 xl:p-14">
          <div className="w-full max-w-md space-y-6">
            
            {/* Header / Intro */}
            <div className="space-y-2">
              <div className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] uppercase tracking-wider">
                <GraduationCap size={16} />
                <span>Account Authentication</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
                Sign In
              </h2>

              <p className="text-xs sm:text-[13px] text-slate-600 font-sans leading-relaxed m-0">
                Enter your institutional email or User ID to access your portal dashboard.
              </p>
            </div>

            {/* Prototype Demo Disclaimer Notice */}
            <div className="bg-red-50/80 border border-red-200/90 rounded-lg p-3 sm:p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  <Shield size={15} className="text-red-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 m-0 leading-none">
                    Demo Notice
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-red-800/90 leading-relaxed m-0">
                    This prototype is for testing and demonstration purposes only and is <span className="font-semibold text-red-700">NOT the official CEC portal</span>. Created by Roldan Jr.
                  </p>
                </div>
              </div>
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
                  required
                  autoFocus
                />

                <label
                  htmlFor="institutional-email"
                  className={`absolute transition-all duration-200 pointer-events-none ${
                    emailFocused || email
                      ? '-top-2.5 left-8 bg-white px-1.5 text-xs font-semibold ' + (error ? 'text-red-600' : (emailFocused ? 'text-[#1D4ED8]' : 'text-slate-700'))
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
                  required
                />

                <label
                  htmlFor="security-password"
                  className={`absolute transition-all duration-200 pointer-events-none ${
                    passwordFocused || password
                      ? '-top-2.5 left-8 bg-white px-1.5 text-xs font-semibold ' + (error ? 'text-red-600' : (passwordFocused ? 'text-[#1D4ED8]' : 'text-slate-700'))
                      : (error ? 'left-10 top-1/2 -translate-y-1/2 text-sm text-red-500 font-normal' : 'left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-normal')
                  }`}
                >
                  Security Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer z-10"
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
                    className="rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]/30" 
                  />
                  <span className="text-slate-600 font-normal">Remember this workstation</span>
                </label>

                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Please contact the Registrar IT Helpdesk (registrar@cebueasterncollege.edu.ph) to reset your password.'); }}
                  className="text-xs text-[#1D4ED8] hover:text-[#1E40AF] hover:underline font-semibold"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#172554] text-white py-3 px-4 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 border border-[#1E40AF] shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 font-sans min-h-[46px]"
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

            {/* Bottom Support Info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
              <span>
                Need help signing in?{" "}
                <a 
                  href="mailto:registrar@cebueasterncollege.edu.ph"
                  className="text-[#1D4ED8] hover:underline font-semibold"
                >
                  Helpdesk
                </a>
              </span>

              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Building2 size={13} />
                <span>Cebu City</span>
              </span>
            </div>

          </div>
        </div>

        {/* Mobile / Card Bottom Copyright Bar */}
        <footer className="w-full px-6 py-4 text-center text-xs text-slate-400 font-sans border-t border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 max-w-md mx-auto text-[11px]">
            <div>© 2026 Cebu Eastern College Portal</div>
            <div className="text-slate-400">Testing Prototype</div>
          </div>
        </footer>

      </main>

    </div>
  );
}

