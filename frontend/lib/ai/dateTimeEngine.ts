/**
 * Deterministic Date & Time Engine for Lumi AI
 * Cebu Eastern College (CEC) UIS
 *
 * Provides accurate, dynamically computed date and time awareness
 * in the Asia/Manila (PHT, UTC+8) timezone, as well as support for
 * worldwide timezone queries and deterministic date arithmetic.
 */

export interface DateTimeContext {
  timeZone: string;
  isoString: string;
  fullDate: string; // e.g. "Saturday, October 10, 2026"
  dayOfWeek: string; // e.g. "Saturday"
  timeString: string; // e.g. "3:30 PM (PHT / UTC+8)"
  year: number;
  monthName: string;
  dayOfMonth: number;
  yesterdayFull: string;
  tomorrowFull: string;
  daysUntilChristmas: number;
  daysUntilNewYear: number;
}

const DEFAULT_TIMEZONE = 'Asia/Manila';

/**
 * Computes live temporal context in the target timezone (default Asia/Manila).
 */
export function getLiveDateTimeContext(timeZone: string = DEFAULT_TIMEZONE): DateTimeContext {
  const now = new Date();

  // Format full date in timezone
  const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const fullDate = fullDateFormatter.format(now);

  const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' });
  const dayOfWeek = dayOfWeekFormatter.format(now);

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const timeString = `${timeFormatter.format(now)} (${timeZone === 'Asia/Manila' ? 'PHT / UTC+8' : timeZone})`;

  // Extract year, month, day components in the timezone
  const partsFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const parts = partsFormatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')?.value || `${now.getFullYear()}`, 10);
  const monthName = parts.find((p) => p.type === 'month')?.value || 'October';
  const dayOfMonth = parseInt(parts.find((p) => p.type === 'day')?.value || `${now.getDate()}`, 10);

  // Yesterday and Tomorrow in target timezone
  const oneDayMs = 24 * 60 * 60 * 1000;
  const yesterdayDate = new Date(now.getTime() - oneDayMs);
  const tomorrowDate = new Date(now.getTime() + oneDayMs);

  const yesterdayFull = fullDateFormatter.format(yesterdayDate);
  const tomorrowFull = fullDateFormatter.format(tomorrowDate);

  // Calculate days until Christmas (Dec 25)
  const currentYearChristmas = new Date(year, 11, 25);
  let targetChristmas = currentYearChristmas;
  if (now.getTime() > currentYearChristmas.getTime() + oneDayMs) {
    targetChristmas = new Date(year + 1, 11, 25);
  }
  const diffXmasMs = targetChristmas.getTime() - now.getTime();
  const daysUntilChristmas = Math.max(0, Math.ceil(diffXmasMs / oneDayMs));

  // Calculate days until New Year (Jan 1)
  const nextNewYear = new Date(year + 1, 0, 1);
  const diffNYMs = nextNewYear.getTime() - now.getTime();
  const daysUntilNewYear = Math.max(0, Math.ceil(diffNYMs / oneDayMs));

  return {
    timeZone,
    isoString: now.toISOString(),
    fullDate,
    dayOfWeek,
    timeString,
    year,
    monthName,
    dayOfMonth,
    yesterdayFull,
    tomorrowFull,
    daysUntilChristmas,
    daysUntilNewYear,
  };
}

/**
 * Checks if a query is specifically requesting current date/time arithmetic,
 * and if so, produces an exact deterministic answer.
 */
export function resolveDeterministicDateTimeQuery(query: string, timeZone: string = DEFAULT_TIMEZONE): string | null {
  const q = query.toLowerCase().trim();
  const ctx = getLiveDateTimeContext(timeZone);

  // 1. What is the date today / What is today's date / What's the date?
  if (
    q === "what is today's date?" ||
    q === "what is today's date" ||
    q === "what's today's date?" ||
    q === "what's today's date" ||
    q === 'what is the date today?' ||
    q === 'what is the date today' ||
    q === 'what date is today?' ||
    q === 'what date is today' ||
    q === "today's date" ||
    q === 'current date'
  ) {
    return `Today is **${ctx.fullDate}** (${ctx.timeZone}).`;
  }

  // 2. What day is today / What day of the week is it?
  if (
    q === 'what day is today?' ||
    q === 'what day is today' ||
    q === "what day is it today?" ||
    q === "what day is it?" ||
    q === "what day is it" ||
    q === 'what day of the week is it?' ||
    q === 'what day of the week is today?'
  ) {
    return `Today is **${ctx.dayOfWeek}**, **${ctx.monthName} ${ctx.dayOfMonth}, ${ctx.year}**.`;
  }

  // 3. What time is it in the Philippines? / Current time in PH
  if (
    q.includes('time is it in the philippines') ||
    q.includes('time in the philippines') ||
    q.includes('time in ph') ||
    q.includes('current time in philippines')
  ) {
    return `The current time in the Philippines is **${ctx.timeString}** on **${ctx.fullDate}**.`;
  }

  // 4. What time is it? / What's the time?
  if (
    q === 'what time is it?' ||
    q === 'what time is it' ||
    q === "what's the time?" ||
    q === "what's the time" ||
    q === 'current time'
  ) {
    return `The current time is **${ctx.timeString}** (${ctx.fullDate}).`;
  }

  // 5. What is tomorrow's date? / Tomorrow's date
  if (
    q.includes("tomorrow's date") ||
    q.includes('date tomorrow') ||
    q.includes('what day is tomorrow')
  ) {
    return `Tomorrow is **${ctx.tomorrowFull}**.`;
  }

  // 6. What day was yesterday? / Yesterday's date
  if (
    q.includes("yesterday's date") ||
    q.includes('date yesterday') ||
    q.includes('what day was yesterday')
  ) {
    return `Yesterday was **${ctx.yesterdayFull}**.`;
  }

  // 7. What is the current year?
  if (
    q === 'what is the current year?' ||
    q === 'what is the current year' ||
    q === 'what year is it?' ||
    q === 'what year is it' ||
    q === 'current year'
  ) {
    return `The current year is **${ctx.year}**.`;
  }

  // 8. How many days until December 25 / Christmas?
  if (
    q.includes('days until december 25') ||
    q.includes('days until christmas') ||
    q.includes('how many days until christmas')
  ) {
    if (ctx.daysUntilChristmas === 0) {
      return `Today is Christmas Day! Merry Christmas! 🎄`;
    }
    return `There are **${ctx.daysUntilChristmas} days** until Christmas (December 25, ${ctx.year}).`;
  }

  // 9. Time in other common timezones (e.g. "What time is it in Tokyo / New York / London")
  const timezoneMap: Record<string, string> = {
    tokyo: 'Asia/Tokyo',
    japan: 'Asia/Tokyo',
    'new york': 'America/New_York',
    nyc: 'America/New_York',
    london: 'Europe/London',
    uk: 'Europe/London',
    sydney: 'Australia/Sydney',
    singapore: 'Asia/Singapore',
    paris: 'Europe/Paris',
    dubai: 'Asia/Dubai',
    california: 'America/Los_Angeles',
    'los angeles': 'America/Los_Angeles',
  };

  for (const [key, tz] of Object.entries(timezoneMap)) {
    if (q.includes(`time is it in ${key}`) || q.includes(`time in ${key}`)) {
      try {
        const foreignCtx = getLiveDateTimeContext(tz);
        return `The current time in **${key.charAt(0).toUpperCase() + key.slice(1)}** is **${foreignCtx.timeString}** on **${foreignCtx.fullDate}**.`;
      } catch {
        // Fall back to general model
      }
    }
  }

  return null;
}
