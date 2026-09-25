'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { StudentDashboard } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';
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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';

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
  status: 'Submitted' | 'In Progress' | 'Pending';
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<StudentDashboard>('/student/dashboard');
        const dashboardData = (response as any).data || response;
        setData(dashboardData);
      } catch {
        setData({
          enrolled_subjects: 14,
          gpa: '1.25',
          attendance_rate: 98.5,
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

  if (loading) return <LoadingState message="Loading student academic dashboard..." />;

  const todayClasses = [
    {
      code: 'IT SIA31',
      name: 'System Integration and Architecture 2',
      instructor: 'Sir Charles Bacotot',
      time: '07:30 AM – 08:30 AM',
      room: 'Room OL 110',
      status: 'Current Session'
    },
    {
      code: 'IT EVD31',
      name: 'Event Driven Programming (Lecture)',
      instructor: 'Sir Yestin Prado',
      time: '08:30 AM – 09:30 AM',
      room: 'Room OL 107',
      status: 'Next Up'
    },
    {
      code: 'IT IAS31',
      name: 'Information Assurance and Security 1',
      instructor: 'Sir Jay-ar Base',
      time: '09:30 AM – 10:30 AM',
      room: 'Room OL 108',
      status: 'Upcoming'
    },
    {
      code: 'IT NET31',
      name: 'Networking 1 (Lecture)',
      instructor: 'Sir Arnel L. Villanueva',
      time: '10:30 AM – 11:30 AM',
      room: 'Room OL 109',
      status: 'Upcoming'
    }
  ];

  const enrolledCourses = [
    {
      id: '1',
      code: 'FREE ELEC 1',
      name: 'Free Elective 1 (Mobile App Development)',
      instructor: 'Sir Vincent John Cababan',
      days: 'Mon & Wed',
      time: '10:30 AM – 12:00 PM',
      room: 'Room H 204',
      units: 3.0
    },
    {
      id: '6',
      code: 'IT EVD31',
      name: 'Event Driven Programming (Lecture)',
      instructor: 'Sir Yestin Prado',
      days: 'Mon & Wed',
      time: '08:30 AM – 09:30 AM',
      room: 'Room OL 107',
      units: 2.0
    },
    {
      id: '8',
      code: 'IT IAS31',
      name: 'Information Assurance and Security 1',
      instructor: 'Sir Jay-ar Base',
      days: 'Mon & Wed',
      time: '09:30 AM – 10:30 AM',
      room: 'Room OL 108',
      units: 2.0
    },
    {
      id: '10',
      code: 'IT NET31',
      name: 'Networking 1 (Lecture & Lab)',
      instructor: 'Sir Arnel L. Villanueva',
      days: 'Mon & Wed',
      time: '10:30 AM – 11:30 AM',
      room: 'Room OL 109',
      units: 3.0
    },
    {
      id: '12',
      code: 'IT SIA31',
      name: 'System Integration and Architecture 2',
      instructor: 'Sir Charles Bacotot',
      days: 'Mon & Wed',
      time: '07:30 AM – 08:30 AM',
      room: 'Room OL 110',
      units: 3.0
    }
  ];

  const homeworks: HomeworkItem[] = [
    {
      id: 'hw-1',
      course: 'IT SIA31',
      assignment: 'Milestone 1: Architectural Middleware & API Specification',
      dueDate: 'Sep 18, 2026',
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

  const recentBulletins = Array.isArray(data?.recent_announcements) ? data.recent_announcements : [];

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── 1. Editorial Welcome Dossier ────────── */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Good day, {user?.name ? user.name.split(' ')[0] : 'Roldan'}
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Officially Enrolled
            </span>
          </div>
          <div className="text-xs text-slate-500 font-sans flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-slate-700 font-semibold">SN: 2026-00001</span>
            <span>•</span>
            <span>Bachelor of Science in Information Technology (Year 3)</span>
            <span>•</span>
            <span className="text-[#1D4ED8] font-medium">1st Semester A.Y. 2026–2027</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/student/grades"
            className="btn-outline text-xs inline-flex items-center gap-1.5"
          >
            <GraduationCap size={13} />
            <span>Grade Report</span>
          </Link>
          <Link
            href="/student/schedule"
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <CalendarIcon size={13} />
            <span>My Schedule</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Subtle Academic Metrics Strip ────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'General Weighted Average', value: '1.25', sub: "Dean's Honor List", icon: Award, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Active Enrolled Load', value: '24.0 Units', sub: '8 Subjects (Full Load)', icon: BookOpen, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Semester Attendance', value: '98.5%', sub: 'Good Standing', icon: ClipboardList, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Matriculation Status', value: 'Settled', sub: 'Cleared for Finals', icon: FileCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-start gap-3"
          >
            <div className={`p-2 rounded-md border ${item.color} shrink-0 mt-0.5`}>
              <item.icon size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block truncate">
                {item.label}
              </span>
              <div className="text-base font-bold text-slate-900 font-heading tabular-nums leading-tight mt-0.5">
                {item.value}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium truncate">
                {item.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Main Grid (Two Columns) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Courses & Assignments (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Enrolled Courses Ledger */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-[#1D4ED8]" />
                <span>Enrolled Academic Courses</span>
              </div>
              <Link href="/student/subjects" className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1">
                <span>View Full Catalog</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100 font-sans">
              {enrolledCourses.map((c) => (
                <div key={c.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#1D4ED8] bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                        {c.code}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {c.units.toFixed(1)} Units
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-xs text-slate-900 truncate m-0">
                      {c.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                      <span>{c.instructor}</span>
                      <span>•</span>
                      <span>{c.room}</span>
                      <span>•</span>
                      <span>{c.days} ({c.time})</span>
                    </div>
                  </div>

                  <Link
                    href={`/student/subjects/${c.id}`}
                    className="btn-secondary text-[11px] px-2.5 py-1 shrink-0"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Assignments & Deadlines */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <ClipboardList size={15} className="text-[#1D4ED8]" />
                <span>Coursework & Deadlines</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">4 Active Items</span>
            </div>

            <div className="p-0 divide-y divide-slate-100 font-sans">
              {homeworks.map((hw) => (
                <div key={hw.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        {hw.course}
                      </span>
                      <span className="text-[11px] text-slate-500">Due: {hw.dueDate}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-900 truncate">
                      {hw.assignment}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {hw.status === 'Submitted' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                        Submitted
                      </span>
                    ) : hw.status === 'In Progress' ? (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                        In Progress
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Today's Schedule & Announcements (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Today's Schedule Timeline */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#1D4ED8]" />
                <span>Today's Class Schedule</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="p-4 space-y-3 font-sans">
              {todayClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    idx === 0
                      ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                      : 'bg-white border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-[#1D4ED8]">{cls.code}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      idx === 0 ? 'bg-blue-200/60 text-[#1E3A8A]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cls.status}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-slate-900 m-0 truncate">
                    {cls.name}
                  </h4>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                    <span>{cls.time}</span>
                    <span className="font-medium text-slate-800">{cls.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official University Announcements */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Megaphone size={15} className="text-[#1D4ED8]" />
                <span>Official Campus Bulletins</span>
              </div>
              <Link href="/student/announcements" className="text-xs text-[#1D4ED8] hover:underline font-semibold">
                All Notices →
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100 font-sans">
              {recentBulletins.length > 0 ? (
                recentBulletins.map((item: any) => {
                  const timestamp = item.published_at || item.created_at;
                  const relativeTime = formatTimeAgo(timestamp);
                  const tag = (item.target_audience === 'all' || !item.target_audience) ? 'All Campus' : 'Student Advisory';

                  return (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50/70 transition-colors space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold uppercase tracking-wider text-[#1D4ED8]">
                          {tag}
                        </span>
                        <span className="text-slate-500 font-medium">{relativeTime}</span>
                      </div>
                      <h4 className="font-heading font-bold text-xs text-slate-900 m-0">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed m-0 pt-0.5 line-clamp-2">
                        {item.content || item.summary || ''}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No announcements available.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
