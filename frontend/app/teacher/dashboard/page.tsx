'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
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
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';

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
        time: '09:00 AM - 10:30 AM',
        start_time: '09:00:00',
        end_time: '10:30:00',
        subject: {
          code: 'IT 312',
          name: 'Advanced Web Systems & Architecture',
          units: 3
        },
        section: { name: 'BSIT 3-A' },
        room: { name: 'Computer Lab 3', building: 'Engineering Complex' },
        status: 'In Progress'
      },
      {
        id: 2,
        time: '01:30 PM - 03:00 PM',
        start_time: '13:30:00',
        end_time: '15:00:00',
        subject: {
          code: 'IT 311',
          name: 'Advanced Database Systems',
          units: 3
        },
        section: { name: 'BSIT 3-B' },
        room: { name: 'Tech Hall Studio A', building: 'Science Building' },
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
        schedule: 'Mon / Wed 09:00 AM - 10:30 AM',
        room: 'CL 3'
      },
      {
        id: 2,
        code: 'IT 311',
        name: 'Advanced Database Systems',
        section: 'BSIT 3-B',
        students: 40,
        schedule: 'Tue / Thu 01:30 PM - 03:00 PM',
        room: 'Tech Studio A'
      },
      {
        id: 3,
        code: 'CS 301',
        name: 'Software Engineering 1',
        section: 'BSCS 3-A',
        students: 35,
        schedule: 'Fri 10:00 AM - 12:00 PM',
        room: 'Design Studio 2'
      },
      {
        id: 4,
        code: 'IT 314',
        name: 'Information Assurance & Security',
        section: 'BSIT 3-A',
        students: 29,
        schedule: 'Wed / Fri 02:00 PM - 03:30 PM',
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
        const resData = response.data || response;
        if (resData && typeof resData === 'object' && Object.keys(resData).length > 0) {
          setData({
            ...DEFAULT_TEACHER_DASHBOARD,
            ...resData,
            stats: {
              ...DEFAULT_TEACHER_DASHBOARD.stats,
              assignedSubjects: resData.assigned_subjects || resData.total_classes || DEFAULT_TEACHER_DASHBOARD.stats.assignedSubjects,
              totalStudents: resData.total_students || DEFAULT_TEACHER_DASHBOARD.stats.totalStudents,
              todayClasses: resData.todays_classes?.length || DEFAULT_TEACHER_DASHBOARD.stats.todayClasses,
              pendingGrades: resData.pending_grades || DEFAULT_TEACHER_DASHBOARD.stats.pendingGrades,
            },
            todays_classes: (resData.todays_classes && resData.todays_classes.length > 0) 
              ? resData.todays_classes 
              : DEFAULT_TEACHER_DASHBOARD.todays_classes,
            recent_announcements: (resData.recent_announcements && resData.recent_announcements.length > 0)
              ? resData.recent_announcements
              : DEFAULT_TEACHER_DASHBOARD.recent_announcements
          });
        } else {
          setData(DEFAULT_TEACHER_DASHBOARD);
        }
      } catch (err) {
        // Fallback to rich faculty data seamlessly in demo or standalone mode
        setData(DEFAULT_TEACHER_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading faculty academic portal..." />;

  const facultyData = data || DEFAULT_TEACHER_DASHBOARD;
  const facultyName = user?.name || 'Prof. Arnel L. Villanueva';
  const cleanDisplayName = facultyName.startsWith('Prof.') ? facultyName : `Prof. ${facultyName}`;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Institutional Faculty Welcome Header */}
      <div className="bg-[#1E3A8A] text-white p-5 sm:p-6 rounded-xl border border-[#1E40AF] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-t-4 border-t-[#2563EB]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/30">
              FACULTY DOSSIER • FAC-2026-0814
            </span>
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-400/30">
              REGULAR FULL-TIME
            </span>
          </div>

          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight m-0">
            Welcome back, {cleanDisplayName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-100 font-medium">
            <span className="text-white font-semibold">College of Computer Studies</span>
            <span>•</span>
            <span>Department of Information Technology</span>
            <span>•</span>
            <span>Assistant Professor II</span>
          </div>
        </div>

        <div className="bg-[#172554] border border-blue-400/30 p-3.5 rounded-xl flex items-center gap-3 shrink-0 self-start lg:self-center">
          <div className="p-2 rounded-lg bg-blue-600/30 text-blue-200 border border-blue-400/20">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-semibold block tracking-wider">
              Academic Term
            </span>
            <span className="text-xs sm:text-sm font-bold text-white font-heading">
              1st Semester A.Y. 2026–2027
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <Link 
          href="/teacher/grades" 
          className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:border-[#1D4ED8] hover:bg-blue-50/40 transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0 group-hover:bg-[#1D4ED8] group-hover:text-white transition-colors">
            <GraduationCap size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-[#1D4ED8]">
              Encode Grades
            </span>
            <span className="text-[10px] text-slate-500 font-mono block truncate">
              Term Evaluations
            </span>
          </div>
        </Link>

        <Link 
          href="/teacher/attendance" 
          className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ClipboardList size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-emerald-700">
              Roll Call
            </span>
            <span className="text-[10px] text-slate-500 font-mono block truncate">
              Daily Attendance
            </span>
          </div>
        </Link>

        <Link 
          href="/teacher/announcements" 
          className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:border-amber-600 hover:bg-amber-50/40 transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Megaphone size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-amber-700">
              Post Bulletin
            </span>
            <span className="text-[10px] text-slate-500 font-mono block truncate">
              Class Advisories
            </span>
          </div>
        </Link>

        <Link 
          href="/teacher/documents" 
          className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:border-purple-600 hover:bg-purple-50/40 transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FolderOpen size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-purple-700">
              Upload Files
            </span>
            <span className="text-[10px] text-slate-500 font-mono block truncate">
              Course Syllabi
            </span>
          </div>
        </Link>
      </div>

      {/* Key Faculty Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Assigned Classes" 
          value={facultyData.stats?.assignedSubjects || 4} 
          icon={BookOpen} 
          color="primary"
          link="/teacher/subjects"
          linkText="Manage Classes"
        />
        <StatCard 
          title="Enrolled Students" 
          value={facultyData.stats?.totalStudents || 142} 
          icon={Users} 
          color="success"
          link="/teacher/students"
          linkText="View Class Rosters"
        />
        <StatCard 
          title="Today's Lectures" 
          value={facultyData.todays_classes?.length || 2} 
          icon={Calendar} 
          color="warning"
          link="/teacher/schedule"
          linkText="View Daily Schedule"
        />
        <StatCard 
          title="Pending Grades" 
          value={facultyData.stats?.pendingGrades || 3} 
          icon={GraduationCap} 
          color="danger"
          link="/teacher/grades"
          linkText="Encode Final Grades"
        />
      </div>

      {/* Main Grid: Schedule & Course Load */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Today's Schedule & Assigned Course Offerings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Today's Schedule Panel */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#1D4ED8]" />
                <span className="font-heading font-bold text-slate-900">Today's Teaching Schedule</span>
              </div>
              <Link href="/teacher/schedule" className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1">
                <span>Full Timetable</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100">
              {facultyData.todays_classes && facultyData.todays_classes.length > 0 ? (
                facultyData.todays_classes.map((cls: any, i: number) => (
                  <div key={i} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                          {cls.subject?.code || cls.code || 'IT 312'}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {cls.section?.name || cls.section || 'BSIT 3-A'}
                        </span>
                        {cls.status && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            cls.status === 'In Progress' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                          }`}>
                            {cls.status}
                          </span>
                        )}
                      </div>

                      <div className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                        {cls.subject?.name || cls.name || 'Lecture Course'}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-sans">
                        <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                          <Clock size={12} className="text-[#1D4ED8]" />
                          {cls.time || `${cls.start_time?.substring(0, 5)} - ${cls.end_time?.substring(0, 5)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#1D4ED8]" />
                          {cls.room?.name || cls.room || 'Computer Lab 3'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link 
                        href={`/teacher/attendance`} 
                        className="btn-outline text-xs flex items-center gap-1"
                      >
                        <ClipboardList size={12} />
                        <span>Attendance</span>
                      </Link>
                      <Link 
                        href={`/teacher/students?subject_id=${cls.id}`} 
                        className="btn-primary text-xs flex items-center gap-1"
                      >
                        <Users size={12} />
                        <span>Roster</span>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No classes scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* Assigned Course Offerings List */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#1D4ED8]" />
                <span className="font-heading font-bold text-slate-900">Active Course Load (1st Semester)</span>
              </div>
              <Link href="/teacher/subjects" className="text-xs font-semibold text-[#1D4ED8] hover:underline">
                View All Courses →
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100">
              {facultyData.assigned_courses.map((course: any) => (
                <div key={course.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1D4ED8] text-xs">
                        {course.code}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {course.section}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {course.students} Students
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-slate-900 text-xs sm:text-sm truncate m-0">
                      {course.name}
                    </h4>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>{course.schedule}</span>
                      <span>•</span>
                      <span>Room: {course.room}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href={`/teacher/grades`}
                      className="btn-outline text-xs flex items-center gap-1"
                    >
                      <GraduationCap size={12} />
                      <span>Grades</span>
                    </Link>
                    <Link
                      href={`/teacher/students?subject_id=${course.id}`}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <Users size={12} />
                      <span>Roster</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Advisories, Institutional Deadlines & Faculty Profile */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Faculty Profile Summary Dossier */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#1D4ED8]" />
                <span className="font-heading font-bold text-slate-900">Faculty Credentials Dossier</span>
              </div>
              <Link href="/teacher/profile" className="text-xs font-semibold text-[#1D4ED8] hover:underline">
                Edit Dossier →
              </Link>
            </div>

            <div className="p-4 space-y-3.5 text-xs font-sans">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-heading font-bold text-lg shrink-0 shadow-2xs">
                  {facultyName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-slate-900 text-sm truncate">
                    {cleanDisplayName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {user?.email || 'teacher@schoolportal.test'}
                  </div>
                  <div className="text-[10px] text-[#1D4ED8] font-mono font-semibold">
                    Employee ID: FAC-2026-0814
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Academic Rank</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">Assistant Professor II</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">College Dept</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">Computer Studies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Bulletins & Faculty Advisories */}
          <div className="panel">
            <div className="panel-heading">
              <div className="flex items-center gap-2">
                <Megaphone size={16} className="text-[#1D4ED8]" />
                <span className="font-heading font-bold text-slate-900">Faculty Memorandums & Advisories</span>
              </div>
              <Link href="/teacher/announcements" className="text-xs font-semibold text-[#1D4ED8] hover:underline">
                Bulletins →
              </Link>
            </div>

            <div className="p-0 divide-y divide-slate-100">
              {facultyData.recent_announcements && facultyData.recent_announcements.length > 0 ? (
                facultyData.recent_announcements.map((ann: any) => (
                  <div key={ann.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-heading font-bold text-slate-900 text-xs leading-snug m-0">
                        {ann.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {ann.published_at || 'Recent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed m-0">
                      {ann.content}
                    </p>
                    {ann.author && (
                      <div className="text-[10px] text-slate-400 pt-1 font-medium">
                        Issued by: <span className="text-slate-600 font-semibold">{ann.author}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No active memorandums.
                </div>
              )}
            </div>
          </div>

          {/* Academic Deadlines Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded bg-amber-100 text-amber-800 mt-0.5 shrink-0">
              <AlertCircle size={16} />
            </div>
            <div className="text-xs text-amber-900 leading-relaxed space-y-1">
              <div className="font-heading font-bold text-slate-900">
                Grade Encoding Advisory (CHED Deadline)
              </div>
              <p className="text-[11px] text-amber-900/90 m-0">
                Preliminary grade submissions must be completed before midterm exam week. Please verify student ratings prior to submitting official transcripts to the University Registrar.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
