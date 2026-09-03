<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Room;
use App\Models\Course;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use Illuminate\Support\Facades\Hash;

echo "=== Seeding Official Demo Student Schedule & Enrolled Subjects ===\n";

// 1. Get or Ensure Demo Student
$user = User::where('email', 'student@schoolportal.test')->first();
if (!$user) {
    $user = User::create([
        'name' => 'Roldan Jr. Delarmente',
        'email' => 'student@schoolportal.test',
        'password' => Hash::make('Portal2025!'),
        'role' => 'student'
    ]);
} else {
    $user->update(['name' => 'Roldan Jr. Delarmente']);
}

$course = Course::firstOrCreate(
    ['code' => 'BSIT'],
    ['name' => 'Bachelor of Science in Information Technology', 'department' => 'College of Computer Studies', 'duration_years' => 4, 'is_active' => true]
);

$semester = Semester::where('is_current', true)->first();
if (!$semester) {
    $semester = Semester::first();
}

$section = Section::firstOrCreate(
    ['name' => 'BSIT 3-A'],
    ['course_id' => $course->id, 'year_level' => 3, 'school_year_id' => $semester ? $semester->school_year_id : 1, 'max_students' => 45, 'is_active' => true]
);

$student = Student::updateOrCreate(
    ['user_id' => $user->id],
    [
        'student_id_number' => '2026-00001',
        'course_id' => $course->id,
        'year_level' => 3,
        'section_id' => $section->id,
        'contact_number' => '09171234567',
        'address' => 'Cebu City, Philippines',
        'date_of_birth' => '2004-05-12',
        'enrollment_status' => 'enrolled'
    ]
);

// 2. Ensure Rooms
$roomNames = ['H 204', 'K 104', 'H 301', 'OL 111', 'CL 1', 'OL 107', 'OL 108', 'OL 109', 'CL 3', 'OL 110', 'A 202'];
$rooms = [];
foreach ($roomNames as $rn) {
    $rooms[$rn] = Room::firstOrCreate(
        ['name' => $rn],
        ['building' => str_starts_with($rn, 'OL') ? 'Online Learning Platform' : (str_starts_with($rn, 'CL') ? 'Computer Laboratories' : 'Academic Building'), 'capacity' => 45, 'type' => 'lecture', 'is_active' => true]
    );
}

// 3. Ensure Teachers
$instructorData = [
    'Sir Vincent John Cababan' => ['email' => 'vcababan@schoolportal.test', 'emp' => 'TCH-CABABAN'],
    'Ms. Lindy Enaldo'         => ['email' => 'lenaldo@schoolportal.test', 'emp' => 'TCH-ENALDO'],
    'Ms. Krystel Hurboda'      => ['email' => 'khurboda@schoolportal.test', 'emp' => 'TCH-HURBODA'],
    'Ms. En Catarungan'        => ['email' => 'ecatarungan@schoolportal.test', 'emp' => 'TCH-CATARUNGAN'],
    'Sir Yestin Prado'         => ['email' => 'yprado@schoolportal.test', 'emp' => 'TCH-PRADO'],
    'Sir Jay-ar Base'          => ['email' => 'jbase@schoolportal.test', 'emp' => 'TCH-BASE'],
    'Sir Arnel L. Villanueva'  => ['email' => 'avillanueva@schoolportal.test', 'emp' => 'TCH-VILLANUEVA'],
    'Sir Charles Bacotot'      => ['email' => 'cbacotot@schoolportal.test', 'emp' => 'TCH-BACOTOT'],
    'Sir Arjay Alangcas'       => ['email' => 'aalangcas@schoolportal.test', 'emp' => 'TCH-ALANGCAS'],
];

