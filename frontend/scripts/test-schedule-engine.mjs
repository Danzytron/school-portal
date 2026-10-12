/**
 * Comprehensive Verification & Edge-Case Test Suite for CEC Real-Time Schedule Engine
 *
 * Tests all required scenarios in Asia/Manila (+08:00) timezone:
 * 1. Before the first class of the day (Monday 06:45 AM -> Upcoming class today in 45 mins)
 * 2. During an ongoing class (Monday 07:45 AM -> IT SIA31 ONGOING, 45 mins left)
 * 3. Exact boundary when a class ends and another begins (Monday 08:30 AM -> IT SIA31 Completed, IT EVD31 ONGOING)
 * 4. Between two classes on Tuesday (Tuesday 04:45 PM -> IT NET31 LAB Completed, GE ELEC 6 Next Class in 45 mins)
 * 5. After the last class of the day when tomorrow has classes (Monday 02:00 PM -> No More Classes Today, Next Class: Tomorrow Tuesday 03:00 PM)
 * 6. After the last class on Saturday when Sunday is free and Monday has classes (Saturday 08:00 PM -> Next Class: Monday)
 * 7. On a free day (Sunday 10:00 AM -> No class at this time, Your next class is tomorrow Monday 07:30 AM)
 * 8. At midnight rollover (Sunday 11:59 PM vs Monday 12:00 AM)
 * 9. Multi-day recurring schedule strings ("Mon & Wed", "Tuesday, Thursday, and Saturday", "MWF", "TTH")
 * 10. Overlapping class conflict detection
 * 11. Empty schedule ("No classes are currently scheduled.")
 */

import assert from 'node:assert/strict';
import {
  DEFAULT_STUDENT_WEEKLY_SCHEDULES,
  evaluateStudentSchedule,
  parseDaysOfWeek,
  parseTimeToMinutes,
  formatMinutesTo12Hour,
} from '../lib/schedule/scheduleEngine.ts';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log(' CEC Real-Time Class Schedule Engine — Verification Suite');
console.log('============================================================\n');

// Helper to create a Date corresponding to a specific Asia/Manila wall-clock time
function manilaDate(isoDate, time24) {
  return new Date(`${isoDate}T${time24}:00+08:00`);
}

test('1. Time and Multi-Day Parser handles 24h, 12h AM/PM, and multi-day strings', () => {
  assert.equal(parseTimeToMinutes('07:30:00'), 450);
  assert.equal(parseTimeToMinutes('07:30 AM'), 450);
  assert.equal(parseTimeToMinutes('12:00 PM'), 720);
  assert.equal(parseTimeToMinutes('12:00 AM'), 0);
  assert.equal(parseTimeToMinutes('03:00 PM'), 900);
  assert.equal(parseTimeToMinutes('15:00:00'), 900);
  assert.equal(formatMinutesTo12Hour(450), '07:30 AM');
  assert.equal(formatMinutesTo12Hour(900), '03:00 PM');

  assert.deepEqual(parseDaysOfWeek('Mon & Wed'), ['Monday', 'Wednesday']);
  assert.deepEqual(parseDaysOfWeek('Tuesday, Thursday, and Saturday'), [
    'Tuesday',
    'Thursday',
    'Saturday',
  ]);
  assert.deepEqual(parseDaysOfWeek('TTH'), ['Tuesday', 'Thursday']);
  assert.deepEqual(parseDaysOfWeek('MWF'), ['Monday', 'Wednesday', 'Friday']);
});

test('2. Before the first class of the day (Monday 06:45 AM Manila)', () => {
  // Monday Oct 12, 2026 at 06:45 AM PHT (45 minutes before 07:30 AM IT SIA31)
  const res = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-12', '06:45')
  );

  assert.equal(res.manilaTime.weekday, 'Monday');
  assert.equal(res.overallStatus, 'UPCOMING_TODAY');
  assert.equal(res.statusHeadline, 'No class at this time.');
  assert.match(res.statusSubtext, /Enjoy your free time/i);
  assert.equal(res.currentClass, null);
  assert.ok(res.nextClassToday);
  assert.equal(res.nextClassToday.code, 'IT SIA31');
  assert.equal(res.nextClassToday.liveStatus, 'NEXT_UP');
  assert.equal(res.nextClassToday.startsInMinutes, 45);
  assert.equal(
    res.nextScheduledClass?.countdownText,
    'Your next class starts in 45 minutes.'
  );
  assert.equal(res.todayClasses.length, 5);
});

