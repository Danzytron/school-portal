<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceRecord;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $attendance = Attendance::firstOrCreate(
                [
                    'subject_id' => $data['subject_id'],
                    'section_id' => $data['section_id'],
                    'date' => $data['date'],
                    'semester_id' => $data['semester_id'],
                ],
                [
                    'teacher_id' => $data['teacher_id'],
                ]
            );

            if (isset($data['records']) && is_array($data['records'])) {
                foreach ($data['records'] as $record) {
                    AttendanceRecord::updateOrCreate(
                        [
                            'attendance_id' => $attendance->id,
                            'student_id' => $record['student_id'],
                        ],
                        [
                            'status' => $record['status'],
                            'remarks' => $record['remarks'] ?? null,
                            'time_recorded' => now(),
                        ]
                    );
                }
            }

            return $attendance->load('records.student.user');
        });
    }

    public function getBySubject($subjectId, $sectionId, $date = null)
    {
        $query = Attendance::where('subject_id', $subjectId)
            ->where('section_id', $sectionId)
            ->with('records.student.user');
            
        if ($date) {
            $query->whereDate('date', $date);
        }
        
        return $query->get();
    }

    public function getStudentAttendance($studentId, $semesterId = null)
    {
        $query = AttendanceRecord::where('student_id', $studentId)
            ->with('attendance.subject');
            
        if ($semesterId) {
            $query->whereHas('attendance', function($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            });
        }
        
        return $query->get();
    }

    public function getAttendanceStats($studentId, $subjectId = null)
    {
        $query = AttendanceRecord::where('student_id', $studentId);
        
        if ($subjectId) {
            $query->whereHas('attendance', function($q) use ($subjectId) {
                $q->where('subject_id', $subjectId);
            });
        }
        
        $records = $query->get();
        
        return [
            'total' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'late' => $records->where('status', 'late')->count(),
            'excused' => $records->where('status', 'excused')->count(),
        ];
    }
}
