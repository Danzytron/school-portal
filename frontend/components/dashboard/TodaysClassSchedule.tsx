'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Sparkles,
  BookOpen,
  Radio,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  DEFAULT_STUDENT_WEEKLY_SCHEDULES,
  RawScheduleEntry,
  evaluateStudentSchedule,
  isLegacySeedSchedule,
} from '@/lib/schedule/scheduleEngine';

interface TodaysClassScheduleProps {
  initialSchedules?: RawScheduleEntry[];
  className?: string;
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
        // Use the student's verified CEC BSIT 3-A semester schedule
        setSchedules(DEFAULT_STUDENT_WEEKLY_SCHEDULES);
      }
    } catch (err: any) {
      // If we have no saved schedules at all, surface the error state with Retry
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
  // Automatically handles class start/end transitions, countdown updates, and midnight date rollovers
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

  // Loading Skeleton
  if (loading) {
    return (
      <div className={`panel ${className}`}>
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#1D4ED8]" />
            <span>Today&apos;s Class Schedule</span>
          </div>
          <span className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse border border-slate-200/60" />
          <div className="h-16 bg-slate-50 rounded-lg animate-pulse border border-slate-200/60" />
          <div className="h-16 bg-slate-50 rounded-lg animate-pulse border border-slate-200/60" />
        </div>
      </div>
    );
  }

  // Error State with Retry Button
  if (error && schedules.length === 0) {
    return (
      <div className={`panel ${className}`}>
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#1D4ED8]" />
            <span>Today&apos;s Class Schedule</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {manilaTime.formattedShortDate}
          </span>
        </div>
        <div className="p-6 text-center space-y-3 font-sans">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-xs text-slate-900 m-0">
              Failed to Load Schedule
            </h4>
            <p className="text-[11px] text-slate-500 m-0">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchStudentSchedule(false)}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`panel ${className}`}>
      {/* Header with Live Manila Date & Time */}
      <div className="panel-heading">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-[#1D4ED8]" />
          <span>Today&apos;s Class Schedule</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {manilaTime.formattedTime} PHT
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {manilaTime.formattedShortDate}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 font-sans">
        {/* ── CASE 5: No Classes Scheduled At All ── */}
        {overallStatus === 'NO_CLASSES_SCHEDULED' && (
          <div className="p-5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
              <BookOpen size={16} />
            </div>
            <h4 className="font-heading font-bold text-xs text-slate-900 m-0">
              No classes are currently scheduled.
            </h4>
            <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
              There are no enrolled class sessions found in your timetable for this term.
            </p>
          </div>
        )}

        {/* ── CASE 1: Ongoing Class Right Now ── */}
        {overallStatus === 'ONGOING' && currentClass && (
          <div className="space-y-2.5">
            {ongoingClasses.map((activeCls) => (
              <div
                key={activeCls.id}
                className="p-3.5 rounded-lg bg-blue-50/90 border-2 border-[#1D4ED8]/80 shadow-[0_2px_8px_rgba(29,78,216,0.08)] space-y-2 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Radio size={13} className="text-[#1D4ED8] animate-pulse" />
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#1E3A8A]">
                      Class in Progress
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-[#1D4ED8] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    ONGOING
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#1D4ED8] bg-white/90 border border-blue-200 px-1.5 py-0.5 rounded">
                      {activeCls.code}
                    </span>
                    {activeCls.remainingText && (
                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded">
                        {activeCls.remainingText}
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 m-0 mt-1.5 leading-snug">
                    {activeCls.name}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-700 border-t border-blue-200/60">
                  <div className="flex items-center gap-1.5">
                    <UserIcon size={12} className="text-[#1D4ED8] shrink-0" />
                    <span className="truncate font-medium">{activeCls.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#1D4ED8] shrink-0" />
                    <span className="truncate font-semibold text-slate-900">
                      {activeCls.room}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <Clock size={12} className="text-[#1D4ED8] shrink-0" />
                    <span className="font-mono font-medium">
                      {activeCls.timeRangeFormatted}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CASE 2 & CASE 4: No Class Ongoing Right Now (Free Time Banner) ── */}
        {(overallStatus === 'UPCOMING_TODAY' || overallStatus === 'NO_CLASS_TODAY') && (
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/90 flex items-start gap-3">
            <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 mt-0.5">
              <Sparkles size={15} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-bold text-xs text-slate-900 m-0">
                  No class at this time.
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Free Time
                </span>
              </div>
              <p className="text-[11px] text-slate-600 m-0 leading-relaxed">
                You don&apos;t have any ongoing classes right now. Enjoy your free time!
              </p>
            </div>
          </div>
        )}

        {/* ── CASE 3: All Classes for Today Are Completed ── */}
        {overallStatus === 'DONE_FOR_TODAY' && (
          <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
            <div className="p-2 rounded-md bg-emerald-100/80 border border-emerald-200 text-emerald-700 shrink-0 mt-0.5">
              <CheckCircle2 size={15} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-bold text-xs text-slate-900 m-0">
                  No More Classes Today
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white text-emerald-700 border border-emerald-200">
                  No class at this time.
                </span>
              </div>
              <p className="text-[11px] text-slate-600 m-0 leading-relaxed">
                You&apos;re done with your classes for today! You don&apos;t have any ongoing classes right now. Enjoy your free time!
              </p>
            </div>
          </div>
        )}

        {/* ── Overlapping Schedule Conflict Warning (if any exist today) ── */}
        {conflictsToday.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-[11px]">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Schedule Conflict Detected: </span>
              {conflictsToday.map((c, i) => (
                <span key={i}>
                  {c.classA.code} and {c.classB.code} overlap ({c.overlapWindow})
                  {i < conflictsToday.length - 1 ? '; ' : '.'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Next Scheduled Class Spotlight (Upcoming Today, Tomorrow, or Next Scheduled Day) ── */}
        {nextScheduledClass && (
          <div className="p-3.5 rounded-lg bg-white border border-blue-200/90 shadow-[0_1px_3px_rgba(29,78,216,0.05)] space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {nextScheduledClass.headlineLabel}
              </span>
              <span className="text-[11px] font-medium text-slate-600">
                {nextScheduledClass.targetDateFormatted}
              </span>
            </div>

            {nextScheduledClass.isTomorrow && (
              <p className="text-[11px] font-semibold text-[#1E3A8A] bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded m-0">
                Your next class is tomorrow.
              </p>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#1D4ED8]">
                  {nextScheduledClass.occurrence.code}
                </span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded">
                  {nextScheduledClass.isToday && evaluation.nextClassToday?.startsInText
                    ? evaluation.nextClassToday.startsInText
                    : nextScheduledClass.isTomorrow
                    ? `Tomorrow • ${nextScheduledClass.occurrence.startTimeFormatted}`
                    : `${nextScheduledClass.targetDayName} • ${nextScheduledClass.occurrence.startTimeFormatted}`}
                </span>
              </div>
              <h4 className="font-heading font-bold text-xs text-slate-900 m-0 mt-1">
                {nextScheduledClass.occurrence.name}
              </h4>
            </div>

            <div className="text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <UserIcon size={11} className="text-slate-400 shrink-0" />
                <span className="truncate">{nextScheduledClass.occurrence.instructor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800 truncate">
                  {nextScheduledClass.occurrence.room}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <Clock size={11} className="text-slate-400 shrink-0" />
                <span className="font-mono">
                  {nextScheduledClass.occurrence.timeRangeFormatted}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 m-0 pt-0.5 italic">
              {nextScheduledClass.countdownText}
            </p>
          </div>
        )}

        {/* ── Full List of Today's Classes (When Today Has Classes) ── */}
        {todayClasses.length > 0 ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {manilaTime.weekday} Timetable ({todayClasses.length}{' '}
                {todayClasses.length === 1 ? 'Class' : 'Classes'})
              </span>
              <Link
                href="/student/schedule"
                className="text-[#1D4ED8] hover:underline font-semibold inline-flex items-center gap-0.5 text-[11px]"
              >
                <span>Full Week</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            <div className="space-y-2">
              {todayClasses.map((cls) => {
                const isOngoing = cls.liveStatus === 'ONGOING';
                const isNextUp = cls.liveStatus === 'NEXT_UP';
                const isCompleted = cls.liveStatus === 'COMPLETED';

                return (
                  <div
                    key={cls.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isOngoing
                        ? 'bg-blue-50/70 border-[#1D4ED8] text-slate-900 shadow-2xs'
                        : isNextUp
                        ? 'bg-amber-50/40 border-amber-200 text-slate-900'
                        : isCompleted
                        ? 'bg-slate-50/70 border-slate-200/70 text-slate-500 opacity-80'
                        : 'bg-white border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`font-mono font-bold ${
                            isCompleted ? 'text-slate-500 line-through' : 'text-[#1D4ED8]'
                          }`}
                        >
                          {cls.code}
                        </span>
                        {cls.hasConflict && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Conflict
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                          isOngoing
                            ? 'bg-[#1D4ED8] text-white'
                            : isNextUp
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isCompleted
                            ? 'bg-slate-200/70 text-slate-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cls.statusLabel}
                      </span>
                    </div>

                    <h4
                      className={`font-heading font-bold text-xs m-0 truncate ${
                        isCompleted ? 'text-slate-600' : 'text-slate-900'
                      }`}
                    >
                      {cls.name}
                    </h4>

                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 pt-1.5">
                      <span className="font-mono">{cls.timeRangeFormatted}</span>
                      <span className="font-medium text-slate-800">
                        {cls.instructor} • {cls.room}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          overallStatus === 'NO_CLASS_TODAY' && (
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
              <span>No classes scheduled on {manilaTime.weekday}s.</span>
              <Link
                href="/student/schedule"
                className="text-[#1D4ED8] hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>View Weekly Timetable</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
