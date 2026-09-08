import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | Cebu Eastern College School Portal",
  description: "Official Privacy Policy for the Cebu Eastern College (CEC) School Portal, outlining compliance with Republic Act No. 10173 (Data Privacy Act of 2012).",
};

export default function PrivacyPolicyPage() {
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

      {/* Main Privacy Document Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full">
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1D4ED8] text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              <Shield size={13} />
              <span>Data Protection &amp; Governance</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Effective Date: Academic Year 2025–2026 | Last updated: September 2026
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">1. Institutional Commitment</h2>
            <p>
              Cebu Eastern College (CEC) values and respects the privacy of all students, applicants, faculty members, and academic personnel. This Privacy Policy governs the collection, processing, and protection of personal data in the Cebu Eastern College School Portal in accordance with <strong>Republic Act No. 10173</strong>, commonly known as the <em>Data Privacy Act of 2012</em> of the Philippines.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">2. Information Collected</h2>
            <p>
              When utilizing the School Portal, the following categories of information may be collected and processed:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Student Credentials:</strong> Full name, student identification number, enrolled program, course curriculum, and year level.</li>
              <li><strong>Academic Records:</strong> Course enrollment, grades, attendance logs, and academic evaluation remarks.</li>
              <li><strong>Contact Details:</strong> Institutional email address, residential address, and contact numbers.</li>
              <li><strong>System Logs:</strong> Access timestamps, IP addresses, and authentication records for cybersecurity and fraud prevention.</li>
            </ul>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">3. Purpose of Processing</h2>
            <p>
              Data processed within this portal is strictly intended for official academic and administrative operations, including course scheduling, grade computation, enrollment management, and institutional communications. CEC does not sell or share student or faculty information with commercial third parties.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 m-0">4. Contact the Data Protection Office</h2>
            <p>
              For inquiries, corrections, or requests regarding personal data under the Data Privacy Act, please contact:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-1 font-sans">
              <div className="font-semibold text-slate-900">Office of the Registrar / Data Privacy Officer</div>
              <div>Cebu Eastern College</div>
              <div>Leon Kilat Street, Cebu City, 6000, Cebu</div>
              <div>Email: <a href="mailto:registrar@cebueasterncollege.edu.ph" className="text-[#1D4ED8] hover:underline">registrar@cebueasterncollege.edu.ph</a></div>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
