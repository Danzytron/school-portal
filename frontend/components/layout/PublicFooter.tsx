"use client";

import Link from "next/link";
import { MapPin, Mail, Phone, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="relative z-10 w-full bg-[#1E3A8A] text-white border-t-4 border-t-[#1D4ED8] font-sans">
      {/* Main Multi-Column Footer Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: School Branding (prominent) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/cec-logo.png"
                alt="Cebu Eastern College Official Seal"
                className="w-12 h-12 object-contain shrink-0 drop-shadow-md"
              />
              <div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight m-0">
                  Cebu Eastern College
                </h3>
                <p className="text-xs text-blue-200 font-medium tracking-wide m-0">
                  School Portal System
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed max-w-sm font-sans pt-1">
              Providing students, faculty, and academic staff with secure online access to academic grades, course enrollment, class schedules, and university services.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-blue-200/90 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span>Secure Institutional Authentication</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 m-0 font-sans">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-sans list-none p-0 m-0">
              <li>
                <Link
                  href="/"
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/student"
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1"
                >
                  Student Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher"
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1"
                >
                  Faculty Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support / Help */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 m-0 font-sans">
              Support &amp; Help
            </h4>
            <ul className="space-y-2 text-xs font-sans list-none p-0 m-0">
              <li>
                <a
                  href="mailto:registrar@cebueasterncollege.edu.ph"
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>Registrar Helpdesk</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+63322561188"
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>(032) 256-1188</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("For login assistance or password inquiries, please contact the Registrar IT Helpdesk at registrar@cebueasterncollege.edu.ph or visit the Registrar's Office on campus.");
                  }}
                  className="text-blue-100 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>Password &amp; Access Help</span>
                </a>
              </li>
              <li>
                <span className="text-[11px] text-blue-200/75 block pt-1 leading-normal">
                  Office Hours: Mon – Fri, 8:00 AM – 5:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 m-0 font-sans">
              Contact Information
            </h4>
            <div className="space-y-2.5 text-xs font-sans">
              <div className="flex items-start gap-2 text-blue-100">
                <MapPin className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div className="font-medium text-white">Leon Kilat Street</div>
                  <div className="text-blue-200">Cebu City, 6000, Cebu</div>
                  <div className="text-[11px] text-blue-200/80">Philippines</div>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-blue-200/80">
                <span>Official Web Address: </span>
                <span className="text-white font-medium">cebucecportal.site</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle Separator & Bottom Legal Bar */}
      <div className="border-t border-blue-800/80 bg-[#172554]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-blue-200/90">
          <div className="text-center sm:text-left">
            &copy; 2026 <strong>Cebu Eastern College</strong>. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4 text-[11.5px]">
            <Link
              href="/privacy"
              className="text-blue-200 hover:text-white transition-colors duration-150"
            >
              Privacy Policy
            </Link>
            <span className="text-blue-400/60">&bull;</span>
            <Link
              href="/terms"
              className="text-blue-200 hover:text-white transition-colors duration-150"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
