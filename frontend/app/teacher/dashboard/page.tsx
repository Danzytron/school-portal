'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/auth';
import { BookOpen, Users, Calendar, GraduationCap, Megaphone, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/teacher/dashboard');
        setData(response.data || response);
      } catch (err) {
        setError('Failed to load faculty dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading faculty portal..." />;
  if (error) return <EmptyState title="Error Loading Dashboard" description={error} />;

  return (
    <div className="space-y-5">
      {/* Institutional Faculty Header */}
      <div className="bg-[#1E3A8A] text-white p-5 rounded-xl border border-[#1E40AF] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-t-[#2563EB]">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">Cebu Eastern College • Faculty & Academic Portal</div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5 mb-1">
            Welcome back, Prof. {user?.name}!
          </h1>
          <div className="flex items-center gap-2 text-xs text-blue-100">
            <span className="font-semibold text-white">College of Computer Studies</span>
            <span>•</span>
            <span>Faculty Member</span>
          </div>
        </div>

        <div className="bg-[#172554] border border-blue-400/30 px-3.5 py-2 rounded-lg text-right">
          <span className="text-[11px] text-blue-200 uppercase font-semibold block">Academic Term</span>
          <span className="text-xs font-bold text-white">1st Semester A.Y. 2026–2027</span>
        </div>
      </div>

      {/* Faculty Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Assigned Subjects" 
          value={data?.assigned_subjects || data?.stats?.assignedSubjects || 4} 
          icon={BookOpen} 
          color="primary"
          link="/teacher/subjects"
          linkText="Manage Classes"
        />
        <StatCard 
          title="Total Students" 
          value={data?.total_students || data?.stats?.totalStudents || 128} 
          icon={Users} 
          color="success"
          link="/teacher/students"
          linkText="View Roster"
        />
        <StatCard 
          title="Today's Lectures" 
          value={data?.todays_classes?.length || data?.stats?.todayClasses || 2} 
          icon={Calendar} 
          color="warning"
          link="/teacher/schedule"
          linkText="View Timetable"
        />
        <StatCard 
          title="Pending Grades" 
          value={data?.pending_grades || data?.stats?.pendingGrades || 3} 
          icon={GraduationCap} 
          color="danger"
          link="/teacher/grades"
          linkText="Encode Grades"
        />
      </div>

      {/* Schedule & Announcements Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Schedule Panel */}
        <div className="panel">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-700" />
              <span>Today's Teaching Schedule</span>
            </div>
            <Link href="/teacher/schedule" className="text-xs font-semibold text-blue-700 hover:underline">Full Schedule →</Link>
          </div>
          <div className="p-0">
            {data?.todays_classes && data.todays_classes.length > 0 ? (
              <table className="table-bordered border-0">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Subject & Title</th>
                    <th>Section</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {data.todays_classes.map((cls: any, i: number) => (
                    <tr key={i}>
                      <td className="font-semibold text-blue-700 whitespace-nowrap">{cls.start_time || cls.time} - {cls.end_time || ''}</td>
                      <td>
                        <div className="font-bold text-slate-800">{cls.subject?.code || cls.subjectCode}</div>
                        <div className="text-[11px] text-slate-500">{cls.subject?.name || ''}</div>
                      </td>
                      <td>
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          {cls.section?.name || cls.section}
                        </span>
                      </td>
                      <td className="text-slate-600 font-mono text-xs">{cls.room?.name || cls.room || 'TBA'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No classes scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements Panel */}
        <div className="panel">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-blue-700" />
              <span>Faculty Announcements</span>
            </div>
            <Link href="/teacher/announcements" className="text-xs font-semibold text-blue-700 hover:underline">Post Bulletin →</Link>
          </div>
          <div className="p-0 divide-y divide-slate-100">
            {data?.recent_announcements && data.recent_announcements.length > 0 ? (
              data.recent_announcements.slice(0, 4).map((ann: any, i: number) => (
                <div key={i} className="p-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-800 m-0">{ann.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(ann.published_at || ann.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 m-0 leading-normal">
                    {ann.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No faculty announcements available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
