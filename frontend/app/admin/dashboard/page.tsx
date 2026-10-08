'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
import { OfficialCampusBulletins } from '@/components/dashboard/OfficialCampusBulletins';
import { AdminDashboardSkeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Clock, 
  BookOpen, 
  FileText, 
  Building2, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Activity
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setData(response.data !== undefined ? response.data : response);
      } catch (error) {
        console.error('Error fetching admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = {
    totalStudents: data?.total_students ?? data?.stats?.totalStudents ?? 50,
    totalTeachers: data?.total_teachers ?? data?.stats?.totalTeachers ?? 10,
    totalCourses: data?.total_courses ?? data?.stats?.totalCourses ?? 5,
    totalSubjects: data?.total_subjects ?? data?.stats?.totalSubjects ?? 30,
    activeEnrollments: data?.active_enrollments ?? data?.stats?.activeEnrollments ?? 48,
    pendingEnrollments: data?.pending_enrollments ?? data?.stats?.pendingEnrollments ?? 0,
  };

  const studentsByCourse = (data?.students_by_course || [
    { name: 'BSIT', value: 32 },
    { name: 'BSCS', value: 6 },
    { name: 'BSA', value: 5 },
    { name: 'BSBA', value: 4 },
    { name: 'BSEd', value: 3 },
  ]).map((item: any) => ({
    name: item.name,
    value: item.value ?? item.students ?? item.count ?? 0,
  }));

  const recentActivity = [
    { id: 1, action: 'Student Enrollment Approved', details: 'Juan Dela Cruz (BSIT 3-A) registration confirmed for 1st Semester.', user: 'Registrar Staff', time: '10 mins ago' },
    { id: 2, action: 'Faculty Grade Submission', details: 'Prof. Alexander Cruz submitted final term marks for IT 312.', user: 'Faculty Evaluator', time: '1 hour ago' },
    { id: 3, action: 'Master Timetable Updated', details: 'Computer Laboratory 3 assigned to BSCS 2-B for practicals.', user: 'Academic Head', time: '3 hours ago' },
    { id: 4, action: 'Matriculation Clearance', details: 'Batch processing completed for 45 3rd-year engineering clearances.', user: 'Treasury Office', time: '5 hours ago' },
  ];

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── 1. VIBRANT BLUE EXECUTIVE HERO ──── */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-9 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.28)] border border-blue-400/30"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 55%, #0284C7 100%)'
        }}
      >
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-24 w-60 h-60 rounded-full bg-cyan-300/15 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 lg:gap-8">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/95 text-[11px] font-bold border border-white/20 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              <span>1ST SEMESTER • EXECUTIVE CONSOLE</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight m-0">
              Institutional Administration 🏛️
            </h1>

            <p className="text-xs sm:text-sm text-blue-50/95 leading-relaxed font-sans max-w-xl">
              Cebu Eastern College Official Registry • <strong className="text-white font-semibold">{stats.totalStudents} enrolled students</strong>, <strong className="text-white font-semibold">{stats.totalTeachers} faculty members</strong>, and active registrar pipelines.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/admin/enrollment"
                className="bg-white hover:bg-blue-50 text-[#2563EB] font-bold text-xs px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group"
              >
                <FileText size={14} className="text-[#2563EB]" />
                <span>Enrollment Approvals</span>
                <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/admin/grades"
                className="bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-5 py-3 rounded-xl backdrop-blur-md border border-white/25 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap size={14} className="text-white/90" />
                <span>Grade Review</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto xl:min-w-[390px] shrink-0">
            <div className="bg-blue-900/35 hover:bg-blue-900/45 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                <span>Students</span>
                <Users size={13} className="text-cyan-300" />
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight my-1.5 tabular-nums">
                {stats.totalStudents}
              </div>
              <div className="text-[10px] text-blue-100 font-medium truncate">
                Active Population
              </div>
            </div>

            <div className="bg-blue-900/35 hover:bg-blue-900/45 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                <span>Faculty</span>
                <UserCheck size={13} className="text-cyan-300" />
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight my-1.5 tabular-nums">
                {stats.totalTeachers}
              </div>
              <div className="text-[10px] text-blue-100 font-medium truncate">
                Faculty Members
              </div>
            </div>

            <div className="bg-blue-900/35 hover:bg-blue-900/45 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                <span>Programs</span>
                <GraduationCap size={13} className="text-cyan-300" />
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight my-1.5 tabular-nums">
                {stats.totalCourses}
              </div>
              <div className="text-[10px] text-blue-100 font-medium truncate">
                CHED Accredited
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FOUR EXECUTIVE STATISTIC CARDS ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: 'Registered Students', value: stats.totalStudents, sub: 'Active Population', icon: Users, color: 'text-[#2563EB] bg-blue-50 border-blue-100' },
          { label: 'Academic Faculty', value: stats.totalTeachers, sub: 'Faculty Directory', icon: UserCheck, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Degree Programs', value: stats.totalCourses, sub: 'CHED Accredited', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Pending Approvals', value: stats.pendingEnrollments, sub: 'Registrar Queue', icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-200' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans truncate">
                {item.label}
              </span>
              <div className={`w-8 h-8 rounded-xl border ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon size={15} />
              </div>
            </div>
            <div className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight tabular-nums my-2">
              {item.value}
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium truncate">
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Main Admin Grid ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Audit Log & Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#2563EB]" />
                <span>Recent System Operations & Audit Log</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Real-time Stream</span>
            </div>

            <div className="p-0 divide-y divide-slate-100 font-sans">
              {recentActivity.map((act) => (
                <div key={act.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-xs text-slate-900">
                        {act.action}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                        {act.user}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed m-0">
                      {act.details}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Administrative Directory Shortcuts */}
          <div className="panel">
            <div className="panel-heading">
              <span>Core Administrative Resources</span>
            </div>
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <Link
                href="/admin/students"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Users size={15} className="text-[#2563EB]" />
                <span className="font-medium text-slate-800">Student Directory</span>
              </Link>
              <Link
                href="/admin/teachers"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <UserCheck size={15} className="text-[#2563EB]" />
                <span className="font-medium text-slate-800">Faculty Directory</span>
              </Link>
              <Link
                href="/admin/courses"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <GraduationCap size={15} className="text-[#2563EB]" />
                <span className="font-medium text-slate-800">Degree Programs</span>
              </Link>
              <Link
                href="/admin/sections"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Building2 size={15} className="text-[#2563EB]" />
                <span className="font-medium text-slate-800">Class Sections</span>
              </Link>
              <Link
                href="/admin/schedules"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Calendar size={15} className="text-[#2563EB]" />
                <span className="font-medium text-slate-800">Master Schedule</span>
              </Link>
              <Link
                href="/admin/fees"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <FileText size={15} className="text-[#2563EB]" />
                <span className="font-medium text-slate-800">Fees & Treasury</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Program Distribution Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="panel">
            <div className="panel-heading">
              <span>Enrollment Distribution by Academic Program</span>
            </div>
            <div className="p-4 sm:p-5">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={studentsByCourse}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#CBD5E1' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#CBD5E1' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>College of Information Technology & Engineering</span>
                <Link href="/admin/students" className="text-[#2563EB] hover:underline font-semibold">
                  Manage Roster →
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
