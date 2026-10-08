'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { StudentDashboard, Announcement } from '@/types';
import { StudentDashboardSkeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Award, 
  GraduationCap, 
  MapPin, 
  User as UserIcon,
  ChevronRight, 
  ArrowRight,
  FileCheck,
  Building2,
  Users,
  Megaphone,
  Sparkles,
  ClipboardList,
  AlertCircle,
  Star,
  UserCheck,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Video,
  ExternalLink,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';

interface HomeworkItem {
  id: string;
  course: string;
  assignment: string;
  dueDate: string;
  status: 'Submitted' | 'In Progress' | 'Pending';
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboard>({
    enrolled_subjects: 14,
    gpa: '1.25',
    attendance_rate: 98.5,
    current_semester: '1st Semester A.Y. 2026-2027',
    enrollment_status: 'enrolled',
    upcoming_classes: [],
    recent_announcements: []
  } as any);
  const [bulletins, setBulletins] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardAndBulletins = async () => {
      try {
        const [dashRes, annRes] = await Promise.allSettled([
          api.get<StudentDashboard>('/student/dashboard'),
          api.get('/announcements')
        ]);

        if (dashRes.status === 'fulfilled') {
          const dashboardData = (dashRes.value as any).data || dashRes.value;
          if (dashboardData) {
            setData(dashboardData);
          }
        }

        if (annRes.status === 'fulfilled') {
          const annData = Array.isArray(annRes.value) 
            ? annRes.value 
            : ((annRes.value as any)?.data && Array.isArray((annRes.value as any).data) ? (annRes.value as any).data : []);
          setBulletins(annData.filter((a: any) => a.is_published !== false));
        }
      } catch {
        // Retain verified fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAndBulletins();
  }, []);

  const todayClasses = [
    {
      code: 'IT SIA31',
      name: 'System Integration and Architecture 2',
      instructor: 'Sir Charles Bacotot',
      time: '07:30 AM – 08:30 AM',
      duration: '60 Mins',
      room: 'Room OL 110 (Main Bldg)',
      status: 'In Progress',
      statusColor: 'bg-blue-50 text-[#2563EB] border-blue-200',
      actionLabel: 'Join Live Stream'
    },
    {
      code: 'IT EVD31',
      name: 'Event Driven Programming (Lecture)',
      instructor: 'Sir Yestin Prado',
      time: '08:30 AM – 09:30 AM',
      duration: '60 Mins',
      room: 'Room OL 107 (Tech Wing)',
      status: 'Next Up',
      statusColor: 'bg-sky-50 text-sky-700 border-sky-200',
      actionLabel: 'Class Room OL 107'
    },
    {
      code: 'IT IAS31',
      name: 'Information Assurance and Security 1',
      instructor: 'Sir Jay-ar Base',
      time: '09:30 AM – 10:30 AM',
      duration: '60 Mins',
      room: 'Room OL 108 (Cyber Lab)',
      status: 'Upcoming',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      actionLabel: 'Course Syllabus'
    },
    {
      code: 'IT NET31',
      name: 'Networking 1 (Lecture)',
      instructor: 'Sir Arnel L. Villanueva',
      time: '10:30 AM – 11:30 AM',
      duration: '60 Mins',
      room: 'Room OL 109 (Cisco Lab)',
      status: 'Upcoming',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      actionLabel: 'Packet Tracer Lab'
    }
  ];

  const homeworks: HomeworkItem[] = [
    {
      id: 'hw-1',
      course: 'IT SIA31',
      assignment: 'Milestone 1: Architectural Middleware & API Specification',
      dueDate: 'Tomorrow • 11:59 PM',
      status: 'In Progress'
    },
    {
      id: 'hw-2',
      course: 'IT EVD31',
      assignment: 'Programming Exercise: GUI Event Listeners & State Machine',
      dueDate: 'Sep 20, 2026',
      status: 'Submitted'
    },
    {
      id: 'hw-3',
      course: 'IT IAS31',
      assignment: 'Laboratory Exercise: Symmetric Key Cryptography & PKI Setup',
      dueDate: 'Sep 25, 2026',
      status: 'In Progress'
    },
    {
      id: 'hw-4',
      course: 'IT NET31',
      assignment: 'Packet Tracer Lab: CIDR Subnetting & OSPF Routing Table',
      dueDate: 'Oct 02, 2026',
      status: 'Pending'
    }
  ];

  // Default campus bulletins if API is offline
  const displayBulletins = bulletins.length > 0 ? bulletins : [
    {
      id: 101,
      title: 'Midterm Examination Schedule for 1st Semester A.Y. 2026-2027',
      content: 'Midterm examinations are scheduled from October 15-20, 2026. Please settle examination clearances at the Accounting Office before the exam dates.',
      published_at: '2026-10-01',
      category: 'Examination',
      priority: 'high'
    },
    {
      id: 102,
      title: 'University Library System Digital Access Update',
      content: 'All enrolled college students now have 24/7 access to IEEE Xplore and ProQuest digital academic repositories via student portal credentials.',
      published_at: '2026-09-28',
      category: 'Academic',
      priority: 'normal'
    },
    {
      id: 103,
      title: 'Annual CEC Collegiate Hackathon 2026: AI & Systems',
      content: 'Team registration is officially open for 3rd and 4th year IT/CS students. Mentors from premier tech research labs will conduct workshops.',
      published_at: '2026-09-22',
      category: 'Competition',
      priority: 'normal'
    }
  ];

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Roldan';

  return (
    <div className="space-y-6 sm:space-y-7 font-sans">
      
      {/* ── 1. DASHBOARD HERO (Vibrant Blue Welcome Banner matching Reference 1:1) ── */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-9 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.28)] border border-blue-400/30"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 55%, #0284C7 100%)'
        }}
      >
        {/* Subtle Background Glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-24 w-60 h-60 rounded-full bg-cyan-300/15 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 lg:gap-8">
          
          {/* Left Hero Column: Greeting & Action Buttons */}
          <div className="space-y-3.5 max-w-2xl">
            {/* Translucent Semester Week Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/95 text-[11px] font-bold border border-white/20 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              <span>1ST SEMESTER • WEEK 08</span>
            </div>

            {/* Main Welcome Heading */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight m-0">
              Welcome back, {studentFirstName}! 👋
            </h1>

            {/* Subtitle Message */}
            <p className="text-xs sm:text-sm text-blue-50/95 leading-relaxed font-sans max-w-xl">
              You have <strong className="text-white font-semibold">2 classes today</strong> and <strong className="text-white font-semibold">3 upcoming assignment deadlines</strong> requiring attention this week.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/student/schedule"
                className="bg-white hover:bg-blue-50 text-[#2563EB] font-bold text-xs px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group"
              >
                <CalendarIcon size={14} className="text-[#2563EB]" />
                <span>View Class Schedule</span>
                <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/student/enrollment"
                className="bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-5 py-3 rounded-xl backdrop-blur-md border border-white/25 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileCheck size={14} className="text-white/90" />
                <span>Submit Assignments</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Column: 3 Translucent Metric Panels Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto xl:min-w-[390px] shrink-0">
            
            {/* Box 1: Current GPA */}
            <div className="bg-blue-900/35 hover:bg-blue-900/45 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                <span>Current GPA</span>
                <Star size={13} className="text-amber-300 fill-amber-300" />
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight my-1.5 tabular-nums">
                {data.gpa || '1.25'}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-200 font-medium">
                <TrendingUp size={11} />
                <span>+0.12 vs last term</span>
              </div>
            </div>

            {/* Box 2: Term Attendance */}
            <div className="bg-blue-900/35 hover:bg-blue-900/45 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                <span>Term Attendance</span>
                <CheckCircle2 size={13} className="text-cyan-300" />
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight my-1.5 tabular-nums">
                {data.attendance_rate || '96.4'}%
              </div>
              <div className="text-[10px] text-blue-100 font-medium truncate">
                2 excused leaves
              </div>
            </div>

            {/* Box 3: Credits */}
            <div className="bg-blue-900/35 hover:bg-blue-900/45 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                <span>Credits</span>
                <Award size={13} className="text-cyan-300" />
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight my-1.5 tabular-nums">
                18<span className="text-base text-white/70 font-normal"> / 20</span>
              </div>
              <div className="text-[10px] text-blue-100 font-medium truncate">
                On track for graduation
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── 2. STATISTIC CARDS (4-Column Modern SaaS Metrics) ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Cumulative GPA */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                Cumulative GPA
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <Star size={15} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight tabular-nums">
                1.25
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 1.00 scale</span>
            </div>

            {/* Miniature Sparkline Line SVG */}
            <div className="my-2.5">
              <svg className="w-full h-7 text-[#2563EB]" viewBox="0 0 160 30" fill="none">
                <path 
                  d="M0 22 C 25 22, 40 18, 65 14 C 90 10, 115 15, 135 6 C 145 2, 155 4, 160 3" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                <circle cx="160" cy="3" r="3" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-[#2563EB]">
              <ArrowUpRight size={13} />
              Dean's Honors List
            </span>
            <span className="text-slate-400 font-mono">Top 3% percentile</span>
          </div>
        </div>

        {/* Card 2: Active Enrollment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                Active Enrollment
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <BookOpen size={15} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight tabular-nums">
                14
              </span>
              <span className="text-xs text-slate-500 font-medium">registered modules</span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-sans">
              Total academic load of <strong className="text-slate-700">24.0 credit units</strong> across lecture and lab practicums.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              4 Lectures Today
            </span>
            <span className="text-slate-500">3 Lab Practicums</span>
          </div>
        </div>

        {/* Card 3: Critical Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                Critical Deadlines
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Bell size={15} />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="font-heading font-extrabold text-3xl text-rose-600 tracking-tight tabular-nums">
                2
              </span>
              <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Within 48 hrs
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-sans">
              Middleware Architecture & GUI State Machine submissions require submission.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 truncate">Nearest: <strong className="text-slate-800">IT SIA31</strong></span>
            <span className="text-rose-600 font-semibold shrink-0">Tomorrow</span>
          </div>
        </div>

        {/* Card 4: Semester Presence */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                Semester Presence
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <UserCheck size={15} />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight tabular-nums">
                  96.4%
                </span>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  48/50 Sessions
                </div>
              </div>

              {/* Progress Circle Visual Badge */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#2563EB]"
                    strokeDasharray="96.4, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <CheckCircle2 size={16} className="text-[#2563EB] absolute" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Compliance: <strong className="text-emerald-700">Excellent</strong></span>
            <Link href="/student/attendance" className="font-bold text-[#2563EB] hover:underline">
              View Record →
            </Link>
          </div>
        </div>

      </div>

      {/* ── 3. MAIN DASHBOARD CONTENT (Two-Column Responsive Grid) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Today's Schedule & Assignments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Today's Class Schedule (Matching Reference Structure) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-[#2563EB] shrink-0" />
                <div>
                  <h2 className="font-heading font-extrabold text-base text-slate-900 leading-tight m-0">
                    Today's Class Schedule
                  </h2>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Current Academic Block
                  </p>
                </div>
              </div>

              <Link 
                href="/student/schedule"
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <span>Weekly View</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="p-4 sm:p-5 space-y-3 font-sans">
              {todayClasses.map((cls, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Time Blue Badge Box */}
                    <div className="bg-[#2563EB] text-white rounded-xl px-3 py-2 text-center min-w-[96px] shadow-2xs shrink-0 flex flex-col justify-center">
                      <span className="font-heading font-bold text-xs leading-none">
                        {cls.time.split('–')[0]?.trim()}
                      </span>
                      <span className="font-heading font-bold text-xs leading-tight mt-0.5">
                        {cls.time.split('–')[1]?.trim()}
                      </span>
                      <span className="bg-white/20 text-white text-[10px] font-medium rounded px-1.5 py-0.2 mt-1 font-sans">
                        {cls.duration}
                      </span>
                    </div>

                    {/* Course Information Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${cls.statusColor}`}>
                          {cls.status}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-700">
                          {cls.code}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-sm text-slate-900 truncate m-0">
                        {cls.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#2563EB] shrink-0" />
                          <span className="text-slate-700 font-medium">{cls.room}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserIcon size={12} className="text-slate-400 shrink-0" />
                          <span>{cls.instructor}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0 self-end sm:self-center">
                    <Link
                      href="/student/schedule"
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      {cls.status === 'In Progress' ? (
                        <>
                          <Video size={13} />
                          <span>Join Live Stream</span>
                        </>
                      ) : (
                        <>
                          <span>Class Details</span>
                          <ChevronRight size={13} />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments & Coursework Submissions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-[#3B82F6] shrink-0" />
                <div>
                  <h2 className="font-heading font-extrabold text-base text-slate-900 leading-tight m-0">
                    Assignments & Deliverables
                  </h2>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Coursework milestones tracked for Term 1 A.Y. 2026–2027
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                4 Active Items
              </span>
            </div>

            <div className="divide-y divide-slate-100 font-sans">
              {homeworks.map((hw) => (
                <div key={hw.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {hw.course}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Due: {hw.dueDate}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                      {hw.assignment}
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {hw.status === 'Submitted' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Submitted
                      </span>
                    ) : hw.status === 'In Progress' ? (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        In Progress
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Campus Bulletin Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Campus Bulletin Card (Matching Reference Screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-[#0EA5C9] shrink-0" />
                <h2 className="font-heading font-extrabold text-base text-slate-900 leading-tight m-0">
                  Campus Bulletin
                </h2>
              </div>
              <Megaphone size={16} className="text-[#0EA5C9]" />
            </div>

            <div className="p-4 sm:p-5 space-y-4 font-sans">
              {displayBulletins.slice(0, 3).map((b: any, idx) => {
                const category = b.category || (b.priority === 'high' ? 'Important Notice' : 'Academic Advisory');
                const dateText = b.published_at || 'Recent';

                return (
                  <div 
                    key={b.id || idx}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all space-y-2 bg-slate-50/40"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {category}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {dateText}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900 leading-snug m-0">
                      {b.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed m-0 line-clamp-3">
                      {b.content || b.description || ''}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Office of Student Affairs
                      </span>
                      <Link 
                        href="/student/announcements"
                        className="font-bold text-[#2563EB] hover:underline flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}

              <div className="pt-1 text-center">
                <Link
                  href="/student/announcements"
                  className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                >
                  <span>View All Official Bulletins</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Academic Contacts Capsule */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#2563EB]" />
              <h3 className="font-heading font-bold text-sm text-slate-900 m-0">
                Registrar & Support
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              For grading clarification, official transcript verification, or clearance questions, visit the Office of the Registrar.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
              <div>📍 Ground Floor, Main Academic Building</div>
              <div>🕒 Mon – Fri • 08:00 AM – 05:00 PM</div>
              <div>✉️ registrar@cebucebupor.edu.ph</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
