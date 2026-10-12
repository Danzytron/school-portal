/**
 * Real-Time Schedule Engine for Cebu Eastern College (CEC) School Portal
 *
 * Uses the Philippine timezone (Asia/Manila) to evaluate a student's real saved
 * weekly class schedule and compute:
 * - Current ongoing class(es) with live remaining time
 * - Next upcoming class later today with live countdown
 * - Next scheduled class across the 7-day weekly cycle (e.g., tomorrow or next active day)
 * - Full chronological list of today's classes with individual live statuses
 * - Overlapping class conflict detection
 */

export type WeekdayName =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export const WEEKDAYS: WeekdayName[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export interface RawScheduleEntry {
  id?: number | string;
  day_of_week?: string | string[];
  days?: string | string[];
  start_time?: string;
  end_time?: string;
  time?: string;
  code?: string;
  name?: string;
  instructor?: string;
  room?: string | { id?: number; name?: string };
  section?: string | { id?: number; name?: string };
  subject?: {
    id?: number;
    code?: string;
    name?: string;
    units?: number;
  };
  teacher?: {
    id?: number;
    user?: {
      name?: string;
    };
    name?: string;
  };
}

export interface NormalizedScheduleOccurrence {
  id: string;
  sourceId: number | string;
  code: string;
  name: string;
  instructor: string;
  room: string;
  section: string;
  units?: number;
  dayOfWeek: WeekdayName;
  dayIndex: number; // 0 = Sunday ... 6 = Saturday
  startMinutes: number; // minutes from 00:00 (0 - 1439)
  endMinutes: number; // minutes from 00:00 (0 - 1440)
  startTimeFormatted: string; // e.g., "07:30 AM"
  endTimeFormatted: string; // e.g., "08:30 AM"
  timeRangeFormatted: string; // e.g., "07:30 AM – 08:30 AM"
}

export type ClassItemLiveStatus = 'COMPLETED' | 'ONGOING' | 'NEXT_UP' | 'UPCOMING';

export interface TodayClassOccurrence extends NormalizedScheduleOccurrence {
  liveStatus: ClassItemLiveStatus;
  statusLabel: string; // "Completed", "ONGOING", "Next Class", "Upcoming"
  remainingMinutes?: number; // If ONGOING, minutes left until end
  remainingText?: string; // e.g., "Ends in 42 mins"
  startsInMinutes?: number; // If NEXT_UP / UPCOMING, minutes until start
  startsInText?: string; // e.g., "Starts in 45 minutes"
  hasConflict?: boolean;
  conflictsWith?: string[]; // Subject codes it overlaps with
}

export interface NextScheduledClassInfo {
  occurrence: NormalizedScheduleOccurrence;
  daysAhead: number; // 0 = today, 1 = tomorrow, 2..7 = upcoming day
  isToday: boolean;
  isTomorrow: boolean;
  targetDateFormatted: string; // e.g., "Tomorrow, Tue, Oct 13" or "Monday, Oct 19"
  targetDayName: WeekdayName;
  startsInMinutes?: number; // Total minutes from now until start
  countdownText: string; // e.g., "Your next class starts in 45 minutes." or "Your next class is tomorrow."
  headlineLabel: string; // e.g., "Upcoming Class Today" | "Next Class: Tomorrow" | "Next Class: Monday"
}

export interface ScheduleConflict {
  dayOfWeek: WeekdayName;
  classA: NormalizedScheduleOccurrence;
  classB: NormalizedScheduleOccurrence;
  overlapWindow: string;
}

export type OverallScheduleStatus =
  | 'ONGOING' // Student is currently inside a scheduled class window
  | 'UPCOMING_TODAY' // No class right now, but another class starts later today
  | 'DONE_FOR_TODAY' // Today had classes, and all of them have finished
  | 'NO_CLASS_TODAY' // Today has zero classes scheduled (e.g., Sunday or free weekday), but student has classes on other days
  | 'NO_CLASSES_SCHEDULED'; // Student has no classes scheduled on any day at all

export interface ManilaTimeParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  weekday: WeekdayName;
  weekdayIndex: number; // 0-6
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  currentMinutes: number; // hour * 60 + minute
  formattedDate: string; // e.g., "Monday, Oct 12, 2026"
  formattedShortDate: string; // e.g., "Mon, Oct 12"
  formattedTime: string; // e.g., "08:15 AM"
  isoDateKey: string; // e.g., "2026-10-12"
}

