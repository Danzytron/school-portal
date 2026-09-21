'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
import { useAuth } from '@/lib/auth';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  GraduationCap, 
  Megaphone, 
  Clock, 
  MapPin, 
  FileText, 
  ClipboardList, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

function getSafeString(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.code || val.title || fallback;
  }
  return String(val);
}

function formatClassTime(cls: any): string {
  if (cls.time && typeof cls.time === 'string') return cls.time;
  if (cls.start_time && cls.end_time) {
    const s = String(cls.start_time).substring(0, 5);
    const e = String(cls.end_time).substring(0, 5);
    return `${s} – ${e}`;
  }
  return '09:00 AM – 10:30 AM';
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_TEACHER_DASHBOARD = {
    stats: {
      assignedSubjects: 4,
      totalStudents: 142,
      todayClasses: 2,
      pendingGrades: 3,
      attendanceRate: 97.4,
    },
    todays_classes: [
      {
        id: 1,
        time: '09:00 AM – 10:30 AM',
        code: 'IT 312',
        name: 'Advanced Web Systems & Architecture',
        section: 'BSIT 3-A',
        room: 'Computer Lab 3',
        status: 'In Progress'
      },
      {
        id: 2,
        time: '01:30 PM – 03:00 PM',
        code: 'IT 311',
        name: 'Advanced Database Systems',
        section: 'BSIT 3-B',
        room: 'Tech Studio A',
        status: 'Upcoming'
      }
    ],
    assigned_courses: [
      {
        id: 1,
        code: 'IT 312',
        name: 'Advanced Web Systems & Architecture',
        section: 'BSIT 3-A',
        students: 38,
        schedule: 'Mon / Wed 09:00 AM – 10:30 AM',
        room: 'CL 3'
      },
      {
        id: 2,
        code: 'IT 311',
        name: 'Advanced Database Systems',
        section: 'BSIT 3-B',
        students: 40,
        schedule: 'Tue / Thu 01:30 PM – 03:00 PM',
        room: 'Tech Studio A'
      },
      {
        id: 3,
        code: 'CS 301',
        name: 'Software Engineering 1',
        section: 'BSCS 3-A',
        students: 35,
        schedule: 'Fri 10:00 AM – 12:00 PM',
        room: 'Design Studio 2'
      },
      {
        id: 4,
        code: 'IT 314',
        name: 'Information Assurance & Security',
        section: 'BSIT 3-A',
        students: 29,
        schedule: 'Wed / Fri 02:00 PM – 03:30 PM',
        room: 'CL 1'
      }
    ],
    recent_announcements: [
      {
        id: 1,
        title: 'Office of the Registrar: Midterm Grade Encoding Deadline',
        content: 'All faculty members are reminded that the portal for midterm grade encoding will close on October 25, 2026. Please finalize ratings ahead of schedule.',
        published_at: '2026-08-25',
        author: 'University Registrar'
      },
      {
        id: 2,
        title: 'Faculty General Assembly & Accreditation Briefing',
        content: 'General Assembly meeting this Friday at 3:00 PM in the University Auditorium regarding upcoming PACUCOA Level III evaluation.',
        published_at: '2026-08-20',
        author: 'Office of the Academic Dean'
      },
      {
        id: 3,
        title: 'Department of IT: Submission of Final Project Specifications',
        content: 'Faculty teaching 3rd Year Capstone & Web Architecture courses must submit approved project specifications to the Dean by Sept 15.',
        published_at: '2026-08-15',
        author: 'CCS Department Chair'
      }
    ]
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/teacher/dashboard');
        const resData = response?.data || response;
        if (resData && typeof resData === 'object' && Object.keys(resData).length > 0) {
          const rawTodays = Array.isArray(resData.todays_classes) ? resData.todays_classes : DEFAULT_TEACHER_DASHBOARD.todays_classes;
          const normalizedTodays = rawTodays.map((cls: any, i: number) => ({
            id: cls.id || (i + 1),
            code: getSafeString(cls.subject?.code || cls.code, 'IT 101'),
            name: getSafeString(cls.subject?.name || cls.name, 'Lecture Session'),
            section: getSafeString(cls.section, 'BSIT 3-A'),
            room: getSafeString(cls.room, 'CL 3'),
            time: formatClassTime(cls),
            status: getSafeString(cls.status, 'In Progress'),
          }));

          const rawCourses = Array.isArray(resData.assigned_courses) ? resData.assigned_courses : DEFAULT_TEACHER_DASHBOARD.assigned_courses;
          const normalizedCourses = rawCourses.map((c: any, i: number) => ({
            id: c.id || (i + 1),
            code: getSafeString(c.subject?.code || c.code, 'IT 101'),
            name: getSafeString(c.subject?.name || c.name, 'Course Offering'),
            section: getSafeString(c.section, 'BSIT 3-A'),
            room: getSafeString(c.room, 'CL 3'),
            students: typeof c.students === 'number' ? c.students : 38,
            schedule: getSafeString(c.schedule, 'Mon / Wed 09:00 AM – 10:30 AM'),
          }));

          const rawAnnouncements = Array.isArray(resData.recent_announcements) ? resData.recent_announcements : DEFAULT_TEACHER_DASHBOARD.recent_announcements;
          const normalizedAnnouncements = rawAnnouncements.map((a: any, i: number) => ({
            id: a.id || (i + 1),
            title: getSafeString(a.title, 'Academic Bulletin'),
            content: getSafeString(a.content, ''),
            author: getSafeString(a.author, 'University Registrar'),
            published_at: typeof a.published_at === 'string' ? a.published_at.substring(0, 10) : '2026-08-25',
          }));

          setData({
            stats: {
              assignedSubjects: resData.assigned_subjects ?? resData.stats?.assignedSubjects ?? normalizedCourses.length ?? 4,
              totalStudents: resData.total_students ?? resData.stats?.totalStudents ?? 142,
              todayClasses: normalizedTodays.length,
              pendingGrades: resData.pending_grades ?? resData.stats?.pendingGrades ?? 3,
              attendanceRate: resData.stats?.attendanceRate ?? 97.4,
            },
            todays_classes: normalizedTodays,
            assigned_courses: normalizedCourses,
            recent_announcements: normalizedAnnouncements,
          });
        } else {
          setData(DEFAULT_TEACHER_DASHBOARD);
        }
      } catch {
        setData(DEFAULT_TEACHER_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading faculty portal dashboard..." />;

  const facultyData = data || DEFAULT_TEACHER_DASHBOARD;

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── 1. Faculty Editorial Dossier Header ──── */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Faculty Workspace — {user?.name || 'Prof. Alexander Cruz'}
            </span>
            <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Faculty Member
            </span>
          </div>
          <div className="text-xs text-slate-500 font-sans flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>College of Information Technology & Computer Studies</span>
            <span>•</span>
            <span className="text-[#1D4ED8] font-medium">1st Semester A.Y. 2026–2027</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/teacher/grades"
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <GraduationCap size={13} />
            <span>Grade Management</span>
          </Link>
          <Link
            href="/teacher/attendance"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <ClipboardList size={13} />
            <span>Attendance Entry</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Subtle Faculty Metrics ────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Assigned Courses', value: facultyData.stats?.assignedSubjects || 4, sub: 'Active Teaching Load', icon: BookOpen, color: 'text-[#1D4ED8] bg-blue-50 border-blue-200' },
          { label: 'Enrolled Students', value: facultyData.stats?.totalStudents || 142, sub: 'Across 4 Sections', icon: Users, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: "Today's Lectures", value: facultyData.todays_classes?.length || 2, sub: 'Classroom Sessions', icon: Calendar, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Pending Evaluations', value: facultyData.stats?.pendingGrades || 3, sub: 'Midterm Marks Queue', icon: AlertCircle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
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

      {/* ── 3. Main Faculty Grid ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Schedule & Active Course Offerings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Today's Teaching Schedule */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#1D4ED8]" />
                <span>Today's Lecture Sessions</span>
              </div>
              <Link href="/teacher/schedule" className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1">
                <span>Full Timetable</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100 font-sans">
              {facultyData.todays_classes && facultyData.todays_classes.length > 0 ? (
                facultyData.todays_classes.map((cls: any, i: number) => (
                  <div key={i} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1D4ED8] bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                          {getSafeString(cls.code, 'IT 101')}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.2 rounded">
                          {getSafeString(cls.section, 'Section 1')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase tracking-wider ${
                          cls.status === 'In Progress'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {getSafeString(cls.status, 'Scheduled')}
                        </span>
                      </div>

                      <h4 className="font-heading font-semibold text-xs text-slate-900 m-0 truncate">
                        {getSafeString(cls.name, 'Lecture Session')}
                      </h4>

                      <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5">
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Clock size={11} className="text-[#1D4ED8]" />
                          <span>{getSafeString(cls.time, '09:00 AM – 10:30 AM')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-[#1D4ED8]" />
                          <span>{getSafeString(cls.room, 'Classroom')}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link 
                        href="/teacher/attendance" 
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        Roll Call
                      </Link>
                      <Link 
                        href={`/teacher/students?subject_id=${cls.id}`} 
                        className="btn-primary text-[11px] px-2.5 py-1"
                      >
                        Class List
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No lecture sessions scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* Assigned Course Load */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-[#1D4ED8]" />
                <span>Assigned Courses & Enrollment</span>
              </div>
              <Link href="/teacher/subjects" className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1">
                <span>View All</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100 font-sans">
              {facultyData.assigned_courses.map((course: any) => (
                <div key={course.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1D4ED8] text-xs">
                        {getSafeString(course.code, 'IT 101')}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.2 rounded text-[10px] font-semibold">
                        {getSafeString(course.section, 'Section 1')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {course.students || 38} Students
                      </span>
                    </div>

                    <h4 className="font-heading font-semibold text-xs text-slate-900 m-0 truncate">
                      {getSafeString(course.name, 'Course Offering')}
                    </h4>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                      <span>{getSafeString(course.schedule, 'Regular Schedule')}</span>
                      <span>•</span>
                      <span>Room: {getSafeString(course.room, 'CL 1')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href="/teacher/grades"
                      className="btn-secondary text-[11px] px-2.5 py-1"
                    >
                      Grading
                    </Link>
                    <Link
                      href="/teacher/students"
                      className="btn-outline text-[11px] px-2.5 py-1"
                    >
                      Class List
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Faculty Advisories & Deadlines (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Faculty Advisories */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Megaphone size={15} className="text-[#1D4ED8]" />
                <span>Department Bulletins & Deadlines</span>
              </div>
              <Link href="/teacher/announcements" className="text-xs text-[#1D4ED8] hover:underline font-semibold">
                All Bulletins →
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100 font-sans">
              {facultyData.recent_announcements.map((item: any) => (
                <div key={item.id} className="p-3.5 hover:bg-slate-50/70 transition-colors space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold uppercase tracking-wider text-[#1D4ED8]">
                      {getSafeString(item.author, 'University Registrar')}
                    </span>
                    <span className="text-slate-400 font-mono">{item.published_at}</span>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-slate-900 m-0">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed m-0 pt-0.5">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="panel">
            <div className="panel-heading">
              <span>Faculty Portal Shortcuts</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/teacher/grades"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <GraduationCap size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Grade List</span>
              </Link>
              <Link
                href="/teacher/attendance"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <ClipboardList size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Attendance</span>
              </Link>
              <Link
                href="/teacher/students"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Users size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Class List</span>
              </Link>
              <Link
                href="/teacher/documents"
                className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <FolderOpen size={15} className="text-[#1D4ED8]" />
                <span className="font-medium text-slate-800">Course Syllabi</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