$teachers = [];
foreach ($instructorData as $instName => $info) {
    $tUser = User::firstOrCreate(
        ['email' => $info['email']],
        ['name' => $instName, 'password' => Hash::make('Portal2025!'), 'role' => 'teacher']
    );
    $tUser->update(['name' => $instName]);
    $teachers[$instName] = Teacher::firstOrCreate(
        ['employee_id' => $info['emp']],
        ['user_id' => $tUser->id, 'department' => 'College of Computer Studies', 'specialization' => 'Information Technology', 'contact_number' => '09181234567']
    );
}

// 4. Ensure the 14 Subjects
$subjectsConfig = [
    'FREE ELEC 1'     => ['name' => 'FREE ELECTIVE 1', 'units' => 3],
    'GE ELEC 5'       => ['name' => 'ANG PANITIKAN NG PILIPINAS', 'units' => 3],
    'GE ELEC 6'       => ['name' => 'PHILIPPINE POPULAR CULTURE', 'units' => 3],
    'IT ELEC 1'       => ['name' => 'ELECTIVE 1 (LECTURE)', 'units' => 2],
    'IT ELEC 1 LAB'   => ['name' => 'ELECTIVE 1 (LABORATORY)', 'units' => 1],
    'IT EVD31'        => ['name' => 'EVENT DRIVEN PROGRAMMING (LECTURE)', 'units' => 2],
    'IT EVD31 LAB'    => ['name' => 'EVENT DRIVEN PROGRAMMING (LABORATORY)', 'units' => 1],
    'IT IAS31'        => ['name' => 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', 'units' => 2],
    'IT IAS31 LAB'    => ['name' => 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', 'units' => 1],
    'IT NET31'        => ['name' => 'NETWORKING 1 (LECTURE)', 'units' => 2],
    'IT NET31 LAB'    => ['name' => 'NETWORKING 1 (LABORATORY)', 'units' => 1],
    'IT SIA31'        => ['name' => 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', 'units' => 2],
    'IT SIA31 LAB'    => ['name' => 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', 'units' => 1],
    'IT SP131'        => ['name' => 'SOCIAL AND PROFESSIONAL ISSUES 1', 'units' => 3],
];

$subjects = [];
foreach ($subjectsConfig as $code => $cfg) {
    $subjects[$code] = Subject::updateOrCreate(
        ['code' => $code],
        [
            'name' => $cfg['name'],
            'units' => $cfg['units'],
            'course_id' => $course->id,
            'year_level' => 3,
            'semester' => 1,
            'is_active' => true
        ]
    );
}

// 5. Clean Old Schedules for this section to avoid clutter
Schedule::where('section_id', $section->id)->delete();

// Schedule entries specification
$schedulesList = [
    // Monday & Wednesday
    ['code' => 'IT SIA31',     'teacher' => 'Sir Charles Bacotot',     'room' => 'OL 110', 'days' => ['Monday', 'Wednesday'], 'start' => '07:30:00', 'end' => '08:30:00'],
    ['code' => 'IT EVD31',     'teacher' => 'Sir Yestin Prado',         'room' => 'OL 107', 'days' => ['Monday', 'Wednesday'], 'start' => '08:30:00', 'end' => '09:30:00'],
    ['code' => 'IT IAS31',     'teacher' => 'Sir Jay-ar Base',          'room' => 'OL 108', 'days' => ['Monday', 'Wednesday'], 'start' => '09:30:00', 'end' => '10:30:00'],
    ['code' => 'IT NET31',     'teacher' => 'Sir Arnel L. Villanueva',  'room' => 'OL 109', 'days' => ['Monday', 'Wednesday'], 'start' => '10:30:00', 'end' => '11:30:00'],
    ['code' => 'FREE ELEC 1',  'teacher' => 'Sir Vincent John Cababan', 'room' => 'H 204',  'days' => ['Monday', 'Wednesday'], 'start' => '10:30:00', 'end' => '12:00:00'],

    // Tuesday, Thursday, (and Saturday for GE ELEC)
    ['code' => 'IT NET31 LAB', 'teacher' => 'Sir Arnel L. Villanueva',  'room' => 'CL 3',   'days' => ['Tuesday', 'Thursday'], 'start' => '15:00:00', 'end' => '16:30:00'],
    ['code' => 'GE ELEC 6',    'teacher' => 'Ms. Krystel Hurboda',      'room' => 'H 301',  'days' => ['Tuesday', 'Thursday', 'Saturday'], 'start' => '17:30:00', 'end' => '18:30:00'],
    ['code' => 'GE ELEC 5',    'teacher' => 'Ms. Lindy Enaldo',         'room' => 'K 104',  'days' => ['Tuesday', 'Thursday', 'Saturday'], 'start' => '18:30:00', 'end' => '19:30:00'],
    ['code' => 'IT SP131',     'teacher' => 'Sir Arjay Alangcas',       'room' => 'A 202',  'days' => ['Tuesday', 'Thursday'], 'start' => '19:30:00', 'end' => '21:00:00'],

    // Friday & Saturday
    ['code' => 'IT IAS31 LAB', 'teacher' => 'Sir Jay-ar Base',          'room' => 'CL 1',   'days' => ['Friday', 'Saturday'], 'start' => '07:30:00', 'end' => '09:00:00'],
    ['code' => 'IT EVD31 LAB', 'teacher' => 'Sir Yestin Prado',         'room' => 'CL 1',   'days' => ['Friday', 'Saturday'], 'start' => '09:00:00', 'end' => '10:30:00'],
    ['code' => 'IT SIA31 LAB', 'teacher' => 'Sir Charles Bacotot',     'room' => 'CL 1',   'days' => ['Friday', 'Saturday'], 'start' => '10:30:00', 'end' => '12:00:00'],
    ['code' => 'IT ELEC 1 LAB','teacher' => 'Ms. En Catarungan',        'room' => 'CL 1',   'days' => ['Friday', 'Saturday'], 'start' => '13:30:00', 'end' => '15:00:00'],
    ['code' => 'IT ELEC 1',    'teacher' => 'Ms. En Catarungan',        'room' => 'OL 111', 'days' => ['Friday', 'Saturday'], 'start' => '15:00:00', 'end' => '16:00:00'],
];

$primarySchedulesForSubject = [];

foreach ($schedulesList as $sItem) {
    $subj = $subjects[$sItem['code']];
    $tch = $teachers[$sItem['teacher']];
    $rm = $rooms[$sItem['room']];

    foreach ($sItem['days'] as $day) {
        $createdSched = Schedule::create([
            'subject_id' => $subj->id,
            'section_id' => $section->id,
            'teacher_id' => $tch->id,
            'room_id' => $rm->id,
            'semester_id' => $semester ? $semester->id : 1,
            'day_of_week' => strtolower($day),
            'start_time' => $sItem['start'],
            'end_time' => $sItem['end']
        ]);
        if (!isset($primarySchedulesForSubject[$sItem['code']])) {
            $primarySchedulesForSubject[$sItem['code']] = $createdSched->id;
        }
    }
}

// 6. Setup Student Approved Enrollment with all 14 subjects
$enrollment = Enrollment::updateOrCreate(
    ['student_id' => $student->id, 'semester_id' => $semester ? $semester->id : 1],
    ['status' => 'approved', 'enrolled_at' => now(), 'remarks' => 'Regular Academic Load Approved']
);

EnrollmentSubject::where('enrollment_id', $enrollment->id)->delete();

foreach ($subjects as $code => $subj) {
    EnrollmentSubject::create([
        'enrollment_id' => $enrollment->id,
        'subject_id' => $subj->id,
        'section_id' => $section->id,
        'schedule_id' => $primarySchedulesForSubject[$code] ?? null
    ]);
}

echo "SUCCESS: 14 subjects, schedules, and approved enrollment created for Roldan Jr. Delarmente.\n";
