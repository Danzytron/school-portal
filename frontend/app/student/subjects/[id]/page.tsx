'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Mail,
  Download,
  Users,
  Award,
  BookMarked,
  Info
} from 'lucide-react';

interface CourseDetail {
  id: string;
  code: string;
  name: string;
  units: number;
  section: string;
  semester: string;
  schoolYear: string;
  department: string;
  instructor: {
    name: string;
    email: string;
    department: string;
    office: string;
    consultationHours: string;
  };
  schedule: {
    days: string;
    time: string;
    room: string;
    building: string;
  };
  description: string;
  learningOutcomes: string[];
  gradingScheme: { component: string; weight: number }[];
  syllabusModules: {
    week: string;
    title: string;
    topics: string[];
    deliverables?: string;
  }[];
  classmates: { id: string; name: string; email: string }[];
}

const COURSES_DATABASE: Record<string, CourseDetail> = {
  '1': {
    id: '1',
    code: 'FREE ELEC 1',
    name: 'FREE ELECTIVE 1 (Mobile Application Development)',
    units: 3,
    section: 'BSIT 3-A',
    semester: '1st Semester',
    schoolYear: 'A.Y. 2026–2027',
    department: 'College of Information Technology',
    instructor: {
      name: 'Sir Vincent John Cababan',
      email: 'vincent.cababan@cebueasterncollege.edu.ph',
      department: 'Computer Studies Faculty',
      office: 'Faculty Room 302, College Building',
      consultationHours: 'Wednesdays & Fridays 1:00 PM – 3:00 PM'
    },
    schedule: {
      days: 'Monday and Wednesday',
      time: '10:30 AM - 12:00 PM',
      room: 'Room H 204',
      building: 'Heritage Hall, Main Campus'
    },
    description: 'An intensive hands-on course covering cross-platform mobile application architecture, reactive state management, asynchronous REST APIs, and native hardware integration using modern frameworks.',
    learningOutcomes: [
      'Design responsive, mobile-first user interfaces adhering to accessibility standards.',
      'Implement structured client-side caching, offline data persistence, and token-based auth.',
      'Connect mobile clients to secure backend microservices with real-time websocket streams.',
      'Deploy compiled release binaries to internal staging test tracks.'
    ],
    gradingScheme: [
      { component: 'Laboratory Exercises & Coding Workshops', weight: 30 },
      { component: 'Major Project / Capstone Mobile App', weight: 30 },
      { component: 'Midterm Examination', weight: 20 },
      { component: 'Final Term Examination', weight: 20 }
    ],
    syllabusModules: [
      {
        week: 'Weeks 1–3',
        title: 'Core Architecture & Component Lifecycle',
        topics: ['Mobile UX fundamentals', 'State machines & reactive hooks', 'Navigation stacks & deep linking'],
        deliverables: 'Lab 1: Responsive Layout Implementation'
      },
      {
        week: 'Weeks 4–7',
        title: 'Network Communication & Local Storage',
        topics: ['REST APIs & JSON parsing', 'Secure keystore management', 'Offline SQL database sync'],
        deliverables: 'Lab 2: Weather & News Aggregator Client'
      },
      {
        week: 'Weeks 8–9',
        title: 'Midterm Evaluation & Prototype Review',
        topics: ['Comprehensive written assessment', 'Milestone 1 Code Review'],
        deliverables: 'Midterm Exam & Project Proposal'
      },
      {
        week: 'Weeks 10–14',
        title: 'Native Hardware APIs & Push Services',
        topics: ['Geolocation & mapping sensors', 'Camera capture & binary uploads', 'Push notification queues'],
        deliverables: 'Lab 3: Geotagged Field Reporting App'
      },
      {
        week: 'Weeks 15–18',
        title: 'Final Project Defense & App Store Packaging',
        topics: ['Performance profiling', 'App signing & release bundles', 'Live project defense'],
        deliverables: 'Final Capstone App Defense'
      }
    ],
    classmates: [
      { id: '2026-00001', name: 'Alex Cruz', email: 'alex.cruz@cebueasterncollege.edu.ph' },
      { id: '2026-00002', name: 'Bea Patricia Santos', email: 'bea.santos@cebueasterncollege.edu.ph' },
      { id: '2026-00003', name: 'Carlo D. Reyes', email: 'carlo.reyes@cebueasterncollege.edu.ph' },
      { id: '2026-00004', name: 'Diana Lim', email: 'diana.lim@cebueasterncollege.edu.ph' },
      { id: '2026-00005', name: 'Eduardo Tan', email: 'eduardo.tan@cebueasterncollege.edu.ph' }
    ]
  },
  '6': {
    id: '6',
    code: 'IT EVD31',
    name: 'EVENT DRIVEN PROGRAMMING (LECTURE & LAB)',
    units: 3,
    section: 'BSIT 3-A',
    semester: '1st Semester',
    schoolYear: 'A.Y. 2026–2027',
    department: 'College of Information Technology',
    instructor: {
      name: 'Sir Yestin Prado',
      email: 'yestin.prado@cebueasterncollege.edu.ph',
      department: 'Software Engineering Faculty',
      office: 'Faculty Room 305, IT Building',
      consultationHours: 'Tuesdays & Thursdays 2:00 PM – 4:00 PM'
    },
    schedule: {
      days: 'Monday & Wednesday',
      time: '08:30 AM - 09:30 AM',
      room: 'Room OL 107',
      building: 'Online / Main Building'
    },
    description: 'Explores event-driven programming paradigms, asynchronous event loops, message dispatching, and GUI component architectures for high-throughput enterprise systems.',
    learningOutcomes: [
      'Master event-loop semantics and asynchronous callbacks.',
      'Construct scalable GUI systems with decoupled event emitters and listeners.',
      'Handle concurrency, thread pooling, and error propagation.'
    ],
    gradingScheme: [
      { component: 'Laboratory Machine Problems', weight: 40 },
      { component: 'Midterm Exam', weight: 30 },
      { component: 'Final Project', weight: 30 }
    ],
    syllabusModules: [
      {
        week: 'Weeks 1–4',
        title: 'Asynchronous Fundamentals & Dispatch Queues',
        topics: ['Event loops', 'Signal-slot pattern', 'Callback hell mitigation']
      },
      {
        week: 'Weeks 5–8',
        title: 'Desktop GUI & Reactive State Binding',
        topics: ['Form event handling', 'Custom widget creation', 'Keyboard & mouse event filters']
      }
    ],
    classmates: [
      { id: '2026-00001', name: 'Alex Cruz', email: 'alex.cruz@cebueasterncollege.edu.ph' },
      { id: '2026-00002', name: 'Bea Patricia Santos', email: 'bea.santos@cebueasterncollege.edu.ph' }
    ]
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'syllabus' | 'instructor' | 'grading' | 'classmates'>('syllabus');

  const courseId = (params?.id as string) || '1';
  const course = COURSES_DATABASE[courseId] || COURSES_DATABASE['1'];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/subjects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1D4ED8] font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Enrolled Courses</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
          Section: {course.section}
        </span>
      </div>

      {/* Course Hero Dossier */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2.5 py-0.5 rounded">
                {course.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {course.units}.0 Academic Units
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {course.semester} ({course.schoolYear})
              </span>
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
              {course.name}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-3xl pt-1 m-0">
              {course.description}
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-end gap-2 text-right">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Enrolled & Active
            </span>
          </div>
        </div>

        {/* Schedule & Faculty Quick Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <User size={14} className="text-[#1D4ED8] shrink-0" />
            <span className="truncate">Instructor: <strong className="text-slate-800 font-medium">{course.instructor.name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#1D4ED8] shrink-0" />
            <span>{course.schedule.days} ({course.schedule.time})</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#1D4ED8] shrink-0" />
            <span>{course.schedule.room} · {course.schedule.building}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-6 overflow-x-auto text-xs font-medium">
        {[
          { id: 'syllabus', label: 'Syllabus & Modules', icon: BookOpen },
          { id: 'instructor', label: 'Faculty & Consultation', icon: User },
          { id: 'grading', label: 'Grading Criteria', icon: Award },
          { id: 'classmates', label: 'Class Directory', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 pt-1 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'syllabus' && (
        <div className="space-y-5">
          {/* Learning Outcomes */}
          <div className="panel">
            <div className="panel-heading">
              <span>Intended Course Learning Outcomes (CHED Standard)</span>
            </div>
            <div className="panel-body space-y-2.5">
              {course.learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Modules Breakdown */}
          <div className="panel">
            <div className="panel-heading">
              <span>Weekly Instructional Modules</span>
            </div>
            <div className="p-0 divide-y divide-slate-100 font-sans">
              {course.syllabusModules.map((mod, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {mod.week}
                      </span>
                      <h3 className="font-heading font-bold text-sm text-slate-900 m-0">
                        {mod.title}
                      </h3>
                    </div>
                    {mod.deliverables && (
                      <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded">
                        Task: {mod.deliverables}
                      </span>
                    )}
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                    {mod.topics.map((t, tIdx) => (
                      <li key={tIdx}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'instructor' && (
        <div className="panel">
          <div className="panel-heading">
            <span>Course Faculty Information</span>
          </div>
          <div className="panel-body space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1D4ED8] font-heading font-bold text-base flex items-center justify-center border border-blue-200">
                {course.instructor.name.split(' ').slice(-1)[0].charAt(0)}
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 m-0">{course.instructor.name}</h3>
                <div className="text-xs text-slate-500">{course.instructor.department}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Institutional Email</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-800">
                  <Mail size={13} className="text-[#1D4ED8]" />
                  <span>{course.instructor.email}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Faculty Consultation Hours</span>
                <span className="font-medium text-slate-800 block">{course.instructor.consultationHours}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grading' && (
        <div className="panel">
          <div className="panel-heading">
            <span>Evaluation & Grading Distribution</span>
          </div>
          <div className="panel-body space-y-4">
            <div className="divide-y divide-slate-100">
              {course.gradingScheme.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{item.component}</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                    {item.weight}%
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-700 space-y-1">
              <strong className="text-[#1D4ED8] block">Institutional Policy:</strong>
              <p className="m-0 leading-relaxed">
                Final marks follow the standard 1.00 (97–100) to 3.00 (75 Passing) scale. Minimum semester attendance of 80% is mandatory.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'classmates' && (
        <div className="panel">
          <div className="panel-heading">
            <span>Enrolled Students ({course.classmates.length})</span>
          </div>
          <div className="p-0 divide-y divide-slate-100">
            {course.classmates.map((student) => (
              <div key={student.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 font-mono font-bold text-xs flex items-center justify-center">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{student.id}</div>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
                  {student.email}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
