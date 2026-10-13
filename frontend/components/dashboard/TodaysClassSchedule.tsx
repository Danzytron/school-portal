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

  // Clean, neutral loading skeleton
  if (loading) {
    return (
      <div className={`bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden ${className}`}>
        <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-4 w-36 bg-[#E5E7EB] rounded animate-pulse" />
            <div className="h-3 w-28 bg-[#E5E7EB]/70 rounded animate-pulse" />
          </div>
          <div className="h-5 w-24 bg-[#E5E7EB] rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-20 bg-[#F7F8FA] rounded-md border border-[#E5E7EB] animate-pulse" />
          <div className="h-16 bg-[#F7F8FA] rounded-md border border-[#E5E7EB] animate-pulse" />
        </div>
      </div>
    );
  }

  // Refined error state with retry
  if (error && schedules.length === 0) {
    return (
      <div className={`bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden ${className}`}>
        <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-sm font-semibold text-[#1F2937] m-0">
              Today&apos;s Class Schedule
            </h3>
            <p className="text-xs text-[#6B7280] m-0 mt-0.5">Your classes for today</p>
          </div>
          <span className="text-xs font-mono text-[#6B7280]">
            {manilaTime.formattedShortDate}
          </span>
        </div>
        <div className="p-6 text-center space-y-3">
          <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={16} />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-[#1F2937] m-0">
              Failed to load schedule
            </h4>
            <p className="text-xs text-[#6B7280] m-0">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchStudentSchedule(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1F2937] bg-white border border-[#E5E7EB] hover:bg-[#F7F8FA] rounded-md transition-colors cursor-pointer"
          >
            <RefreshCw size={12} className="text-[#6B7280]" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden font-sans ${className}`}>
      
      {/* ── 1. Section Header ── */}
      <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-sm font-semibold text-[#1F2937] tracking-tight m-0">
            Today&apos;s Class Schedule
          </h3>
          <p className="text-xs text-[#6B7280] m-0 mt-0.5 font-normal">
            Your classes for today
          </p>
        </div>

        {/* Small subtle date and live time badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#315E8A] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-md shadow-2xs">
            <Clock size={12} className="text-[#315E8A]" />
            <span className="font-mono tabular-nums">{manilaTime.formattedTime}</span>
          </span>
          <span className="text-xs text-[#6B7280] font-medium hidden sm:inline-block">
            {manilaTime.formattedShortDate}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">

        {/* ── CASE 5: No Classes Scheduled At All ── */}
        {overallStatus === 'NO_CLASSES_SCHEDULED' && (
          <div className="p-5 rounded-md bg-[#F7F8FA] border border-[#E5E7EB] text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] text-[#6B7280] flex items-center justify-center mx-auto">
              <BookOpen size={14} />
            </div>
            <h4 className="text-xs font-semibold text-[#1F2937] m-0">
              No classes are currently scheduled.
            </h4>
            <p className="text-xs text-[#6B7280] m-0 max-w-sm mx-auto leading-relaxed">
              There are no enrolled class sessions found in your timetable for this term.
            </p>
          </div>
        )}

        {/* ── CASE 1: Current Ongoing Class (Thin Blue Left Border + Muted Background) ── */}
        {overallStatus === 'ONGOING' && currentClass && (
          <div className="space-y-3">
            {ongoingClasses.map((activeCls) => (
              <div
                key={activeCls.id}
                className="bg-[#F0F5FA] border border-[#E5E7EB] border-l-4 border-l-[#315E8A] rounded-md p-3.5 space-y-2.5 transition-colors"
              >
                {/* Header row: Status Indicator + Remaining Time */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#27815B]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#27815B]">
                      Ongoing
                    </span>
                    <span className="text-xs text-[#6B7280]">• Class in Progress</span>
                  </div>

                  {activeCls.remainingText && (
                    <span className="text-xs font-medium text-[#315E8A] font-mono tabular-nums">
                      {activeCls.remainingText}
                    </span>
                  )}
                </div>

                {/* Subject Code & Name */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#315E8A] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded">
                      {activeCls.code}
                    </span>
                    {activeCls.units && (
                      <span className="text-[11px] text-[#6B7280]">
                        {activeCls.units.toFixed(1)} Units
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading text-sm font-semibold text-[#1F2937] m-0 mt-1 leading-snug">
                    {activeCls.name}
                  </h4>
                </div>

                {/* Meta Row: Time, Room, Instructor */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB]/80 text-xs text-[#6B7280]">
                  <div className="flex items-center gap-1.5 font-mono text-[#1F2937]">
                    <Clock size={13} className="text-[#315E8A] shrink-0" />
                    <span>{activeCls.timeRangeFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1F2937]">
                    <MapPin size={13} className="text-[#6B7280] shrink-0" />
                    <span className="font-medium truncate">{activeCls.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserIcon size={13} className="text-[#6B7280] shrink-0" />
                    <span className="truncate">{activeCls.instructor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CASE 2 & CASE 4: No Class Ongoing Right Now (Subtle Neutral Card) ── */}
        {(overallStatus === 'UPCOMING_TODAY' || overallStatus === 'NO_CLASS_TODAY') && (
          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-md p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-white border border-[#E5E7EB] text-[#6B7280] flex items-center justify-center shrink-0 mt-0.5">
              <Coffee size={15} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-[#1F2937] m-0">
                  No class at this time.
                </h4>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#6B7280] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded">
                  Free Period
                </span>
              </div>
              <p className="text-xs text-[#6B7280] m-0 leading-relaxed">
                You don&apos;t have any ongoing classes right now. Enjoy your free time!
              </p>
            </div>
          </div>
        )}

        {/* ── CASE 3: Done for the Day (Subtle Neutral Card) ── */}
        {overallStatus === 'DONE_FOR_TODAY' && (
          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-md p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-white border border-[#E5E7EB] text-[#27815B] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={16} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-[#1F2937] m-0">
                  No More Classes Today
                </h4>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#27815B] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded">
                  Completed
                </span>
              </div>
              <p className="text-xs text-[#6B7280] m-0 leading-relaxed">
                You&apos;re done with your classes for today! No class at this time.
              </p>
            </div>
          </div>
        )}

        {/* ── Schedule Conflict Notification (Clean alert banner) ── */}
        {conflictsToday.length > 0 && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] rounded-md p-3 flex items-start gap-2.5 text-xs">
            <AlertCircle size={15} className="text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Schedule Note: </span>
              {conflictsToday.map((c, i) => (
                <span key={i}>
                  {c.classA.code} and {c.classB.code} share the same slot ({c.overlapWindow})
                  {i < conflictsToday.length - 1 ? '; ' : '.'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Next Class Spotlight (Clean White Card with Subtle Border & Soft Shadow) ── */}
        {nextScheduledClass && (
          <div className="bg-white border border-[#E5E7EB] rounded-md p-3.5 space-y-2.5 shadow-2xs hover:border-[#D1D5DB] transition-colors">
            {/* Spotlight Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-[#315E8A] bg-[#F0F5FA] border border-[#E5E7EB] px-2 py-0.5 rounded">
                {nextScheduledClass.headlineLabel}
              </span>
              <span className="text-xs text-[#6B7280] font-medium">
                {nextScheduledClass.targetDateFormatted}
              </span>
            </div>

            {nextScheduledClass.isTomorrow && (
              <p className="text-xs font-medium text-[#1F2937] bg-[#F7F8FA] border border-[#E5E7EB] px-2.5 py-1 rounded m-0">
                Your next class is tomorrow.
              </p>
            )}

            {/* Subject details */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[#1F2937]">
                  {nextScheduledClass.occurrence.code}
                </span>
                <span className="text-xs font-medium text-[#315E8A] font-mono tabular-nums">
                  {nextScheduledClass.isToday && evaluation.nextClassToday?.startsInText
                    ? evaluation.nextClassToday.startsInText
                    : nextScheduledClass.isTomorrow
                    ? `Tomorrow at ${nextScheduledClass.occurrence.startTimeFormatted}`
                    : `${nextScheduledClass.targetDayName} at ${nextScheduledClass.occurrence.startTimeFormatted}`}
                </span>
              </div>
              <h4 className="font-heading text-xs font-semibold text-[#1F2937] m-0 mt-1 leading-snug">
                {nextScheduledClass.occurrence.name}
              </h4>
            </div>

            {/* Meta: Time, Room, Instructor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
              <div className="flex items-center gap-1.5 font-mono text-[#1F2937]">
                <Clock size={12} className="text-[#6B7280] shrink-0" />
                <span>{nextScheduledClass.occurrence.timeRangeFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#1F2937]">
                <MapPin size={12} className="text-[#6B7280] shrink-0" />
                <span className="font-medium truncate">{nextScheduledClass.occurrence.room}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserIcon size={12} className="text-[#6B7280] shrink-0" />
                <span className="truncate">{nextScheduledClass.occurrence.instructor}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Chronological List of Today's Classes (Neutral White Cards) ── */}
        {todayClasses.length > 0 ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-[#6B7280] px-0.5">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-[#1F2937]">
                {manilaTime.weekday} Classes ({todayClasses.length})
              </span>
              <Link
                href="/student/schedule"
                className="text-[#315E8A] hover:underline font-medium inline-flex items-center gap-0.5 text-xs"
              >
                <span>Full Timetable</span>
                <ChevronRight size={13} />
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
                    className={`p-3 rounded-md border transition-all ${
                      isOngoing
                        ? 'bg-[#F0F5FA] border-[#E5E7EB] border-l-4 border-l-[#315E8A] shadow-2xs'
                        : isNextUp
                        ? 'bg-white border-[#E5E7EB] border-l-2 border-l-[#315E8A]'
                        : isCompleted
                        ? 'bg-[#F7F8FA] border-[#E5E7EB] opacity-75'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                  >
                    {/* Header Row: Subject Code + Status Label */}
                    <div className="flex items-center justify-between text-xs mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`font-mono font-semibold ${
                            isCompleted ? 'text-[#6B7280] line-through' : 'text-[#315E8A]'
                          }`}
                        >
                          {cls.code}
                        </span>
                        {cls.units && (
                          <span className="text-[11px] text-[#6B7280]">
                            {cls.units.toFixed(1)} Units
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                          isOngoing
                            ? 'bg-emerald-50 text-[#27815B] border border-emerald-200'
                            : isNextUp
                            ? 'bg-[#F0F5FA] text-[#315E8A] border border-[#E5E7EB]'
                            : isCompleted
                            ? 'bg-[#E5E7EB] text-[#6B7280]'
                            : 'bg-[#F7F8FA] text-[#6B7280] border border-[#E5E7EB]'
                        }`}
                      >
                        {isOngoing ? 'Ongoing' : cls.statusLabel}
                      </span>
                    </div>

                    {/* Subject Title */}
                    <h4
                      className={`font-heading text-xs font-semibold m-0 truncate ${
                        isCompleted ? 'text-[#6B7280]' : 'text-[#1F2937]'
                      }`}
                    >
                      {cls.name}
                    </h4>

                    {/* Meta Row: Time, Room, Faculty */}
                    <div className="text-xs text-[#6B7280] flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#E5E7EB]/60 mt-1.5">
                      <div className="flex items-center gap-1.5 font-mono text-[#1F2937]">
                        <Clock size={11} className="text-[#6B7280]" />
                        <span>{cls.timeRangeFormatted}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <MapPin size={11} />
                        <span className="font-medium text-[#1F2937]">{cls.room}</span>
                        <span>•</span>
                        <UserIcon size={11} />
                        <span className="truncate">{cls.instructor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          overallStatus === 'NO_CLASS_TODAY' && (
            <div className="flex items-center justify-between pt-2 text-xs text-[#6B7280] border-t border-[#E5E7EB]">
              <span>No classes scheduled on {manilaTime.weekday}s.</span>
              <Link
                href="/student/schedule"
                className="text-[#315E8A] hover:underline font-medium inline-flex items-center gap-0.5"
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
