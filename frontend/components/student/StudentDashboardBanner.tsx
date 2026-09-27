import React from 'react';
import { User } from '@/types';

interface StudentDashboardBannerProps {
  user: User | null;
  academicInfo?: {
    courseCode?: string;
    section?: string;
    yearLevel?: number | string;
    semester?: string;
    studentNumber?: string;
    motto?: string;
  };
  className?: string;
}

export function StudentDashboardBanner({
  user,
  academicInfo,
  className = '',
}: StudentDashboardBannerProps) {
  // Student Name
  const studentName = user?.name || 'Juan Dela Cruz';

  // Academic Subtitle Line
  const courseCode = academicInfo?.courseCode || 'BSIT';
  const section = academicInfo?.section || '3-1';
  const semester = academicInfo?.semester || '1st Semester AY 2026–2027';
  const motto = academicInfo?.motto || '“Small steps every day lead to big goals.”';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-blue-200/70 bg-[#EFF6FF] shadow-xs select-none ${className}`}
    >
      {/* Cebu Eastern College building background positioned on the right with soft blue fade */}
      <div
        className="absolute inset-0 bg-no-repeat bg-right bg-cover transition-all"
        style={{
          backgroundImage: `url('/cec-student-banner-bg.png')`,
          backgroundPosition: 'right center',
        }}
        aria-hidden="true"
      />

      {/* Responsive progressive portal blue/white gradient overlay ensuring crystal clear text contrast on left */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#EFF6FF] via-[#EFF6FF]/92 to-transparent w-full sm:w-2/3 md:w-3/5 pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle top & bottom edge softening */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/5 pointer-events-none"
        aria-hidden="true"
      />

      {/* Student Information Container */}
      <div className="relative z-10 px-5 py-5 sm:px-7 sm:py-6 md:px-8 md:py-7 flex flex-col justify-center min-h-[110px] sm:min-h-[125px] md:min-h-[135px]">
        {/* Prominent Student Name */}
        <h1 className="font-heading text-xl sm:text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 m-0 leading-tight">
          {studentName}
        </h1>

        {/* Academic Details (Course, Section, Semester) */}
        <div className="mt-1 sm:mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-sans text-slate-600 sm:text-slate-700">
          <span className="font-semibold text-[#1D4ED8]">
            {courseCode} {section}
          </span>
          <span className="text-slate-300 select-none">|</span>
          <span className="text-slate-600 font-medium">
            {semester}
          </span>
        </div>

        {/* Subtle Motto / Academic Quote */}
        {motto && (
          <p className="mt-2 sm:mt-2.5 text-[11px] sm:text-xs text-slate-500 font-sans italic">
            {motto}
          </p>
        )}
      </div>
    </div>
  );
}

export default StudentDashboardBanner;
