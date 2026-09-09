import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Terms of Use | Cebu Eastern College School Portal",
  description: "Terms and conditions of use for the Cebu Eastern College (CEC) School Portal system.",
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans text-slate-800">
      {/* Top University Brand Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/cec-logo.png"
              alt="Cebu Eastern College Official Logo"
              className="w-10 h-10 object-contain shrink-0"
            />
            <div>
              <div className="font-heading font-extrabold text-sm sm:text-base text-slate-900 leading-tight group-hover:text-[#1D4ED8] transition-colors">
                CEBU EASTERN COLLEGE
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide">
                School Portal System
              </div>
            </div>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Main Terms Document Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full">
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1D4ED8] text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              <BookOpen size={13} />
              <span>Portal Guidelines &amp; Conditions</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
              Terms of Use
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Academic Year 2025–2026 | Cebu Eastern College Portal System
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">1. Acceptance of Terms</h2>
            <p>
              By accessing and logging into the Cebu Eastern College (CEC) School Portal, you agree to comply with all institutional policies, academic codes of conduct, and applicable Philippine cyber laws.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">2. Account Responsibility</h2>
            <p>
              Users are responsible for safeguarding their login credentials and one-time passwords. Sharing passwords or attempting unauthorized access to another student or faculty member’s account is strictly prohibited and subject to institutional disciplinary action.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">3. Appropriate Use</h2>
            <p>
              The portal is provided solely for official university enrollment, viewing grades, scheduling, and academic communications. Any attempt to compromise system integrity, deploy malicious scripts, or alter recorded data will result in immediate termination of access and investigation.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">4. Support &amp; Queries</h2>
            <p>
              For account questions, discrepancies in academic records, or technical difficulties, please report directly to the Registrar IT Helpdesk at <a href="mailto:registrar@cebueasterncollege.edu.ph" className="text-[#1D4ED8] hover:underline font-medium">registrar@cebueasterncollege.edu.ph</a>.
            </p>
          </section>

        </div>
      </main>

      <PublicFooter theme="light" />
    </div>
  );
}
