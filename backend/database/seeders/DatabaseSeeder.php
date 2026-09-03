<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Course;
use App\Models\Subject;
use App\Models\Section;
use App\Models\Room;
use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\TeacherSubject;
use App\Models\Schedule;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Models\Grade;
use App\Models\Attendance;
use App\Models\AttendanceRecord;
use App\Models\Announcement;
use App\Models\SchoolFee;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ============================
        // School Year & Semesters
        // ============================
        $schoolYear = SchoolYear::create(['year_start' => 2025, 'year_end' => 2026, 'is_current' => true]);
        $sem1 = Semester::create([
            'school_year_id' => $schoolYear->id,
            'name' => '1st Semester',
            'start_date' => '2025-08-01',
            'end_date' => '2025-12-15',
            'is_current' => true,
        ]);
        $sem2 = Semester::create([
            'school_year_id' => $schoolYear->id,
            'name' => '2nd Semester',
            'start_date' => '2026-01-10',
            'end_date' => '2026-05-30',
            'is_current' => false,
        ]);

        // ============================
        // Courses
        // ============================
        $courses = [];
        $courseData = [
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'department' => 'College of Computer Studies', 'description' => 'A program focused on IT solutions and systems development.', 'duration_years' => 4],
            ['code' => 'BSCS', 'name' => 'Bachelor of Science in Computer Science', 'department' => 'College of Computer Studies', 'description' => 'A program focused on computing theory and software development.', 'duration_years' => 4],
            ['code' => 'BSA', 'name' => 'Bachelor of Science in Accountancy', 'department' => 'College of Business', 'description' => 'A program preparing students for the CPA board exam.', 'duration_years' => 4],
            ['code' => 'BSBA', 'name' => 'Bachelor of Science in Business Administration', 'department' => 'College of Business', 'description' => 'A program focused on business management and entrepreneurship.', 'duration_years' => 4],
            ['code' => 'BSEd', 'name' => 'Bachelor of Secondary Education', 'department' => 'College of Education', 'description' => 'A program preparing students for secondary school teaching.', 'duration_years' => 4],
        ];
        foreach ($courseData as $c) {
            $courses[$c['code']] = Course::create($c);
        }

        // ============================
        // Rooms
        // ============================
        $rooms = [];
        $roomData = [
            ['name' => 'Room 101', 'building' => 'Main Building', 'floor' => '1st', 'capacity' => 40, 'type' => 'lecture'],
            ['name' => 'Room 102', 'building' => 'Main Building', 'floor' => '1st', 'capacity' => 40, 'type' => 'lecture'],
            ['name' => 'Room 201', 'building' => 'Main Building', 'floor' => '2nd', 'capacity' => 35, 'type' => 'lecture'],
            ['name' => 'Lab 1', 'building' => 'IT Building', 'floor' => '1st', 'capacity' => 30, 'type' => 'laboratory'],
            ['name' => 'Lab 2', 'building' => 'IT Building', 'floor' => '2nd', 'capacity' => 30, 'type' => 'laboratory'],
        ];
        foreach ($roomData as $r) {
            $rooms[] = Room::create($r);
        }

        // ============================
        // Sections
        // ============================
        $sections = [];
        $sectionData = [
            ['name' => 'BSIT-1A', 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
            ['name' => 'BSIT-1B', 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
            ['name' => 'BSIT-2A', 'course_id' => $courses['BSIT']->id, 'year_level' => 2, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
            ['name' => 'BSIT-3A', 'course_id' => $courses['BSIT']->id, 'year_level' => 3, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
            ['name' => 'BSCS-1A', 'course_id' => $courses['BSCS']->id, 'year_level' => 1, 'school_year_id' => $schoolYear->id, 'max_students' => 35],
            ['name' => 'BSCS-2A', 'course_id' => $courses['BSCS']->id, 'year_level' => 2, 'school_year_id' => $schoolYear->id, 'max_students' => 35],
            ['name' => 'BSA-1A', 'course_id' => $courses['BSA']->id, 'year_level' => 1, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
            ['name' => 'BSA-2A', 'course_id' => $courses['BSA']->id, 'year_level' => 2, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
            ['name' => 'BSBA-1A', 'course_id' => $courses['BSBA']->id, 'year_level' => 1, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
            ['name' => 'BSEd-1A', 'course_id' => $courses['BSEd']->id, 'year_level' => 1, 'school_year_id' => $schoolYear->id, 'max_students' => 40],
        ];
        foreach ($sectionData as $s) {
            $sections[$s['name']] = Section::create($s);
        }

        // ============================
        // Subjects
        // ============================
        $subjects = [];
        $subjectData = [
            // BSIT Year 1 Sem 1
            ['code' => 'IT101', 'name' => 'Introduction to Computing', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'IT102', 'name' => 'Computer Programming 1', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'IT103', 'name' => 'Discrete Mathematics', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'GE101', 'name' => 'Understanding the Self', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'GE102', 'name' => 'Readings in Philippine History', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'PE101', 'name' => 'Physical Education 1', 'units' => 2, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'NSTP1', 'name' => 'National Service Training Program 1', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 1],
            // BSIT Year 1 Sem 2
            ['code' => 'IT104', 'name' => 'Computer Programming 2', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 2],
            ['code' => 'IT105', 'name' => 'Data Structures and Algorithms', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 1, 'semester' => 2],
            // BSIT Year 2 Sem 1
            ['code' => 'IT201', 'name' => 'Object-Oriented Programming', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 2, 'semester' => 1],
            ['code' => 'IT202', 'name' => 'Database Management Systems', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 2, 'semester' => 1],
            ['code' => 'IT203', 'name' => 'Web Development', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 2, 'semester' => 1],
            // BSIT Year 3 Sem 1
            ['code' => 'IT301', 'name' => 'Systems Analysis and Design', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 3, 'semester' => 1],
            ['code' => 'IT302', 'name' => 'Information Assurance and Security', 'units' => 3, 'course_id' => $courses['BSIT']->id, 'year_level' => 3, 'semester' => 1],
            // BSCS
            ['code' => 'CS101', 'name' => 'Introduction to Computer Science', 'units' => 3, 'course_id' => $courses['BSCS']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'CS102', 'name' => 'Programming Fundamentals', 'units' => 3, 'course_id' => $courses['BSCS']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'CS201', 'name' => 'Algorithms and Complexity', 'units' => 3, 'course_id' => $courses['BSCS']->id, 'year_level' => 2, 'semester' => 1],
            // BSA
            ['code' => 'ACC101', 'name' => 'Fundamentals of Accounting 1', 'units' => 3, 'course_id' => $courses['BSA']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'ACC102', 'name' => 'Business Law', 'units' => 3, 'course_id' => $courses['BSA']->id, 'year_level' => 1, 'semester' => 1],
            // BSBA
            ['code' => 'BA101', 'name' => 'Introduction to Business', 'units' => 3, 'course_id' => $courses['BSBA']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'BA102', 'name' => 'Principles of Management', 'units' => 3, 'course_id' => $courses['BSBA']->id, 'year_level' => 1, 'semester' => 1],
            // BSEd
            ['code' => 'ED101', 'name' => 'The Teaching Profession', 'units' => 3, 'course_id' => $courses['BSEd']->id, 'year_level' => 1, 'semester' => 1],
            ['code' => 'ED102', 'name' => 'Child and Adolescent Development', 'units' => 3, 'course_id' => $courses['BSEd']->id, 'year_level' => 1, 'semester' => 1],
        ];
        foreach ($subjectData as $s) {
            $subjects[$s['code']] = Subject::create($s);
        }

        // ============================
        // Admin Accounts
        // ============================
        $adminUser = User::create(['name' => 'Maria Santos', 'email' => 'admin@schoolportal.test', 'password' => Hash::make('password'), 'role' => 'admin']);
        Admin::create(['user_id' => $adminUser->id, 'employee_id' => 'ADM-2025-001', 'department' => 'Office of the Registrar']);

        $adminUser2 = User::create(['name' => 'Jose Reyes', 'email' => 'admin2@schoolportal.test', 'password' => Hash::make('password'), 'role' => 'admin']);
        Admin::create(['user_id' => $adminUser2->id, 'employee_id' => 'ADM-2025-002', 'department' => 'Academic Affairs']);

        // ============================
        // Teacher Accounts
        // ============================
        $teachers = [];
        $teacherData = [
            ['name' => 'Juan Santos', 'email' => 'teacher@schoolportal.test', 'employee_id' => 'TCH-2025-001', 'department' => 'College of Computer Studies', 'specialization' => 'Software Development'],
            ['name' => 'Ana Garcia', 'email' => 'agarcia@schoolportal.test', 'employee_id' => 'TCH-2025-002', 'department' => 'College of Computer Studies', 'specialization' => 'Database Systems'],
            ['name' => 'Pedro Cruz', 'email' => 'pcruz@schoolportal.test', 'employee_id' => 'TCH-2025-003', 'department' => 'College of Computer Studies', 'specialization' => 'Web Technologies'],
            ['name' => 'Elena Flores', 'email' => 'eflores@schoolportal.test', 'employee_id' => 'TCH-2025-004', 'department' => 'General Education', 'specialization' => 'Social Sciences'],
            ['name' => 'Ricardo Mendoza', 'email' => 'rmendoza@schoolportal.test', 'employee_id' => 'TCH-2025-005', 'department' => 'General Education', 'specialization' => 'Mathematics'],
            ['name' => 'Carmen Bautista', 'email' => 'cbautista@schoolportal.test', 'employee_id' => 'TCH-2025-006', 'department' => 'College of Business', 'specialization' => 'Financial Accounting'],
            ['name' => 'Miguel Torres', 'email' => 'mtorres@schoolportal.test', 'employee_id' => 'TCH-2025-007', 'department' => 'College of Business', 'specialization' => 'Management'],
            ['name' => 'Rosa Villanueva', 'email' => 'rvillanueva@schoolportal.test', 'employee_id' => 'TCH-2025-008', 'department' => 'College of Education', 'specialization' => 'Curriculum Development'],
            ['name' => 'Antonio Ramos', 'email' => 'aramos@schoolportal.test', 'employee_id' => 'TCH-2025-009', 'department' => 'Physical Education', 'specialization' => 'Sports Science'],
            ['name' => 'Lucia Hernandez', 'email' => 'lhernandez@schoolportal.test', 'employee_id' => 'TCH-2025-010', 'department' => 'College of Computer Studies', 'specialization' => 'Information Security'],
        ];
        foreach ($teacherData as $t) {
            $u = User::create(['name' => $t['name'], 'email' => $t['email'], 'password' => Hash::make('password'), 'role' => 'teacher']);
            $teachers[$t['employee_id']] = Teacher::create([
                'user_id' => $u->id,
                'employee_id' => $t['employee_id'],
                'department' => $t['department'],
                'specialization' => $t['specialization'],
                'contact_number' => '09' . rand(100000000, 999999999),
            ]);
        }

        // ============================
        // Student Accounts
        // ============================
        $students = [];
        $firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Elena', 'Ricardo', 'Carmen', 'Miguel', 'Rosa', 'Antonio', 'Lucia', 'Carlos', 'Teresa', 'Fernando', 'Isabel', 'Roberto', 'Patricia', 'Daniel', 'Sofia', 'Andres', 'Gabriela', 'Marco', 'Victoria', 'Luis'];
        $lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Bautista', 'Flores', 'Mendoza', 'Torres', 'Villanueva', 'Ramos', 'Cruz', 'Lopez', 'Gonzales', 'Rivera', 'Martinez', 'Rodriguez', 'Hernandez', 'Castillo', 'Aquino', 'Morales'];

        $studentSections = [
            ['section' => 'BSIT-1A', 'course' => 'BSIT', 'year' => 1, 'count' => 10],
            ['section' => 'BSIT-1B', 'course' => 'BSIT', 'year' => 1, 'count' => 8],
            ['section' => 'BSIT-2A', 'course' => 'BSIT', 'year' => 2, 'count' => 8],
            ['section' => 'BSIT-3A', 'course' => 'BSIT', 'year' => 3, 'count' => 6],
            ['section' => 'BSCS-1A', 'course' => 'BSCS', 'year' => 1, 'count' => 6],
            ['section' => 'BSA-1A', 'course' => 'BSA', 'year' => 1, 'count' => 5],
            ['section' => 'BSBA-1A', 'course' => 'BSBA', 'year' => 1, 'count' => 4],
            ['section' => 'BSEd-1A', 'course' => 'BSEd', 'year' => 1, 'count' => 3],
        ];

        $studentNum = 1;
        // Create the primary demo student first
        $demoStudentUser = User::create(['name' => 'Roldan Jr. Delarmente', 'email' => 'student@schoolportal.test', 'password' => Hash::make('password'), 'role' => 'student']);
        $demoStudent = Student::create([
            'user_id' => $demoStudentUser->id,
            'student_id_number' => '2026-00001',
            'course_id' => $courses['BSIT']->id,
            'year_level' => 1,
            'section_id' => $sections['BSIT-1A']->id,
            'contact_number' => '09171234567',
            'address' => '123 Rizal St., Manila',
            'date_of_birth' => '2005-03-15',
            'enrollment_status' => 'enrolled',
        ]);
        $students[] = $demoStudent;
        $studentNum++;

        foreach ($studentSections as $ss) {
            $skip = ($ss['section'] === 'BSIT-1A') ? 1 : 0; // Skip 1 for demo student
            for ($i = $skip; $i < $ss['count']; $i++) {
                $fn = $firstNames[array_rand($firstNames)];
                $ln = $lastNames[array_rand($lastNames)];
                $u = User::create([
                    'name' => "$fn $ln",
                    'email' => strtolower(substr($fn, 0, 1) . str_replace(' ', '', strtolower($ln)) . $studentNum) . '@schoolportal.test',
                    'password' => Hash::make('password'),
                    'role' => 'student',
                ]);
                $s = Student::create([
                    'user_id' => $u->id,
                    'student_id_number' => '2026-' . str_pad($studentNum, 5, '0', STR_PAD_LEFT),
                    'course_id' => $courses[$ss['course']]->id,
                    'year_level' => $ss['year'],
                    'section_id' => $sections[$ss['section']]->id,
                    'contact_number' => '09' . rand(100000000, 999999999),
                    'address' => rand(1, 999) . ' ' . $lastNames[array_rand($lastNames)] . ' St., Manila',
                    'date_of_birth' => date('Y-m-d', strtotime('-' . rand(17, 22) . ' years -' . rand(0, 365) . ' days')),
                    'enrollment_status' => 'enrolled',
                ]);
                $students[] = $s;
                $studentNum++;
            }
        }

        // ============================
        // Teacher-Subject Assignments & Schedules
        // ============================
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $timeSlots = [
            ['07:30', '09:00'], ['09:00', '10:30'], ['10:30', '12:00'],
            ['13:00', '14:30'], ['14:30', '16:00'], ['16:00', '17:30'],
        ];
        $scheduleIdx = 0;

        // BSIT-1A subjects: assigned to teachers
        $assignments = [
            ['teacher' => 'TCH-2025-001', 'subject' => 'IT101', 'section' => 'BSIT-1A'],
            ['teacher' => 'TCH-2025-001', 'subject' => 'IT102', 'section' => 'BSIT-1A'],
            ['teacher' => 'TCH-2025-005', 'subject' => 'IT103', 'section' => 'BSIT-1A'],
            ['teacher' => 'TCH-2025-004', 'subject' => 'GE101', 'section' => 'BSIT-1A'],
            ['teacher' => 'TCH-2025-004', 'subject' => 'GE102', 'section' => 'BSIT-1A'],
            ['teacher' => 'TCH-2025-009', 'subject' => 'PE101', 'section' => 'BSIT-1A'],
            ['teacher' => 'TCH-2025-004', 'subject' => 'NSTP1', 'section' => 'BSIT-1A'],
            // BSIT-2A
            ['teacher' => 'TCH-2025-001', 'subject' => 'IT201', 'section' => 'BSIT-2A'],
            ['teacher' => 'TCH-2025-002', 'subject' => 'IT202', 'section' => 'BSIT-2A'],
            ['teacher' => 'TCH-2025-003', 'subject' => 'IT203', 'section' => 'BSIT-2A'],
            // BSIT-3A
            ['teacher' => 'TCH-2025-003', 'subject' => 'IT301', 'section' => 'BSIT-3A'],
            ['teacher' => 'TCH-2025-010', 'subject' => 'IT302', 'section' => 'BSIT-3A'],
            // BSCS-1A
            ['teacher' => 'TCH-2025-002', 'subject' => 'CS101', 'section' => 'BSCS-1A'],
            ['teacher' => 'TCH-2025-001', 'subject' => 'CS102', 'section' => 'BSCS-1A'],
            // BSA-1A
            ['teacher' => 'TCH-2025-006', 'subject' => 'ACC101', 'section' => 'BSA-1A'],
            ['teacher' => 'TCH-2025-006', 'subject' => 'ACC102', 'section' => 'BSA-1A'],
            // BSBA-1A
            ['teacher' => 'TCH-2025-007', 'subject' => 'BA101', 'section' => 'BSBA-1A'],
            ['teacher' => 'TCH-2025-007', 'subject' => 'BA102', 'section' => 'BSBA-1A'],
            // BSEd-1A
            ['teacher' => 'TCH-2025-008', 'subject' => 'ED101', 'section' => 'BSEd-1A'],
            ['teacher' => 'TCH-2025-008', 'subject' => 'ED102', 'section' => 'BSEd-1A'],
        ];

        $schedules = [];
        foreach ($assignments as $a) {
            $teacher = $teachers[$a['teacher']];
            $subject = $subjects[$a['subject']];
            $section = $sections[$a['section']];

            TeacherSubject::create([
                'teacher_id' => $teacher->id,
                'subject_id' => $subject->id,
                'section_id' => $section->id,
                'semester_id' => $sem1->id,
            ]);

            $day = $days[$scheduleIdx % 5];
            $time = $timeSlots[$scheduleIdx % count($timeSlots)];
            $room = $rooms[$scheduleIdx % count($rooms)];

            $sched = Schedule::create([
                'subject_id' => $subject->id,
                'section_id' => $section->id,
                'teacher_id' => $teacher->id,
                'room_id' => $room->id,
                'semester_id' => $sem1->id,
                'day_of_week' => $day,
                'start_time' => $time[0],
                'end_time' => $time[1],
            ]);
            $schedules[$a['subject'] . '-' . $a['section']] = $sched;
            $scheduleIdx++;
        }

        // ============================
        // Enrollments for BSIT-1A students
        // ============================
        $bsit1aStudents = Student::where('section_id', $sections['BSIT-1A']->id)->get();
        $bsit1aSubjects = ['IT101', 'IT102', 'IT103', 'GE101', 'GE102', 'PE101', 'NSTP1'];

        foreach ($bsit1aStudents as $student) {
            $enrollment = Enrollment::create([
                'student_id' => $student->id,
                'semester_id' => $sem1->id,
                'status' => 'approved',
                'enrolled_at' => now()->subMonths(2),
                'approved_by' => $adminUser->id,
            ]);
            foreach ($bsit1aSubjects as $subCode) {
                $key = $subCode . '-BSIT-1A';
                EnrollmentSubject::create([
                    'enrollment_id' => $enrollment->id,
                    'subject_id' => $subjects[$subCode]->id,
                    'section_id' => $sections['BSIT-1A']->id,
                    'schedule_id' => $schedules[$key]->id ?? null,
                ]);
            }
        }

        // ============================
        // Grades for demo student (BSIT-1A)
        // ============================
        $gradeValues = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00];
        foreach ($bsit1aSubjects as $subCode) {
            $midterm = $gradeValues[array_rand($gradeValues)];
            $final = $gradeValues[array_rand($gradeValues)];
            $finalGrade = round(($midterm + $final) / 2, 2);
            $remarks = $finalGrade <= 3.00 ? 'Passed' : 'Failed';

            Grade::create([
                'student_id' => $demoStudent->id,
                'subject_id' => $subjects[$subCode]->id,
                'semester_id' => $sem1->id,
                'section_id' => $sections['BSIT-1A']->id,
                'teacher_id' => $teachers['TCH-2025-001']->id,
                'midterm' => $midterm,
                'final' => $final,
                'final_grade' => $finalGrade,
                'remarks' => $remarks,
                'is_submitted' => true,
                'submitted_at' => now()->subWeeks(1),
            ]);
        }

        // ============================
        // Attendance Records
        // ============================
        $statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent', 'excused'];
        $startDate = now()->subMonths(2);
        for ($i = 0; $i < 10; $i++) {
            $date = $startDate->copy()->addDays($i * 7);
            if ($date->isWeekend()) $date->addDays(2);

            $attendance = Attendance::create([
                'subject_id' => $subjects['IT101']->id,
                'section_id' => $sections['BSIT-1A']->id,
                'teacher_id' => $teachers['TCH-2025-001']->id,
                'date' => $date->format('Y-m-d'),
                'semester_id' => $sem1->id,
            ]);

            foreach ($bsit1aStudents as $student) {
                AttendanceRecord::create([
                    'attendance_id' => $attendance->id,
                    'student_id' => $student->id,
                    'status' => $statuses[array_rand($statuses)],
                    'time_recorded' => '07:30:00',
                ]);
            }
        }

        // ============================
        // Announcements
        // ============================
        $announcementData = [
            ['title' => 'Welcome to School Year 2025-2026', 'content' => 'We warmly welcome all students and faculty to the new school year. Classes will officially begin on August 4, 2025. Please check your schedules and classroom assignments.', 'target_audience' => 'all', 'is_published' => true],
            ['title' => 'Midterm Examination Schedule', 'content' => 'Midterm examinations will be held from October 14-18, 2025. Please prepare accordingly. Examination permits will be available at the Registrar Office starting October 7.', 'target_audience' => 'students', 'is_published' => true],
            ['title' => 'Grade Submission Deadline', 'content' => 'All faculty members are reminded that the deadline for midterm grade submission is October 25, 2025. Please submit your grades through the portal.', 'target_audience' => 'teachers', 'is_published' => true],
            ['title' => 'Library Hours Extended', 'content' => 'The university library will extend its operating hours from 7:00 AM to 9:00 PM starting this week to support students preparing for midterm examinations.', 'target_audience' => 'all', 'is_published' => true],
            ['title' => 'Enrollment for 2nd Semester Now Open', 'content' => 'Online enrollment for the 2nd Semester SY 2025-2026 is now open. Students may enroll through the portal from January 5-10, 2026.', 'target_audience' => 'students', 'is_published' => true],
            ['title' => 'Faculty Meeting Notice', 'content' => 'There will be a general faculty meeting on November 5, 2025 at 2:00 PM in the AVR. Attendance is mandatory for all full-time faculty members.', 'target_audience' => 'teachers', 'is_published' => true],
        ];
        foreach ($announcementData as $idx => $a) {
            Announcement::create(array_merge($a, [
                'author_id' => $adminUser->id,
                'published_at' => now()->subDays(30 - $idx * 5),
            ]));
        }

        // ============================
        // School Fees for demo student
        // ============================
        SchoolFee::create([
            'student_id' => $demoStudent->id,
            'semester_id' => $sem1->id,
            'tuition' => 25000.00,
            'miscellaneous' => 5000.00,
            'laboratory' => 3000.00,
            'library' => 1000.00,
            'other_fees' => 500.00,
            'total_amount' => 34500.00,
            'amount_paid' => 20000.00,
            'balance' => 14500.00,
            'status' => 'partial',
        ]);

        // ============================
        // Notifications for demo student
        // ============================
        Notification::create([
            'user_id' => $demoStudentUser->id,
            'title' => 'Enrollment Approved',
            'message' => 'Your enrollment for 1st Semester SY 2025-2026 has been approved.',
            'type' => 'enrollment',
            'is_read' => true,
            'read_at' => now()->subMonths(1),
        ]);
        Notification::create([
            'user_id' => $demoStudentUser->id,
            'title' => 'Midterm Grades Released',
            'message' => 'Your midterm grades for 1st Semester have been released. Check your grades page.',
            'type' => 'grade',
            'is_read' => false,
        ]);
        Notification::create([
            'user_id' => $demoStudentUser->id,
            'title' => 'New Announcement',
            'message' => 'A new announcement has been posted: Enrollment for 2nd Semester Now Open',
            'type' => 'announcement',
            'is_read' => false,
        ]);
    }
}
