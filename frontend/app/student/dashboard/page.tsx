'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { StudentDashboard } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
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
  ChevronLeft,
  MoreVertical,
  ArrowRight,
  FileCheck,
  Building2,
  Users,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

interface ExamItem {
  id: string;
  name: string;
  course: string;
  date: string;
  time: string;
  location: string;
  status: 'Completed' | 'Upcoming';
}

interface HomeworkItem {
  id: string;
  course: string;
  assignment: string;
  dueDate: string;
  status: 'Submitted' | 'In Progress' | 'Pending' | 'Not Started';
  accentColor: 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo';
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 7, 1)); // Aug 2026

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<StudentDashboard>('/student/dashboard');
        const dashboardData = (response as any).data || response;
        setData(dashboardData);
      } catch (err: any) {
        // Fallback demo dataset for standalone preview
        setData({
          enrolled_subjects: 14,
          gpa: '1.25',
          attendance_rate: 98,
          current_semester: '1st Semester A.Y. 2026-2027',
          enrollment_status: 'enrolled',
          upcoming_classes: [],
          recent_announcements: []
        } as any);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading student academic portal..." />;

  const exams: ExamItem[] = [
    {
      id: 'ex-1',
      name: 'Midterm Examination: System Integration & Architecture 2',
      course: 'IT SIA31',
      date: 'Oct 14, 2026',
      time: '07:30 AM - 09:30 AM',
      location: 'OL 110',
      status: 'Upcoming'
    },
    {
      id: 'ex-2',
      name: 'Midterm Examination: Event Driven Programming',
      course: 'IT EVD31',
      date: 'Oct 16, 2026',
      time: '08:30 AM - 10:30 AM',
      location: 'OL 107',
      status: 'Upcoming'
    },
    {
      id: 'ex-3',
      name: 'Midterm Examination: Information Assurance & Security 1',
      course: 'IT IAS31',
      date: 'Oct 19, 2026',
      time: '09:30 AM - 11:30 AM',
      location: 'OL 108',
      status: 'Upcoming'
    },
    {
      id: 'ex-4',
      name: 'Midterm Examination: Networking 1 (Lecture & Lab)',
      course: 'IT NET31',
      date: 'Oct 21, 2026',
      time: '10:30 AM - 12:30 PM',
      location: 'OL 109 / CL 3',
      status: 'Upcoming'
    },
    {
      id: 'ex-5',
      name: 'Midterm Examination: Free Elective 1',
      course: 'FREE ELEC 1',
      date: 'Oct 23, 2026',
      time: '10:30 AM - 12:00 PM',
      location: 'H 204',
      status: 'Upcoming'
    }
  ];

  const homeworks: HomeworkItem[] = [
    {
      id: 'hw-1',
      course: 'IT SIA31 - System Integration & Architecture 2',
      assignment: 'Milestone 1: Architectural Middleware & API Specification',
      dueDate: 'Due Date: September 18, 2026',
      status: 'In Progress',
      accentColor: 'blue'
    },
    {
      id: 'hw-2',
      course: 'IT EVD31 - Event Driven Programming',
      assignment: 'Programming Exercise: GUI Event Listeners & State Machine',
      dueDate: 'Due Date: September 20, 2026',
      status: 'Submitted',
      accentColor: 'emerald'
    },
    {
      id: 'hw-3',
      course: 'IT IAS31 - Information Assurance & Security 1',
      assignment: 'Laboratory Exercise: Symmetric Key Cryptography & PKI Setup',
      dueDate: 'Due Date: September 25, 2026',
      status: 'In Progress',
      accentColor: 'amber'
    },
    {
      id: 'hw-4',
      course: 'IT NET31 - Networking 1',
      assignment: 'Packet Tracer Lab: CIDR Subnetting & OSPF Routing Table',
      dueDate: 'Due Date: October 02, 2026',
      status: 'Not Started',
      accentColor: 'rose'
    }
  ];

  const enrolledCourses = [
    {
      code: 'IT SIA31',
      name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2',
      instructor: 'Sir Charles Bacotot',
      days: 'Monday & Wednesday',
      time: '07:30 AM - 08:30 AM',
      room: 'Room OL 110',
      cardStyle: 'bg-blue-50/70 border-blue-200 text-blue-950',
      badgeStyle: 'bg-blue-200/60 text-[#1E3A8A]',
      iconColor: 'text-[#1D4ED8]'
    },
    {
      code: 'IT EVD31',
      name: 'EVENT DRIVEN PROGRAMMING (LECTURE)',
      instructor: 'Sir Yestin Prado',
      days: 'Monday & Wednesday',
      time: '08:30 AM - 09:30 AM',
      room: 'Room OL 107',
      cardStyle: 'bg-amber-50/70 border-amber-200 text-amber-950',
      badgeStyle: 'bg-amber-200/60 text-amber-900',
      iconColor: 'text-amber-700'
    },
    {
      code: 'IT IAS31',
      name: 'INFORMATION ASSURANCE AND SECURITY 1',
      instructor: 'Sir Jay-ar Base',
      days: 'Monday & Wednesday',
      time: '09:30 AM - 10:30 AM',
      room: 'Room OL 108',
      cardStyle: 'bg-sky-50/70 border-sky-200 text-sky-950',
      badgeStyle: 'bg-sky-200/60 text-sky-900',
      iconColor: 'text-sky-700'
    },
    {
      code: 'IT NET31',
      name: 'NETWORKING 1 (LECTURE)',
      instructor: 'Sir Arnel L. Villanueva',
      days: 'Monday & Wednesday',
      time: '10:30 AM - 11:30 AM',
      room: 'Room OL 109',
      cardStyle: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
      badgeStyle: 'bg-emerald-200/60 text-emerald-900',
      iconColor: 'text-emerald-700'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Welcome Header Row (Inspired by Reference) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" role="img" aria-label="wave">👋</span>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
            Welcome, {user?.name ? user.name.split(' ')[0] : 'Roldan'}!
          </h1>
          <span className="hidden sm:inline-block bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1 font-mono">
            SN: 2026-00001
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-sans">
          <span className="font-medium text-slate-600">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' })}
          </span>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Semester 1 of 8</span>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#1D4ED8] rounded-full w-[65%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Row: Wide Featured Advisory Banner (Left) + Mini Calendar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Featured Institutional Advisory Banner (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl p-6 sm:p-7 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/70 to-transparent pointer-events-none"></div>

          <div className="max-w-xl relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Academic Advisory • 1st Semester A.Y. 2026–2027</span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug m-0">
              Get Involved – Join an Academic Council or Club Today!
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans m-0 pt-1">
              Explore your professional interests and collaborate with fellow students across computer studies, engineering, and student government. University organizations are currently accepting applications for the active term.
            </p>
          </div>

          <div className="pt-4 relative z-10 flex items-center gap-3">
            <Link
              href="/student/enrollment"
              className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2"
            >
              <span>View Course Plan</span>
              <ArrowRight size={13} />
            </Link>

            <Link
              href="/student/announcements"
              className="btn-secondary inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2"
            >
              <span>Read Advisories</span>
            </Link>
          </div>
        </div>

        {/* Right: Academic Mini Calendar Widget (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="font-heading font-bold text-xs text-slate-900">
              August 2026
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                <ChevronLeft size={14} />
              </button>
              <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium font-sans">
            <span className="text-slate-400 font-semibold py-1">Mo</span>
            <span className="text-slate-400 font-semibold py-1">Tu</span>
            <span className="text-slate-400 font-semibold py-1">We</span>
            <span className="text-slate-400 font-semibold py-1">Th</span>
            <span className="text-slate-400 font-semibold py-1">Fr</span>
            <span className="text-slate-400 font-semibold py-1">Sa</span>
            <span className="text-slate-400 font-semibold py-1">Su</span>

            {/* Empty offset days */}
            <span className="py-1 text-slate-300">27</span>
            <span className="py-1 text-slate-300">28</span>
            <span className="py-1 text-slate-300">29</span>
            <span className="py-1 text-slate-300">30</span>
            <span className="py-1 text-slate-300">31</span>
            
            {/* Active Days */}
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">1</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">2</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">3</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">4</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">5</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">6</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">7</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">8</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">9</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">10</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">11</span>
            
            {/* Current Day Highlighted with Royal Blue Circle */}
            <span className="py-1 bg-[#1D4ED8] text-white rounded-full font-bold shadow-2xs cursor-pointer">
              12
            </span>

            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">13</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">14</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">15</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">16</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">17</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">18</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">19</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">20</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">21</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">22</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">23</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">24</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">25</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">26</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">27</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">28</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">29</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">30</span>
            <span className="py-1 hover:bg-slate-100 rounded text-slate-700 cursor-pointer">31</span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Classes in Session</span>
            </span>
            <Link href="/student/schedule" className="text-[#1D4ED8] hover:underline font-semibold text-[10px]">
              Full Calendar →
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Middle Section: Enrolled Courses (Horizontal Cards with reference styling) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#1D4ED8]" />
            <h2 className="font-heading font-bold text-slate-900 text-sm sm:text-base m-0">
              Enrolled Courses
            </h2>
          </div>
          <Link 
            href="/student/subjects" 
            className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enrolledCourses.map((course, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border transition-all hover:shadow-sm ${course.cardStyle}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${course.badgeStyle}`}>
                    {course.code}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-slate-900 mt-1.5 m-0 leading-tight">
                    {course.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 font-sans pt-1">
                <div className="flex items-center gap-2">
                  <UserIcon size={13} className={course.iconColor} />
                  <span className="truncate">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={13} className={course.iconColor} />
                  <span className="truncate">{course.days}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className={course.iconColor} />
                  <span className="font-mono text-[11px]">{course.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className={course.iconColor} />
                  <span className="font-medium text-slate-800">{course.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Section: Exam Board Table (Left) + Homeworks/Tasks Stack (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Exam Board / Assessment Schedule Table (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-[#1D4ED8]" />
              <h2 className="font-heading font-bold text-slate-900 text-sm sm:text-base m-0">
                Exam Board & Assessment Schedule
              </h2>
            </div>
            <Link 
              href="/student/schedule" 
              className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
                    <th className="px-4 py-3 font-medium">Exam Name</th>
                    <th className="px-3 py-3 font-medium">Course</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                    <th className="px-3 py-3 font-medium">Location</th>
                    <th className="px-3 py-3 text-center font-medium">Status</th>
                    <th className="px-2 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {exam.name}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-[#1D4ED8]">
                        {exam.course}
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {exam.date}
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {exam.time}
                      </td>
                      <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                        {exam.location}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {exam.status === 'Completed' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Completed
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Upcoming
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer">
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Academic Deliverables & Tasks (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-[#1D4ED8]" />
              <h2 className="font-heading font-bold text-slate-900 text-sm sm:text-base m-0">
                Homeworks & Tasks
              </h2>
            </div>
            <Link 
              href="/student/documents" 
              className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {homeworks.map((hw) => {
              const borderStyles = {
                blue: 'border-l-4 border-l-[#1D4ED8]',
                emerald: 'border-l-4 border-l-emerald-500',
                amber: 'border-l-4 border-l-amber-500',
                rose: 'border-l-4 border-l-rose-500',
                indigo: 'border-l-4 border-l-indigo-500',
              }[hw.accentColor];

              const statusBadge = {
                'Submitted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                'In Progress': 'bg-blue-50 text-[#1D4ED8] border-blue-200',
                'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
                'Not Started': 'bg-slate-100 text-slate-600 border-slate-200',
              }[hw.status];

              return (
                <div 
                  key={hw.id}
                  className={`bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all ${borderStyles}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-slate-800 font-sans truncate">
                      {hw.course}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${statusBadge}`}>
                      {hw.status}
                    </span>
                  </div>

                  <h4 className="font-heading font-medium text-xs text-slate-900 m-0 leading-snug">
                    {hw.assignment}
                  </h4>

                  <div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{hw.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