export interface ScheduleEvaluationResult {
  manilaTime: ManilaTimeParts;
  overallStatus: OverallScheduleStatus;
  statusHeadline: string;
  statusSubtext: string;
  ongoingClasses: TodayClassOccurrence[];
  currentClass: TodayClassOccurrence | null;
  nextClassToday: TodayClassOccurrence | null;
  nextScheduledClass: NextScheduledClassInfo | null;
  todayClasses: TodayClassOccurrence[];
  conflictsToday: ScheduleConflict[];
  totalWeeklyOccurrences: number;
}

/**
 * Authoritative CEC BSIT 3-A Weekly Class Schedule (1st Semester A.Y. 2026-2027)
 * Shared across the Student Schedule page, Student Dashboard, and Lumi AI Context.
 */
export const DEFAULT_STUDENT_WEEKLY_SCHEDULES: RawScheduleEntry[] = [
  // Monday and Wednesday
  { id: 1, day_of_week: 'Monday', start_time: '07:30:00', end_time: '08:30:00', subject: { id: 12, code: 'IT SIA31', name: 'System Integration and Architecture 2 (Lecture)', units: 2 }, room: { id: 10, name: 'Room OL 110' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 2, day_of_week: 'Wednesday', start_time: '07:30:00', end_time: '08:30:00', subject: { id: 12, code: 'IT SIA31', name: 'System Integration and Architecture 2 (Lecture)', units: 2 }, room: { id: 10, name: 'Room OL 110' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 3, day_of_week: 'Monday', start_time: '08:30:00', end_time: '09:30:00', subject: { id: 6, code: 'IT EVD31', name: 'Event Driven Programming (Lecture)', units: 2 }, room: { id: 6, name: 'Room OL 107' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 4, day_of_week: 'Wednesday', start_time: '08:30:00', end_time: '09:30:00', subject: { id: 6, code: 'IT EVD31', name: 'Event Driven Programming (Lecture)', units: 2 }, room: { id: 6, name: 'Room OL 107' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 5, day_of_week: 'Monday', start_time: '09:30:00', end_time: '10:30:00', subject: { id: 8, code: 'IT IAS31', name: 'Information Assurance and Security 1 (Lecture)', units: 2 }, room: { id: 7, name: 'Room OL 108' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 6, day_of_week: 'Wednesday', start_time: '09:30:00', end_time: '10:30:00', subject: { id: 8, code: 'IT IAS31', name: 'Information Assurance and Security 1 (Lecture)', units: 2 }, room: { id: 7, name: 'Room OL 108' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 7, day_of_week: 'Monday', start_time: '10:30:00', end_time: '11:30:00', subject: { id: 10, code: 'IT NET31', name: 'Networking 1 (Lecture)', units: 2 }, room: { id: 8, name: 'Room OL 109' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 8, day_of_week: 'Wednesday', start_time: '10:30:00', end_time: '11:30:00', subject: { id: 10, code: 'IT NET31', name: 'Networking 1 (Lecture)', units: 2 }, room: { id: 8, name: 'Room OL 109' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 9, day_of_week: 'Monday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 1, code: 'FREE ELEC 1', name: 'Free Elective 1 (Mobile App Development)', units: 3 }, room: { id: 1, name: 'Room H 204' }, teacher: { id: 1, user: { name: 'Sir Vincent John Cababan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 10, day_of_week: 'Wednesday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 1, code: 'FREE ELEC 1', name: 'Free Elective 1 (Mobile App Development)', units: 3 }, room: { id: 1, name: 'Room H 204' }, teacher: { id: 1, user: { name: 'Sir Vincent John Cababan' } }, section: { id: 1, name: 'BSIT 3-A' } },

  // Tuesday and Thursday
  { id: 11, day_of_week: 'Tuesday', start_time: '15:00:00', end_time: '16:30:00', subject: { id: 11, code: 'IT NET31 LAB', name: 'Networking 1 (Laboratory)', units: 1 }, room: { id: 9, name: 'CL 3' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 12, day_of_week: 'Thursday', start_time: '15:00:00', end_time: '16:30:00', subject: { id: 11, code: 'IT NET31 LAB', name: 'Networking 1 (Laboratory)', units: 1 }, room: { id: 9, name: 'CL 3' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 13, day_of_week: 'Tuesday', start_time: '17:30:00', end_time: '18:30:00', subject: { id: 3, code: 'GE ELEC 6', name: 'Philippine Popular Culture', units: 3 }, room: { id: 3, name: 'Room H 301' }, teacher: { id: 3, user: { name: 'Ms. Krystel Hurboda' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 14, day_of_week: 'Thursday', start_time: '17:30:00', end_time: '18:30:00', subject: { id: 3, code: 'GE ELEC 6', name: 'Philippine Popular Culture', units: 3 }, room: { id: 3, name: 'Room H 301' }, teacher: { id: 3, user: { name: 'Ms. Krystel Hurboda' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 15, day_of_week: 'Saturday', start_time: '17:30:00', end_time: '18:30:00', subject: { id: 3, code: 'GE ELEC 6', name: 'Philippine Popular Culture', units: 3 }, room: { id: 3, name: 'Room H 301' }, teacher: { id: 3, user: { name: 'Ms. Krystel Hurboda' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 16, day_of_week: 'Tuesday', start_time: '18:30:00', end_time: '19:30:00', subject: { id: 2, code: 'GE ELEC 5', name: 'Ang Panitikan ng Pilipinas', units: 3 }, room: { id: 2, name: 'Room K 104' }, teacher: { id: 2, user: { name: 'Ms. Lindy Enaldo' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 17, day_of_week: 'Thursday', start_time: '18:30:00', end_time: '19:30:00', subject: { id: 2, code: 'GE ELEC 5', name: 'Ang Panitikan ng Pilipinas', units: 3 }, room: { id: 2, name: 'Room K 104' }, teacher: { id: 2, user: { name: 'Ms. Lindy Enaldo' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 18, day_of_week: 'Saturday', start_time: '18:30:00', end_time: '19:30:00', subject: { id: 2, code: 'GE ELEC 5', name: 'Ang Panitikan ng Pilipinas', units: 3 }, room: { id: 2, name: 'Room K 104' }, teacher: { id: 2, user: { name: 'Ms. Lindy Enaldo' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 19, day_of_week: 'Tuesday', start_time: '19:30:00', end_time: '21:00:00', subject: { id: 14, code: 'IT SP131', name: 'Social and Professional Issues 1', units: 3 }, room: { id: 11, name: 'Room A 202' }, teacher: { id: 9, user: { name: 'Sir Arjay Alangcas' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 20, day_of_week: 'Thursday', start_time: '19:30:00', end_time: '21:00:00', subject: { id: 14, code: 'IT SP131', name: 'Social and Professional Issues 1', units: 3 }, room: { id: 11, name: 'Room A 202' }, teacher: { id: 9, user: { name: 'Sir Arjay Alangcas' } }, section: { id: 1, name: 'BSIT 3-A' } },

  // Friday and Saturday
  { id: 21, day_of_week: 'Friday', start_time: '07:30:00', end_time: '09:00:00', subject: { id: 9, code: 'IT IAS31 LAB', name: 'Information Assurance and Security 1 (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 22, day_of_week: 'Saturday', start_time: '07:30:00', end_time: '09:00:00', subject: { id: 9, code: 'IT IAS31 LAB', name: 'Information Assurance and Security 1 (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 23, day_of_week: 'Friday', start_time: '09:00:00', end_time: '10:30:00', subject: { id: 7, code: 'IT EVD31 LAB', name: 'Event Driven Programming (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 24, day_of_week: 'Saturday', start_time: '09:00:00', end_time: '10:30:00', subject: { id: 7, code: 'IT EVD31 LAB', name: 'Event Driven Programming (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 25, day_of_week: 'Friday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 13, code: 'IT SIA31 LAB', name: 'System Integration and Architecture 2 (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 26, day_of_week: 'Saturday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 13, code: 'IT SIA31 LAB', name: 'System Integration and Architecture 2 (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 27, day_of_week: 'Friday', start_time: '13:30:00', end_time: '15:00:00', subject: { id: 5, code: 'IT ELEC 1 LAB', name: 'Elective 1 (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 28, day_of_week: 'Saturday', start_time: '13:30:00', end_time: '15:00:00', subject: { id: 5, code: 'IT ELEC 1 LAB', name: 'Elective 1 (Laboratory)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 29, day_of_week: 'Friday', start_time: '15:00:00', end_time: '16:00:00', subject: { id: 4, code: 'IT ELEC 1', name: 'Elective 1 (Lecture)', units: 2 }, room: { id: 4, name: 'Room OL 111' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 30, day_of_week: 'Saturday', start_time: '15:00:00', end_time: '16:00:00', subject: { id: 4, code: 'IT ELEC 1', name: 'Elective 1 (Lecture)', units: 2 }, room: { id: 4, name: 'Room OL 111' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
];

const LEGACY_SEED_CODES = new Set([
  'IT101',
  'IT102',
  'IT103',
  'GE101',
  'GE102',
  'PE101',
  'NSTP1',
]);

/**
 * Returns true if the API payload is the un-updated legacy BSIT-1A database seeder
 * (IT101, IT102, IT103, GE101, GE102, PE101, NSTP1) rather than the student's BSIT 3-A schedule.
 */
export function isLegacySeedSchedule(list: any[]): boolean {
  if (!Array.isArray(list) || list.length === 0) return true;
  return list.every((item) => {
    const code = item?.subject?.code || item?.code || '';
    const section =
      typeof item?.section === 'string'
        ? item.section
        : item?.section?.name || '';
    return LEGACY_SEED_CODES.has(code) || section === 'BSIT-1A';
  });
}

/**
 * Extracts accurate date and time components in the Asia/Manila timezone.
 */
export function getManilaTimeParts(now: Date = new Date()): ManilaTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  const year = parseInt(map.year || '2026', 10);
  const month = parseInt(map.month || '1', 10);
  const day = parseInt(map.day || '1', 10);
  let hour = parseInt(map.hour || '0', 10);
  if (hour === 24) hour = 0; // Intl hour12:false sometimes emits 24 at midnight
  const minute = parseInt(map.minute || '0', 10);
  const second = parseInt(map.second || '0', 10);

  const weekdayRaw = (map.weekday || 'Monday') as WeekdayName;
  const weekdayIndex = Math.max(0, WEEKDAYS.indexOf(weekdayRaw));
  const weekday = WEEKDAYS[weekdayIndex];

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  const formattedShortDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now);

  const formattedTime = formatMinutesTo12Hour(hour * 60 + minute);
  const isoDateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    year,
    month,
    day,
    weekday,
    weekdayIndex,
    hour,
    minute,
    second,
    currentMinutes: hour * 60 + minute,
    formattedDate,
    formattedShortDate,
    formattedTime,
    isoDateKey,
  };
}

/**
 * Formats minutes since midnight (e.g. 450) into 12-hour string (e.g. "07:30 AM").
 */
export function formatMinutesTo12Hour(totalMinutes: number): string {
  const clamped = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(clamped / 60);
  const mins = clamped % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

/**
 * Parses a single time string ("07:30:00", "07:30 AM", "15:00", "3:00 PM") into minutes from midnight.
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim().toUpperCase();
  if (!cleaned) return null;

  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[4];

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
  } else {
    if (hours < 0 || hours > 23) return null;
  }

  return hours * 60 + minutes;
}

/**
 * Parses a combined time range string (e.g., "07:30 AM – 08:30 AM" or "10:30 - 12:00")
 */
export function parseTimeRangeToMinutes(rangeStr?: string): { start: number; end: number } | null {
  if (!rangeStr || typeof rangeStr !== 'string') return null;
  const parts = rangeStr.split(/\s*(?:–|—|-|to)\s*/i);
  if (parts.length !== 2) return null;

  const start = parseTimeToMinutes(parts[0]);
  const end = parseTimeToMinutes(parts[1]);
  if (start === null || end === null) return null;
  return { start, end };
}

/**
 * Parses any day or multi-day schedule expression into canonical WeekdayName values.
 * Supports:
 * - Full names: "Monday", "Wednesday"
 * - Multi-day strings: "Mon & Wed", "Monday and Wednesday", "Tuesday, Thursday, and Saturday"
 * - Shorthand codes: "MW", "MWF", "TTH", "TThS", "Sat", "Sun"
 * - Arrays of day strings: ["Monday", "Wednesday"]
 */
export function parseDaysOfWeek(input?: string | string[]): WeekdayName[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    const combined = new Set<WeekdayName>();
    for (const item of input) {
      for (const parsed of parseDaysOfWeek(item)) {
        combined.add(parsed);
      }
    }
    return Array.from(combined);
  }

  const raw = String(input).trim();
  if (!raw) return [];

  const result = new Set<WeekdayName>();
  const upper = raw.toUpperCase();

  // Check common compact academic shorthand tokens first when separated or exact
  if (upper === 'MW' || upper === 'M/W') return ['Monday', 'Wednesday'];
  if (upper === 'MWF' || upper === 'M/W/F') return ['Monday', 'Wednesday', 'Friday'];
  if (upper === 'TTH' || upper === 'T/TH' || upper === 'TU/TH') return ['Tuesday', 'Thursday'];
  if (upper === 'TTHS' || upper === 'T/TH/S') return ['Tuesday', 'Thursday', 'Saturday'];
  if (upper === 'FS' || upper === 'F/S') return ['Friday', 'Saturday'];
  if (upper === 'DAILY' || upper === 'MON-SAT') {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  // Split by common delimiters: comma, ampersand, slash, "and", whitespace
  const tokens = raw
    .split(/(?:,|&|\/|\band\b|\s)+/i)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    if (token === 'monday' || token === 'mon' || token === 'm') {
      result.add('Monday');
    } else if (token === 'tuesday' || token === 'tue' || token === 'tues' || token === 'tu' || token === 't') {
      result.add('Tuesday');
    } else if (token === 'wednesday' || token === 'wed' || token === 'w') {
      result.add('Wednesday');
    } else if (token === 'thursday' || token === 'thu' || token === 'thur' || token === 'thurs' || token === 'th' || token === 'r') {
      result.add('Thursday');
    } else if (token === 'friday' || token === 'fri' || token === 'f') {
      result.add('Friday');
    } else if (token === 'saturday' || token === 'sat' || token === 'sa' || token === 's') {
      result.add('Saturday');
    } else if (token === 'sunday' || token === 'sun' || token === 'su') {
      result.add('Sunday');
    } else if (token === 'mw') {
      result.add('Monday');
      result.add('Wednesday');
    } else if (token === 'mwf') {
      result.add('Monday');
      result.add('Wednesday');
      result.add('Friday');
    } else if (token === 'tth') {
      result.add('Tuesday');
      result.add('Thursday');
    } else if (token === 'tths') {
      result.add('Tuesday');
      result.add('Thursday');
      result.add('Saturday');
    }
  }

  return Array.from(result);
}

/**
 * Formats a duration in minutes into a human-friendly string:
 * e.g., 45 -> "45 minutes", 60 -> "1 hour", 75 -> "1 hour 15 minutes", 1 -> "1 minute"
 */
export function formatDurationMinutes(minutes: number): string {
  const safeMins = Math.max(1, Math.round(minutes));
  const hrs = Math.floor(safeMins / 60);
  const rem = safeMins % 60;

  if (hrs === 0) {
    return `${rem} ${rem === 1 ? 'minute' : 'minutes'}`;
  }
  const hrPart = `${hrs} ${hrs === 1 ? 'hour' : 'hours'}`;
  if (rem === 0) {
    return hrPart;
  }
  const minPart = `${rem} ${rem === 1 ? 'minute' : 'minutes'}`;
  return `${hrPart} ${minPart}`;
}

/**
 * Normalizes raw schedule records (from API or fallback store) into distinct per-day occurrences.
 */
export function normalizeScheduleEntries(entries: RawScheduleEntry[]): NormalizedScheduleOccurrence[] {
  if (!Array.isArray(entries)) return [];

  const occurrences: NormalizedScheduleOccurrence[] = [];

  entries.forEach((entry, idx) => {
    if (!entry) return;

    const days = parseDaysOfWeek(entry.day_of_week ?? entry.days);
    if (days.length === 0) return;

    let startMinutes = parseTimeToMinutes(entry.start_time);
    let endMinutes = parseTimeToMinutes(entry.end_time);

    if ((startMinutes === null || endMinutes === null) && entry.time) {
      const range = parseTimeRangeToMinutes(entry.time);
      if (range) {
        startMinutes = range.start;
        endMinutes = range.end;
      }
    }

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return;
    }

    const code = (entry.subject?.code || entry.code || 'SUBJECT').trim();
    const name = (entry.subject?.name || entry.name || 'Academic Class').trim();

    const rawRoom =
      typeof entry.room === 'string'
        ? entry.room
        : entry.room?.name || 'TBA';
    const room = rawRoom.trim() || 'TBA';

    const rawInstructor =
      entry.instructor ||
      entry.teacher?.user?.name ||
      entry.teacher?.name ||
      'Assigned Faculty';
    const instructor = rawInstructor.trim() || 'Assigned Faculty';

    const rawSection =
      typeof entry.section === 'string'
        ? entry.section
        : entry.section?.name || 'BSIT 3-A';

    const startTimeFormatted = formatMinutesTo12Hour(startMinutes);
    const endTimeFormatted = formatMinutesTo12Hour(endMinutes);
    const timeRangeFormatted = `${startTimeFormatted} – ${endTimeFormatted}`;
    const sourceId = entry.id ?? idx + 1;

    for (const dayOfWeek of days) {
      const dayIndex = WEEKDAYS.indexOf(dayOfWeek);
      occurrences.push({
        id: `${sourceId}-${dayOfWeek}-${startMinutes}`,
        sourceId,
        code,
        name,
        instructor,
        room,
        section: rawSection,
        units: entry.subject?.units,
        dayOfWeek,
        dayIndex,
        startMinutes,
        endMinutes,
        startTimeFormatted,
        endTimeFormatted,
        timeRangeFormatted,
      });
    }
  });

  // Deduplicate identical (code + dayOfWeek + startMinutes + endMinutes) occurrences
  const seen = new Set<string>();
  const unique: NormalizedScheduleOccurrence[] = [];
  for (const occ of occurrences) {
    const key = `${occ.dayOfWeek}:${occ.code}:${occ.startMinutes}:${occ.endMinutes}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(occ);
    }
  }

  return unique.sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
    return a.endMinutes - b.endMinutes;
  });
}

/**
 * Detects overlapping class conflicts within a single day's sorted classes.
 */
export function detectDayConflicts(dayClasses: NormalizedScheduleOccurrence[]): {
  conflicts: ScheduleConflict[];
  conflictMap: Map<string, string[]>;
} {
  const conflicts: ScheduleConflict[] = [];
  const conflictMap = new Map<string, string[]>();

  for (let i = 0; i < dayClasses.length; i++) {
    for (let j = i + 1; j < dayClasses.length; j++) {
      const a = dayClasses[i];
      const b = dayClasses[j];
      // Two intervals [startA, endA) and [startB, endB) overlap iff startA < endB && startB < endA
      if (a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes) {
        const overlapStart = Math.max(a.startMinutes, b.startMinutes);
        const overlapEnd = Math.min(a.endMinutes, b.endMinutes);
        conflicts.push({
          dayOfWeek: a.dayOfWeek,
          classA: a,
          classB: b,
          overlapWindow: `${formatMinutesTo12Hour(overlapStart)} – ${formatMinutesTo12Hour(overlapEnd)}`,
        });

        const listA = conflictMap.get(a.id) || [];
        if (!listA.includes(b.code)) listA.push(b.code);
        conflictMap.set(a.id, listA);

        const listB = conflictMap.get(b.id) || [];
        if (!listB.includes(a.code)) listB.push(a.code);
        conflictMap.set(b.id, listB);
      }
    }
  }

  return { conflicts, conflictMap };
}

/**
 * Helper to format a target future date (e.g. +1 day = Tomorrow, +2 days = Wednesday, Oct 14)
 */
function formatFutureManilaDate(now: Date, daysAhead: number): string {
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(futureDate);

  if (daysAhead === 0) return `Today (${formatted})`;
  if (daysAhead === 1) return `Tomorrow (${formatted})`;
  return formatted;
}

/**
 * Evaluates the student's complete class schedule at a given moment in Asia/Manila time.
 *
 * Rules:
 * - ONGOING: `currentMinutes >= startMinutes && currentMinutes < endMinutes`
 *   (A class that ends at 09:00 AM is NOT ongoing at 09:00 AM.)
 * - UPCOMING_TODAY: No class is ongoing right now, and there is at least one class today with `startMinutes > currentMinutes`.
 * - DONE_FOR_TODAY: Today had classes, and all of them have `endMinutes <= currentMinutes`.
 * - NO_CLASS_TODAY: Today has zero classes scheduled, but other days of the week have classes.
 * - NO_CLASSES_SCHEDULED: The student has zero classes across the entire week.
 */
export function evaluateStudentSchedule(
  rawEntries: RawScheduleEntry[],
  now: Date = new Date()
): ScheduleEvaluationResult {
  const manilaTime = getManilaTimeParts(now);
  const allOccurrences = normalizeScheduleEntries(rawEntries);

  if (allOccurrences.length === 0) {
    return {
      manilaTime,
      overallStatus: 'NO_CLASSES_SCHEDULED',
      statusHeadline: 'No classes are currently scheduled.',
      statusSubtext: 'There are no enrolled class sessions found in your timetable for this term.',
      ongoingClasses: [],
      currentClass: null,
      nextClassToday: null,
      nextScheduledClass: null,
      todayClasses: [],
      conflictsToday: [],
      totalWeeklyOccurrences: 0,
    };
  }

  const currentMinutes = manilaTime.currentMinutes;
  const rawTodayClasses = allOccurrences.filter(
    (occ) => occ.dayIndex === manilaTime.weekdayIndex
  );

  const { conflicts: conflictsToday, conflictMap } = detectDayConflicts(rawTodayClasses);

  // Determine which class is the very next upcoming class today (earliest startMinutes > currentMinutes)
  const upcomingTodaySorted = rawTodayClasses
    .filter((occ) => occ.startMinutes > currentMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const firstUpcomingTodayId = upcomingTodaySorted.length > 0 ? upcomingTodaySorted[0].id : null;

  const todayClasses: TodayClassOccurrence[] = rawTodayClasses.map((occ) => {
    const conflictsWith = conflictMap.get(occ.id);
    const hasConflict = Boolean(conflictsWith && conflictsWith.length > 0);

    // Ongoing check: currentTime >= startTime AND currentTime < endTime
    if (currentMinutes >= occ.startMinutes && currentMinutes < occ.endMinutes) {
      const remainingMinutes = occ.endMinutes - currentMinutes;
      return {
        ...occ,
        liveStatus: 'ONGOING',
        statusLabel: 'ONGOING',
        remainingMinutes,
        remainingText: `Ends in ${formatDurationMinutes(remainingMinutes)}`,
        hasConflict,
        conflictsWith,
      };
    }

    // Completed check: endTime <= currentTime
    if (occ.endMinutes <= currentMinutes) {
      return {
        ...occ,
        liveStatus: 'COMPLETED',
        statusLabel: 'Completed',
        hasConflict,
        conflictsWith,
      };
    }

    // Upcoming later today: startTime > currentTime
    const startsInMinutes = occ.startMinutes - currentMinutes;
    const isNextUp = occ.id === firstUpcomingTodayId;
    return {
      ...occ,
      liveStatus: isNextUp ? 'NEXT_UP' : 'UPCOMING',
      statusLabel: isNextUp ? 'Next Class' : 'Upcoming',
      startsInMinutes,
      startsInText: `Starts in ${formatDurationMinutes(startsInMinutes)}`,
      hasConflict,
      conflictsWith,
    };
  });

  const ongoingClasses = todayClasses.filter((c) => c.liveStatus === 'ONGOING');
  const currentClass = ongoingClasses.length > 0 ? ongoingClasses[0] : null;
  const nextClassToday =
    todayClasses.find((c) => c.liveStatus === 'NEXT_UP') ||
    todayClasses.find((c) => c.liveStatus === 'UPCOMING') ||
    null;

  // Search forward across the 7-day cycle for the next scheduled class if no more classes today
  let nextScheduledClass: NextScheduledClassInfo | null = null;

  if (nextClassToday) {
    const startsInMinutes = nextClassToday.startMinutes - currentMinutes;
    nextScheduledClass = {
      occurrence: nextClassToday,
      daysAhead: 0,
      isToday: true,
      isTomorrow: false,
      targetDateFormatted: formatFutureManilaDate(now, 0),
      targetDayName: manilaTime.weekday,
      startsInMinutes,
      countdownText: `Your next class starts in ${formatDurationMinutes(startsInMinutes)}.`,
      headlineLabel: 'Upcoming Class Today',
    };
  } else {
    // Look 1 to 7 days ahead
    for (let offset = 1; offset <= 7; offset++) {
      const targetDayIndex = (manilaTime.weekdayIndex + offset) % 7;
      const dayMatches = allOccurrences
        .filter((occ) => occ.dayIndex === targetDayIndex)
        .sort((a, b) => a.startMinutes - b.startMinutes);

      if (dayMatches.length > 0) {
        const earliest = dayMatches[0];
        const isTomorrow = offset === 1;
        const minutesLeftToday = 1440 - currentMinutes;
        const startsInMinutes = minutesLeftToday + (offset - 1) * 1440 + earliest.startMinutes;
        const targetDateFormatted = formatFutureManilaDate(now, offset);

        nextScheduledClass = {
          occurrence: earliest,
          daysAhead: offset,
          isToday: false,
          isTomorrow,
          targetDateFormatted,
          targetDayName: earliest.dayOfWeek,
          startsInMinutes,
          countdownText: isTomorrow
            ? `Your next class is tomorrow at ${earliest.startTimeFormatted}.`
            : `Your next class is on ${earliest.dayOfWeek} (${targetDateFormatted}) at ${earliest.startTimeFormatted}.`,
          headlineLabel: isTomorrow
            ? 'Next Class: Tomorrow'
            : `Next Class: ${earliest.dayOfWeek}`,
        };
        break;
      }
    }
  }

  // Compute overall status & messages
  if (currentClass) {
    return {
      manilaTime,
      overallStatus: 'ONGOING',
      statusHeadline: 'Class in Progress',
      statusSubtext:
        ongoingClasses.length > 1
          ? `You have ${ongoingClasses.length} overlapping classes in session right now.`
          : `${currentClass.code} is currently in session until ${currentClass.endTimeFormatted}.`,
      ongoingClasses,
      currentClass,
      nextClassToday,
      nextScheduledClass,
      todayClasses,
      conflictsToday,
      totalWeeklyOccurrences: allOccurrences.length,
    };
  }

  if (nextClassToday) {
    return {
      manilaTime,
      overallStatus: 'UPCOMING_TODAY',
      statusHeadline: 'No class at this time.',
      statusSubtext: "You don't have any ongoing classes right now. Enjoy your free time!",
      ongoingClasses: [],
      currentClass: null,
      nextClassToday,
      nextScheduledClass,
      todayClasses,
      conflictsToday,
      totalWeeklyOccurrences: allOccurrences.length,
    };
  }

  if (todayClasses.length > 0) {
    // Had classes today, and all of them are completed
    return {
      manilaTime,
      overallStatus: 'DONE_FOR_TODAY',
      statusHeadline: 'No More Classes Today',
      statusSubtext: "You're done with your classes for today! No class at this time.",
      ongoingClasses: [],
      currentClass: null,
      nextClassToday: null,
      nextScheduledClass,
      todayClasses,
      conflictsToday,
      totalWeeklyOccurrences: allOccurrences.length,
    };
  }

  // Zero classes scheduled for today's weekday, but classes exist on other days
  return {
    manilaTime,
    overallStatus: 'NO_CLASS_TODAY',
    statusHeadline: 'No class at this time.',
    statusSubtext: "You don't have any ongoing classes right now. Enjoy your free time!",
    ongoingClasses: [],
    currentClass: null,
    nextClassToday: null,
    nextScheduledClass,
    todayClasses: [],
    conflictsToday: [],
    totalWeeklyOccurrences: allOccurrences.length,
  };
}
