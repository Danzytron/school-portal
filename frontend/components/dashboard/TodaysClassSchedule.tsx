'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Coffee,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  DEFAULT_STUDENT_WEEKLY_SCHEDULES,
  RawScheduleEntry,
  evaluateStudentSchedule,
  isLegacySeedSchedule,
  TodayClassOccurrence,
} from '@/lib/schedule/scheduleEngine';

interface TodaysClassScheduleProps {
  initialSchedules?: RawScheduleEntry[];
  className?: string;
}

// Harmonious palette of subject accents matching CEC School Blue identity
interface SubjectAccent {
  codeBadge: string;
  dotBg: string;
  gradientStrip: string;
  borderAccent: string;
  timeBadge: string;
  iconBg: string;
}

const SUBJECT_ACCENTS: Record<string, SubjectAccent> = {
  // Core IT Architecture / Lecture (Rich School Blue)
  'IT SIA31': {
    codeBadge: 'bg-blue-50 text-[#1D4ED8] border-blue-200',
    dotBg: 'bg-[#1D4ED8]',
    gradientStrip: 'from-[#1D4ED8] to-[#3B82F6]',
    borderAccent: 'border-l-[#1D4ED8]',
    timeBadge: 'bg-blue-50 text-[#1D4ED8] border-blue-200/80',
    iconBg: 'bg-blue-50 text-[#1D4ED8]',
  },
  // Programming (Sky Blue)
  'IT EVD31': {
    codeBadge: 'bg-sky-50 text-sky-700 border-sky-200',
    dotBg: 'bg-sky-600',
    gradientStrip: 'from-sky-600 to-blue-500',
    borderAccent: 'border-l-sky-600',
    timeBadge: 'bg-sky-50 text-sky-700 border-sky-200/80',
    iconBg: 'bg-sky-50 text-sky-700',
  },
  // Security (Teal)
  'IT IAS31': {
    codeBadge: 'bg-teal-50 text-teal-700 border-teal-200',
    dotBg: 'bg-teal-600',
    gradientStrip: 'from-teal-600 to-emerald-500',
    borderAccent: 'border-l-teal-600',
    timeBadge: 'bg-teal-50 text-teal-700 border-teal-200/80',
    iconBg: 'bg-teal-50 text-teal-700',
  },
  // Networking (Indigo / Royal)
  'IT NET31': {
    codeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotBg: 'bg-indigo-600',
    gradientStrip: 'from-indigo-600 to-blue-600',
    borderAccent: 'border-l-indigo-600',
    timeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    iconBg: 'bg-indigo-50 text-indigo-700',
  },
  // Mobile Elective (Amber / Warm Gold)
  'FREE ELEC 1': {
    codeBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    dotBg: 'bg-amber-500',
    gradientStrip: 'from-amber-500 to-orange-500',
    borderAccent: 'border-l-amber-500',
    timeBadge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    iconBg: 'bg-amber-50 text-amber-700',
  },
  // Culture & GenEd (Purple / Rose)
  'GE ELEC 6': {
    codeBadge: 'bg-violet-50 text-violet-700 border-violet-200',
    dotBg: 'bg-violet-600',
    gradientStrip: 'from-violet-600 to-indigo-500',
    borderAccent: 'border-l-violet-600',
    timeBadge: 'bg-violet-50 text-violet-700 border-violet-200/80',
    iconBg: 'bg-violet-50 text-violet-700',
  },
  'GE ELEC 5': {
    codeBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    dotBg: 'bg-rose-600',
    gradientStrip: 'from-rose-600 to-pink-500',
    borderAccent: 'border-l-rose-600',
    timeBadge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    iconBg: 'bg-rose-50 text-rose-700',
  },
  'IT SP131': {
    codeBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    dotBg: 'bg-cyan-600',
    gradientStrip: 'from-cyan-600 to-teal-500',
    borderAccent: 'border-l-cyan-600',
    timeBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
    iconBg: 'bg-cyan-50 text-cyan-800',
  },
};

