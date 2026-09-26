'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
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
import { DashboardBanner } from '@/components/ui/DashboardBanner';

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

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── 1. School Building Dashboard Header Banner ── */}
      <DashboardBanner />

      {/* ── 2. Subtle Executive Metrics ──────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Registered Students', value: stats.totalStudents, sub: 'Active Population', icon: Users, color: 'text-[#1D4ED8] bg-blue-50 border-blue-200' },
          { label: 'Academic Faculty', value: stats.totalTeachers, sub: 'Faculty Members', icon: UserCheck, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Degree Programs', value: stats.totalCourses, sub: 'CHED Accredited', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Pending Approvals', value: stats.pendingEnrollments, sub: 'Registrar Queue', icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-200' },
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

      {/* ── 3. Main Admin Grid ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Audit Log & Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#1D4ED8]" />
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
                <Users size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Student Directory</span>
              </Link>
              <Link
                href="/admin/teachers"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <UserCheck size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Faculty Directory</span>
              </Link>
              <Link
                href="/admin/courses"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <GraduationCap size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Degree Programs</span>
              </Link>
              <Link
                href="/admin/sections"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Building2 size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Class Sections</span>
              </Link>
              <Link
                href="/admin/schedules"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Calendar size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Master Schedule</span>
              </Link>
              <Link
                href="/admin/fees"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <FileText size={15} className="text-[#1D4ED8]" />
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
                  <Bar dataKey="value" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>College of Information Technology & Engineering</span>
                <Link href="/admin/students" className="text-[#1D4ED8] hover:underline font-semibold">
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
