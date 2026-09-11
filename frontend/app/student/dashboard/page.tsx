'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { StudentDashboard } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Award, 
  ChevronRight, 
  FileCheck, 
  FileText,
  CreditCard,
  Bell,
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

interface AcademicTask {
  id: string;
  course: string;
  task: string;
  dueDate: string;
  status: 'Submitted' | 'In Progress' | 'Pending';
}

interface AdvisoryItem {
  id: string;
  title: string;
  department: string;
  date: string;
  priority: 'normal' | 'urgent';
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
      } catch (err: any) {
        // Fallback demo dataset for preview
        setData({
          enrolled_subjects: 14,
          gpa: '1.25',
          attendance_rate: 98,
          current_semester: '1st Semester A.Y. 2026–2027',
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

  if (loading) return <LoadingState message="Loading Student Information System..." />;

  // Sample today's classes (Monday schedule)
  const todaysClasses = [
    {
      code: 'IT SIA31',
      name: 'System Integration and Architecture 2 (Lecture)',
      time: '07:30 AM – 08:30 AM',
      room: 'OL 110',
      instructor: 'Sir Charles Bacotot',
      status: 'Completed'
    },
    {
      code: 'IT EVD31',
      name: 'Event Driven Programming (Lecture)',
      time: '08:30 AM – 09:30 AM',
      room: 'OL 107',
      instructor: 'Sir Yestin Prado',
      status: 'Ongoing'
    },
    {
      code: 'IT IAS31',
      name: 'Information Assurance and Security 1 (Lecture)',
      time: '09:30 AM – 10:30 AM',
      room: 'OL 108',
      instructor: 'Sir Jay-ar Base',
      status: 'Upcoming'
    },
    {
      code: 'IT NET31',
      name: 'Networking 1 (Lecture)',
      time: '10:30 AM – 11:30 AM',
      room: 'OL 109',
      instructor: 'Sir Arnel L. Villanueva',
      status: 'Upcoming'
    },
    {
      code: 'FREE ELEC 1',
      name: 'Free Elective 1',
      time: '11:30 AM – 01:00 PM',
      room: 'H 204',
      instructor: 'Sir Vincent John Cababan',
      status: 'Upcoming'
    }
  ];

  const exams: ExamItem[] = [
    {
      id: 'ex-1',
      name: 'Midterm Examination: System Integration & Architecture 2',
      course: 'IT SIA31',
      date: 'Oct 14, 2026',
      time: '07:30 AM – 09:30 AM',
      location: 'OL 110',
      status: 'Upcoming'
    },
    {
      id: 'ex-2',
      name: 'Midterm Examination: Event Driven Programming',
      course: 'IT EVD31',
      date: 'Oct 16, 2026',
      time: '08:30 AM – 10:30 AM',
      location: 'OL 107',
      status: 'Upcoming'
    },
    {
      id: 'ex-3',
      name: 'Midterm Examination: Information Assurance & Security 1',
      course: 'IT IAS31',
      date: 'Oct 19, 2026',
      time: '09:30 AM – 11:30 AM',
      location: 'OL 108',
      status: 'Upcoming'
    },
    {
      id: 'ex-4',
      name: 'Midterm Examination: Networking 1',
      course: 'IT NET31',
      date: 'Oct 21, 2026',
      time: '10:30 AM – 12:30 PM',
      location: 'CL 3',
      status: 'Upcoming'
    }
  ];

  const advisories: AdvisoryItem[] = [
    {
      id: 'adv-1',
      title: 'Schedule for Midterm Examination Grade Encoding & Faculty Verification',
      department: 'Office of the University Registrar',
      date: 'Oct 10, 2026',
      priority: 'urgent'
    },
    {
      id: 'adv-2',
      title: 'Validation of 2nd Installment Tuition Payments for Examination Clearance',
      department: 'University Accounting & Cashier',
      date: 'Oct 05, 2026',
      priority: 'normal'
    },
    {
      id: 'adv-3',
      title: 'Special Advising Period for Laboratory Section Balancing',
      department: 'College of Computer Studies',
      date: 'Sep 28, 2026',
      priority: 'normal'
    }
  ];

  const academicTasks: AcademicTask[] = [
    {
      id: 't-1',
      course: 'IT SIA31',
      task: 'Milestone 1: Architectural Middleware & API Specification',
      dueDate: 'Sep 18, 2026',
      status: 'In Progress'
    },
    {
      id: 't-2',
      course: 'IT EVD31',
      task: 'Programming Exercise: GUI Event Listeners & State Machine',
      dueDate: 'Sep 20, 2026',
      status: 'Submitted'
    },
    {
      id: 't-3',
      course: 'IT IAS31',
      task: 'Lab Exercise: Symmetric Key Cryptography & PKI Implementation',
      dueDate: 'Sep 25, 2026',
      status: 'Pending'
    },
    {
      id: 't-4',
      course: 'IT NET31',
      task: 'Packet Tracer Lab: CIDR Subnetting & OSPF Routing Table',
      dueDate: 'Oct 02, 2026',
      status: 'Pending'
    }
  ];

  const studentName = user?.name || 'Roldan D. Enaldo';

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Student Identity Dossier Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs border-t-2 border-t-[#1D4ED8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] font-bold text-lg shrink-0">
              {studentName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight m-0">
                  {studentName}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded">
                  SN: 2026-00001
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Officially Enrolled
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1 font-sans">
                <span className="font-medium text-slate-800">
                  Bachelor of Science in Information Technology (BSIT)
                </span>
                <span className="text-slate-300">•</span>
                <span>3rd Year</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-700 font-semibold">Section BSIT 3-A</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Curriculum A.Y. 2024–2028</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left md:text-right text-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Academic Evaluation
              </span>
              <span className="font-semibold text-slate-800 block">
                1st Semester A.Y. 2026–2027
              </span>
              <span className="text-[11px] font-medium text-emerald-600 inline-flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> Good Academic Standing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Academic Indicators (4 Compact Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Enrolled Units */}
        <Link 
          href="/student/subjects"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-400 transition-colors block group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Enrolled Academic Load</span>
            <BookOpen size={16} className="text-[#1D4ED8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">21.0</span>
            <span className="text-xs font-semibold text-slate-500">Units</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>14 Registered Subjects</span>
            <span className="text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </Link>

        {/* Metric 2: GWA */}
        <Link 
          href="/student/grades"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-400 transition-colors block group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Term GWA</span>
            <Award size={16} className="text-[#1D4ED8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1D4ED8] tabular-nums">1.25</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              President's Lister
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Rank: Top 5% of Class</span>
            <span className="text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </Link>

        {/* Metric 3: Attendance */}
        <Link 
          href="/student/attendance"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-400 transition-colors block group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Attendance Rate</span>
            <Clock size={16} className="text-[#1D4ED8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">98.0%</span>
            <span className="text-xs font-medium text-emerald-600">Satisfactory</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>0 Unexcused Absences</span>
            <span className="text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </Link>

        {/* Metric 4: Account Balance */}
        <Link 
          href="/student/fees"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-400 transition-colors block group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Current Account Balance</span>
            <CreditCard size={16} className="text-[#1D4ED8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">₱0.00</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Cleared
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Official Exam Permit Ready</span>
            <span className="text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </Link>

      </div>

      {/* 3. Main Workspace Grid: Content (8 Cols) vs Utilities (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Today's Schedule & Examination Board */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Today's Schedule Table */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#1D4ED8]" />
                <span className="font-semibold text-slate-900">Today's Class Schedule</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})
                </span>
              </div>
              <Link 
                href="/student/schedule"
                className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                    <th className="px-4 py-3">Time Period</th>
                    <th className="px-4 py-3">Course Code</th>
                    <th className="px-4 py-3">Descriptive Title</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Faculty Instructor</th>
                    <th className="px-3 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {todaysClasses.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8] whitespace-nowrap">
                        {item.code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                        {item.room}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.instructor}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {item.status === 'Completed' && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                            Completed
                          </span>
                        )}
                        {item.status === 'Ongoing' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold animate-pulse">
                            In Session
                          </span>
                        )}
                        {item.status === 'Upcoming' && (
                          <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-medium">
                            Upcoming
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Board / Assessment Schedule Table */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-[#1D4ED8]" />
                <span className="font-semibold text-slate-900">Examination Schedule & Major Milestones</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Midterm Examination Term</span>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                    <th className="px-4 py-3">Examination Detail</th>
                    <th className="px-3 py-3">Course</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">Venue</th>
                    <th className="px-3 py-3 text-center">Status</th>
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
                      <td className="px-3 py-3 text-slate-700 whitespace-nowrap font-mono">
                        {exam.location}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {exam.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Quick Links, Institutional Bulletins, Tasks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Administrative Actions Panel */}
          <div className="panel">
            <div className="panel-heading">
              <span className="font-semibold text-slate-900">Administrative Services</span>
              <span className="text-[10px] font-mono text-slate-400">Direct Access</span>
            </div>
            
            <div className="p-3 space-y-1.5 text-xs">
              <Link 
                href="/student/grades" 
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-blue-50 text-[#1D4ED8]">
                    <Award size={15} />
                  </div>
                  <span className="font-medium text-slate-800">Official Grade Slip</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>

              <Link 
                href="/student/schedule" 
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-blue-50 text-[#1D4ED8]">
                    <Calendar size={15} />
                  </div>
                  <span className="font-medium text-slate-800">Weekly Class Timetable</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>

              <Link 
                href="/student/fees" 
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-blue-50 text-[#1D4ED8]">
                    <CreditCard size={15} />
                  </div>
                  <span className="font-medium text-slate-800">Statement of Account (SOA)</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>

              <Link 
                href="/student/subjects" 
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-blue-50 text-[#1D4ED8]">
                    <BookOpen size={15} />
                  </div>
                  <span className="font-medium text-slate-800">Enrolled Courses & Checklists</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>

              <Link 
                href="/student/documents" 
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-blue-50 text-[#1D4ED8]">
                    <FileText size={15} />
                  </div>
                  <span className="font-medium text-slate-800">Registrar Document Requests</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Official University Bulletins */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-[#1D4ED8]" />
                <span className="font-semibold text-slate-900">Official Advisories</span>
              </div>
              <Link 
                href="/student/announcements"
                className="text-xs text-[#1D4ED8] hover:underline font-semibold"
              >
                View All
              </Link>
            </div>

            <div className="p-3 divide-y divide-slate-100 text-xs font-sans">
              {advisories.map((adv) => (
                <div key={adv.id} className="py-2.5 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-[#1D4ED8] uppercase tracking-wider">
                      {adv.department}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {adv.date}
                    </span>
                  </div>
                  <Link 
                    href="/student/announcements" 
                    className="font-medium text-slate-900 hover:text-[#1D4ED8] line-clamp-2 leading-snug"
                  >
                    {adv.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Deliverables */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <FileCheck size={15} className="text-[#1D4ED8]" />
                <span className="font-semibold text-slate-900">Academic Tasks & Submissions</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Active</span>
            </div>

            <div className="p-3 space-y-2.5 text-xs font-sans">
              {academicTasks.map((t) => (
                <div 
                  key={t.id}
                  className="p-2.5 rounded border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-[#1D4ED8] text-[11px]">
                      {t.course}
                    </span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                      t.status === 'Submitted' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : t.status === 'In Progress' 
                        ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800 leading-snug">
                    {t.task}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1.5 flex items-center gap-1">
                    <Clock size={11} />
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