const DEFAULT_ACCENT: SubjectAccent = {
  codeBadge: 'bg-blue-50 text-[#1D4ED8] border-blue-200',
  dotBg: 'bg-[#1D4ED8]',
  gradientStrip: 'from-[#1D4ED8] to-blue-400',
  borderAccent: 'border-l-[#1D4ED8]',
  timeBadge: 'bg-blue-50 text-[#1D4ED8] border-blue-200/80',
  iconBg: 'bg-blue-50 text-[#1D4ED8]',
};

function getSubjectAccent(code: string): SubjectAccent {
  // Check exact or base code (e.g. "IT NET31 LAB" -> "IT NET31")
  if (SUBJECT_ACCENTS[code]) return SUBJECT_ACCENTS[code];
  const baseCode = code.replace(/\s+LAB$/i, '').trim();
  if (SUBJECT_ACCENTS[baseCode]) return SUBJECT_ACCENTS[baseCode];
  return DEFAULT_ACCENT;
}

export function TodaysClassSchedule({
  initialSchedules,
  className = '',
}: TodaysClassScheduleProps) {
  const validInitial =
    initialSchedules &&
    initialSchedules.length > 0 &&
    !isLegacySeedSchedule(initialSchedules)
      ? initialSchedules
      : DEFAULT_STUDENT_WEEKLY_SCHEDULES;

  const [schedules, setSchedules] = useState<RawScheduleEntry[]>(validInitial);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (
      initialSchedules &&
      initialSchedules.length > 0 &&
      !isLegacySeedSchedule(initialSchedules)
    ) {
      setSchedules(initialSchedules);
    }
  }, [initialSchedules]);

  // Fetch the student's saved weekly schedule from the authenticated API
  const fetchStudentSchedule = useCallback(async (silent = false) => {
    if (!silent && schedules.length === 0) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await api.get<any>('/student/schedule');
      const data = Array.isArray(response)
        ? response
        : response?.data && Array.isArray(response.data)
        ? response.data
        : null;

      if (Array.isArray(data) && data.length > 0 && !isLegacySeedSchedule(data)) {
        setSchedules(data);
        setError(null);
      } else {
        // Use verified CEC BSIT 3-A semester schedule
        setSchedules(DEFAULT_STUDENT_WEEKLY_SCHEDULES);
      }
    } catch {
      setSchedules((prev) => {
        if (!prev || prev.length === 0) {
          setError('Unable to load your class schedule right now.');
          return [];
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, [schedules.length]);

  useEffect(() => {
    fetchStudentSchedule(false);

    const handleScheduleSync = () => {
      fetchStudentSchedule(true);
    };
    window.addEventListener('cec:schedule-sync', handleScheduleSync);
    return () => {
      window.removeEventListener('cec:schedule-sync', handleScheduleSync);
    };
  }, [fetchStudentSchedule]);

  // Real-time clock ticker (every 15 seconds + immediate update on tab focus/visibility)
  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  const evaluation = useMemo(() => {
    return evaluateStudentSchedule(schedules, now);
  }, [schedules, now]);

  const {
    manilaTime,
    overallStatus,
    ongoingClasses,
    currentClass,
    nextScheduledClass,
    todayClasses,
    conflictsToday,
  } = evaluation;

  // Clean loading skeleton
  if (loading) {
    return (
      <div className={`bg-white border border-slate-200/90 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-slate-50/60 border-b border-slate-200/80 p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-44 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-3.5 w-36 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-7 w-28 bg-slate-200/70 rounded-full animate-pulse" />
        </div>
        <div className="p-5 space-y-3">
          <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
          <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error && schedules.length === 0) {
    return (
      <div className={`bg-white border border-slate-200/90 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-slate-50/60 border-b border-slate-200/80 p-5 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900 tracking-tight m-0">
              Today&apos;s Class Schedule
            </h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">Your classes and activities for today.</p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            {manilaTime.formattedShortDate}
          </span>
        </div>
        <div className="p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
            <AlertCircle size={18} />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-slate-900 m-0">Failed to load schedule</h4>
            <p className="text-xs text-slate-500 m-0">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchStudentSchedule(false)}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 px-3.5 py-1.5 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden font-sans ${className}`}>
      
      {/* ── 2. Visually Attractive Schedule Header ──────────────────────── */}
      <div className="relative bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-white border-b border-blue-100/80 p-4 sm:p-5">
        {/* Subtle decorative blue bar along the very top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-sky-400" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100/70 text-[#1D4ED8] border border-blue-200/60 shadow-2xs">
                <CalendarIcon size={16} />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900 tracking-tight m-0">
                Today&apos;s Class Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-600 m-0 pl-0.5 font-normal">
              Your classes and activities for today.
            </p>
          </div>

          {/* Small elegant date badge with live clock */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <div className="flex items-center gap-2 bg-white/95 border border-blue-200/70 rounded-full px-3 py-1 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[#1D4ED8]">
                <Clock size={12} className="text-[#1D4ED8]" />
                <span className="tabular-nums">{manilaTime.formattedTime}</span>
              </div>
              <span className="h-3 w-px bg-slate-200" />
              <span className="text-[11px] font-medium text-slate-700">
                {manilaTime.formattedShortDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">

        {/* ── CASE 5: No Classes Scheduled At All ── */}
        {overallStatus === 'NO_CLASSES_SCHEDULED' && (
          <div className="p-6 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
              <BookOpen size={18} />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 m-0">
              No classes are currently scheduled.
            </h4>
            <p className="text-xs text-slate-500 m-0 max-w-sm mx-auto leading-relaxed">
              There are no enrolled class sessions found in your timetable for this term.
            </p>
          </div>
        )}

        {/* ── CASE 1: Current Ongoing Class Spotlight ─────────────────────── */}
        {overallStatus === 'ONGOING' && currentClass && (
          <div className="space-y-3">
            {ongoingClasses.map((activeCls) => {
              const accent = getSubjectAccent(activeCls.code);
              return (
                <div
                  key={activeCls.id}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white border-2 border-[#1D4ED8]/70 rounded-xl p-4 shadow-[0_4px_16px_rgba(29,78,216,0.08)] transition-all"
                >
                  {/* Left vibrant gradient indicator strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#1D4ED8] to-sky-500" />

                  <div className="pl-1.5 space-y-2.5">
                    {/* Header Row: Ongoing Badge + Remaining Time */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          ONGOING
                        </span>
                        <span className="text-xs font-semibold text-[#1E3A8A]">
                          Class in Progress
                        </span>
                      </div>

                      {activeCls.remainingText && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] bg-blue-100/70 border border-blue-200/80 px-2.5 py-0.5 rounded-md font-mono tabular-nums">
                          <Clock size={11} />
                          {activeCls.remainingText}
                        </span>
                      )}
                    </div>

                    {/* Subject Code, Title & Units */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-white border border-blue-200 px-2 py-0.5 rounded-md shadow-2xs">
                          {activeCls.code}
                        </span>
                        {activeCls.units && (
                          <span className="text-[11px] font-medium text-slate-500">
                            {activeCls.units.toFixed(1)} Units
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading text-sm font-bold text-slate-900 m-0 mt-1 leading-snug">
                        {activeCls.name}
                      </h4>
                    </div>

                    {/* Metadata Row: Time, Room, Faculty */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5 border-t border-blue-100/90 text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                        <Clock size={13} className="text-[#1D4ED8] shrink-0" />
                        <span>{activeCls.timeRangeFormatted}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={13} className="text-[#1D4ED8] shrink-0" />
                        <span className="font-semibold text-slate-900 truncate">
                          {activeCls.room}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <UserIcon size={13} className="text-[#1D4ED8] shrink-0" />
                        <span className="truncate">{activeCls.instructor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CASE 2 & CASE 4: No Class Ongoing Right Now (Subtle Clean Banner) ── */}
        {(overallStatus === 'UPCOMING_TODAY' || overallStatus === 'NO_CLASS_TODAY') && (
          <div className="bg-gradient-to-r from-slate-50 via-sky-50/30 to-white border border-slate-200/90 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-sky-100/80 border border-sky-200/80 text-sky-700 shrink-0 mt-0.5 shadow-2xs">
              <Coffee size={15} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 m-0">
                  No class at this time.
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded-full">
                  Free Period
                </span>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                You don&apos;t have any ongoing classes right now. Enjoy your free time!
              </p>
            </div>
          </div>
        )}

        {/* ── CASE 3: Done for the Day ────────────────────────────────────── */}
        {overallStatus === 'DONE_FOR_TODAY' && (
          <div className="bg-gradient-to-r from-emerald-50/60 via-slate-50/40 to-white border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100/80 border border-emerald-200 text-emerald-700 shrink-0 mt-0.5 shadow-2xs">
              <CheckCircle2 size={16} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 m-0">
                  No More Classes Today
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  Completed
                </span>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                You&apos;re done with your classes for today! No class at this time.
              </p>
            </div>
          </div>
        )}

        {/* ── Schedule Conflict Notification (if overlapping entries exist) ── */}
        {conflictsToday.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-start gap-2.5 text-xs">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Schedule Note: </span>
              {conflictsToday.map((c, i) => (
                <span key={i}>
                  {c.classA.code} and {c.classB.code} share the same slot ({c.overlapWindow})
                  {i < conflictsToday.length - 1 ? '; ' : '.'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Next Scheduled Class Spotlight (Upcoming Today, Tomorrow, or Next Scheduled Day) ── */}
        {nextScheduledClass && (
          <div className="bg-white border border-blue-200/90 rounded-xl p-3.5 space-y-2.5 shadow-[0_2px_8px_rgba(29,78,216,0.04)] hover:border-[#1D4ED8]/60 transition-colors">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                {nextScheduledClass.headlineLabel}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {nextScheduledClass.targetDateFormatted}
              </span>
            </div>

            {nextScheduledClass.isTomorrow && (
              <p className="text-xs font-semibold text-[#1E3A8A] bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded-md m-0">
                Your next class is tomorrow.
              </p>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {nextScheduledClass.occurrence.code}
                </span>
                <span className="text-xs font-semibold text-[#1D4ED8] bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-md font-mono tabular-nums">
                  {nextScheduledClass.isToday && evaluation.nextClassToday?.startsInText
                    ? evaluation.nextClassToday.startsInText
                    : nextScheduledClass.isTomorrow
                    ? `Tomorrow at ${nextScheduledClass.occurrence.startTimeFormatted}`
                    : `${nextScheduledClass.targetDayName} at ${nextScheduledClass.occurrence.startTimeFormatted}`}
                </span>
              </div>
              <h4 className="font-heading text-xs font-bold text-slate-900 m-0 mt-1 leading-snug">
                {nextScheduledClass.occurrence.name}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-mono text-slate-800">
                <Clock size={12} className="text-[#1D4ED8] shrink-0" />
                <span>{nextScheduledClass.occurrence.timeRangeFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800">
                <MapPin size={12} className="text-[#1D4ED8] shrink-0" />
                <span className="font-semibold truncate">{nextScheduledClass.occurrence.room}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserIcon size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{nextScheduledClass.occurrence.instructor}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Connected Timeline Design for Today's Classes ────────────── */}
        {todayClasses.length > 0 ? (
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between text-xs px-0.5">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
                {manilaTime.weekday} Timeline ({todayClasses.length}{' '}
                {todayClasses.length === 1 ? 'Class' : 'Classes'})
              </span>
              <Link
                href="/student/schedule"
                className="text-[#1D4ED8] hover:underline font-semibold inline-flex items-center gap-0.5 text-xs group"
              >
                <span>Full Timetable</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Vertical Connected Timeline Container */}
            <div className="relative pl-6 sm:pl-7 space-y-3 before:absolute before:left-2 sm:before:left-2.5 before:top-2 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-300 before:via-blue-200 before:to-slate-200">
              {todayClasses.map((cls, idx) => {
                const isOngoing = cls.liveStatus === 'ONGOING';
                const isNextUp = cls.liveStatus === 'NEXT_UP';
                const isCompleted = cls.liveStatus === 'COMPLETED';
                const accent = getSubjectAccent(cls.code);

                return (
                  <div key={cls.id} className="relative group">
                    {/* Timeline Dot Marker */}
                    <div
                      className={`absolute -left-6 sm:-left-7 top-3.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 transition-transform ${
                        isOngoing
                          ? 'bg-[#1D4ED8] border-white ring-3 ring-blue-200 scale-110'
                          : isNextUp
                          ? `${accent.dotBg} border-white ring-2 ring-slate-200`
                          : isCompleted
                          ? 'bg-slate-300 border-white ring-1 ring-slate-200'
                          : `${accent.dotBg} border-white ring-1 ring-slate-200`
                      }`}
                    />

                    {/* Class Card */}
                    <div
                      className={`relative overflow-hidden rounded-xl border transition-all ${
                        isOngoing
                          ? 'bg-gradient-to-br from-blue-50/80 via-white to-sky-50/30 border-[#1D4ED8] shadow-[0_2px_8px_rgba(29,78,216,0.08)]'
                          : isNextUp
                          ? 'bg-white border-blue-200/90 shadow-2xs hover:shadow-xs'
                          : isCompleted
                          ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Top subtle accent gradient strip */}
                      <div
                        className={`h-1 w-full bg-gradient-to-r ${
                          isOngoing
                            ? 'from-[#1D4ED8] via-[#3B82F6] to-sky-400'
                            : isCompleted
                            ? 'from-slate-200 to-slate-200'
                            : accent.gradientStrip
                        }`}
                      />

                      <div className="p-3 sm:p-3.5 space-y-2">
                        {/* Header Row: Code, Units & Status Badge */}
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${
                                isCompleted
                                  ? 'bg-slate-100 text-slate-500 border-slate-200 line-through'
                                  : accent.codeBadge
                              }`}
                            >
                              {cls.code}
                            </span>
                            {cls.units && (
                              <span className="text-[11px] font-medium text-slate-500">
                                {cls.units.toFixed(1)} Units
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isOngoing ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Ongoing
                              </span>
                            ) : isNextUp ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] border border-blue-200">
                                Next Class
                              </span>
                            ) : isCompleted ? (
                              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                Completed
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subject Title */}
                        <h4
                          className={`font-heading text-xs font-bold m-0 leading-snug truncate ${
                            isCompleted ? 'text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {cls.name}
                        </h4>

                        {/* Meta Row: Time, Room, Instructor */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                          {/* Time badge */}
                          <div className="sm:col-span-5 flex items-center gap-1.5 font-mono font-medium text-slate-800">
                            <Clock size={12} className={isOngoing ? 'text-[#1D4ED8]' : 'text-slate-400'} />
                            <span>{cls.timeRangeFormatted}</span>
                          </div>

                          {/* Room venue */}
                          <div className="sm:col-span-3 flex items-center gap-1.5 text-slate-700">
                            <MapPin size={12} className={isOngoing ? 'text-[#1D4ED8]' : 'text-slate-400'} />
                            <span className="font-semibold text-slate-900 truncate">
                              {cls.room}
                            </span>
                          </div>

                          {/* Faculty */}
                          <div className="sm:col-span-4 flex items-center gap-1.5 text-slate-600 sm:justify-end">
                            <UserIcon size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{cls.instructor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          overallStatus === 'NO_CLASS_TODAY' && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
              <span>No classes scheduled on {manilaTime.weekday}s.</span>
              <Link
                href="/student/schedule"
                className="text-[#1D4ED8] hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>View Weekly Timetable</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