test('3. During an ongoing class (Monday 07:45 AM Manila)', () => {
  // Monday Oct 12, 2026 at 07:45 AM PHT (inside 07:30 - 08:30 AM IT SIA31)
  const res = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-12', '07:45')
  );

  assert.equal(res.overallStatus, 'ONGOING');
  assert.equal(res.statusHeadline, 'Class in Progress');
  assert.ok(res.currentClass);
  assert.equal(res.currentClass.code, 'IT SIA31');
  assert.equal(res.currentClass.statusLabel, 'ONGOING');
  assert.equal(res.currentClass.remainingMinutes, 45);
  assert.equal(res.currentClass.remainingText, 'Ends in 45 minutes');
  // Next class today should be IT EVD31 at 08:30 AM
  assert.ok(res.nextClassToday);
  assert.equal(res.nextClassToday.code, 'IT EVD31');
});

test('4. Exact boundary when class ends (Monday 08:30 AM Manila -> 07:30-08:30 is COMPLETED, 08:30-09:30 is ONGOING)', () => {
  const res = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-12', '08:30')
  );

  assert.equal(res.overallStatus, 'ONGOING');
  assert.ok(res.currentClass);
  assert.equal(res.currentClass.code, 'IT EVD31');
  const firstClass = res.todayClasses.find((c) => c.code === 'IT SIA31');
  assert.equal(firstClass?.liveStatus, 'COMPLETED');
  assert.equal(firstClass?.statusLabel, 'Completed');
});

test('5. Between two classes on the same day (Tuesday 04:45 PM Manila)', () => {
  // Tuesday Oct 13, 2026: IT NET31 LAB is 03:00 PM - 04:30 PM; GE ELEC 6 is 05:30 PM - 06:30 PM
  const res = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-13', '16:45')
  );

  assert.equal(res.manilaTime.weekday, 'Tuesday');
  assert.equal(res.overallStatus, 'UPCOMING_TODAY');
  assert.equal(res.statusHeadline, 'No class at this time.');
  assert.equal(res.currentClass, null);

  const completedLab = res.todayClasses.find((c) => c.code === 'IT NET31 LAB');
  assert.equal(completedLab?.liveStatus, 'COMPLETED');

  assert.ok(res.nextClassToday);
  assert.equal(res.nextClassToday.code, 'GE ELEC 6');
  assert.equal(res.nextClassToday.startsInMinutes, 45);
  assert.equal(
    res.nextScheduledClass?.countdownText,
    'Your next class starts in 45 minutes.'
  );
});

test('6. After the last class of the day when tomorrow has classes (Monday 02:30 PM Manila)', () => {
  // Monday Oct 12, 2026 at 02:30 PM (all Monday classes ended at 01:00 PM; Tuesday starts at 03:00 PM)
  const res = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-12', '14:30')
  );

  assert.equal(res.overallStatus, 'DONE_FOR_TODAY');
  assert.equal(res.statusHeadline, 'No More Classes Today');
  assert.match(res.statusSubtext, /You're done with your classes for today!/);
  assert.equal(res.currentClass, null);
  assert.equal(res.nextClassToday, null);

  assert.ok(res.nextScheduledClass);
  assert.equal(res.nextScheduledClass.isTomorrow, true);
  assert.equal(res.nextScheduledClass.headlineLabel, 'Next Class: Tomorrow');
  assert.equal(res.nextScheduledClass.occurrence.code, 'IT NET31 LAB');
  assert.equal(res.nextScheduledClass.occurrence.dayOfWeek, 'Tuesday');
  assert.match(res.nextScheduledClass.countdownText, /Your next class is tomorrow/i);
});

