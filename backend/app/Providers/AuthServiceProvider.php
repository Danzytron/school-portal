<?php
namespace App\Providers;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
class AuthServiceProvider extends ServiceProvider {
    protected $policies = [
        \App\Models\Student::class => \App\Policies\StudentPolicy::class,
        \App\Models\Teacher::class => \App\Policies\TeacherPolicy::class,
        \App\Models\Enrollment::class => \App\Policies\EnrollmentPolicy::class,
        \App\Models\Grade::class => \App\Policies\GradePolicy::class,
        \App\Models\Attendance::class => \App\Policies\AttendancePolicy::class,
        \App\Models\Announcement::class => \App\Policies\AnnouncementPolicy::class,
        \App\Models\Subject::class => \App\Policies\SubjectPolicy::class,
        \App\Models\Course::class => \App\Policies\CoursePolicy::class,
        \App\Models\Section::class => \App\Policies\SectionPolicy::class,
        \App\Models\Room::class => \App\Policies\RoomPolicy::class,
        \App\Models\SchoolFee::class => \App\Policies\SchoolFeePolicy::class,
        \App\Models\Document::class => \App\Policies\DocumentPolicy::class,
    ];
    public function boot(): void {
        $this->registerPolicies();
    }
}