test('7. After the last class on Saturday when Sunday has no classes and Monday is next (Saturday 08:00 PM Manila)', () => {
  // Saturday Oct 17, 2026 at 08:00 PM (last Saturday class ended at 07:30 PM; Sunday has 0 classes; Monday starts 07:30 AM)
  const res = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-17', '20:00')
  );

  assert.equal(res.manilaTime.weekday, 'Saturday');
  assert.equal(res.overallStatus, 'DONE_FOR_TODAY');
  assert.ok(res.nextScheduledClass);
  assert.equal(res.nextScheduledClass.isTomorrow, false);
  assert.equal(res.nextScheduledClass.daysAhead, 2);
  assert.equal(res.nextScheduledClass.targetDayName, 'Monday');
  assert.equal(res.nextScheduledClass.occurrence.code, 'IT SIA31');
  assert.equal(res.nextScheduledClass.headlineLabel, 'Next Class: Monday');
});

test('8. On a day with no classes (Sunday 10:00 AM Manila -> Next class is tomorrow Monday)', () => {
  // Sunday Oct 18, 2026 at 10:00 AM PHT
  const res = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-18', '10:00')
  );

  assert.equal(res.manilaTime.weekday, 'Sunday');
  assert.equal(res.overallStatus, 'NO_CLASS_TODAY');
  assert.equal(res.statusHeadline, 'No class at this time.');
  assert.equal(res.todayClasses.length, 0);
  assert.ok(res.nextScheduledClass);
  assert.equal(res.nextScheduledClass.isTomorrow, true);
  assert.equal(res.nextScheduledClass.headlineLabel, 'Next Class: Tomorrow');
  assert.equal(res.nextScheduledClass.occurrence.code, 'IT SIA31');
  assert.match(res.nextScheduledClass.countdownText, /Your next class is tomorrow/i);
});

test('9. Midnight rollover transitions smoothly from Sunday 11:59 PM to Monday 12:00 AM', () => {
  const beforeMidnight = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-18', '23:59')
  );
  assert.equal(beforeMidnight.manilaTime.weekday, 'Sunday');
  assert.equal(beforeMidnight.overallStatus, 'NO_CLASS_TODAY');
  assert.equal(beforeMidnight.nextScheduledClass?.isTomorrow, true);

  const afterMidnight = evaluateStudentSchedule(
    DEFAULT_STUDENT_WEEKLY_SCHEDULES,
    manilaDate('2026-10-19', '00:00')
  );
  assert.equal(afterMidnight.manilaTime.weekday, 'Monday');
  assert.equal(afterMidnight.overallStatus, 'UPCOMING_TODAY');
  assert.equal(afterMidnight.nextScheduledClass?.isToday, true);
  assert.equal(afterMidnight.nextClassToday?.code, 'IT SIA31');
  assert.equal(afterMidnight.todayClasses.length, 5);
});

test('10. Detects overlapping class conflicts accurately', () => {
  const overlappingSchedule = [
    {
      id: 101,
      day_of_week: 'Monday',
      start_time: '10:00 AM',
      end_time: '11:30 AM',
      code: 'CS 101',
      name: 'Computer Science 1',
      room: 'Room 101',
      instructor: 'Prof. A',
    },
    {
      id: 102,
      day_of_week: 'Monday',
      start_time: '11:00 AM',
      end_time: '12:00 PM',
      code: 'MATH 101',
      name: 'Calculus 1',
      room: 'Room 202',
      instructor: 'Prof. B',
    },
  ];

  const res = evaluateStudentSchedule(
    overlappingSchedule,
    manilaDate('2026-10-12', '11:15')
  );

  assert.equal(res.overallStatus, 'ONGOING');
  assert.equal(res.ongoingClasses.length, 2);
  assert.equal(res.conflictsToday.length, 1);
  assert.equal(res.conflictsToday[0].overlapWindow, '11:00 AM – 11:30 AM');
});

test('11. Handles empty schedule gracefully ("No classes are currently scheduled.")', () => {
  const res = evaluateStudentSchedule([], manilaDate('2026-10-12', '09:00'));

  assert.equal(res.overallStatus, 'NO_CLASSES_SCHEDULED');
  assert.equal(res.statusHeadline, 'No classes are currently scheduled.');
  assert.equal(res.currentClass, null);
  assert.equal(res.nextScheduledClass, null);
  assert.equal(res.todayClasses.length, 0);
});

console.log('\n------------------------------------------------------------');
console.log(` Results: ${passed} passed, ${failed} failed`);
console.log('------------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
}
