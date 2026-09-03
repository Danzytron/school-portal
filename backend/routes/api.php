<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\SchoolYearController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\SchoolFeeController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Dashboard (role-aware)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Student-specific routes
    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'studentDashboard']);
        Route::get('/profile', [StudentController::class, 'profile']);
        Route::put('/profile', [StudentController::class, 'updateProfile']);
        Route::get('/subjects', [StudentController::class, 'subjects']);
        Route::get('/schedule', [StudentController::class, 'schedule']);
        Route::get('/grades', [StudentController::class, 'grades']);
        Route::get('/attendance', [StudentController::class, 'attendance']);
        Route::get('/announcements', [AnnouncementController::class, 'index']);
        Route::get('/enrollment', [StudentController::class, 'enrollment']);
        Route::post('/enrollment', [StudentController::class, 'enroll']);
        Route::get('/fees', [StudentController::class, 'fees']);
        Route::get('/documents', [StudentController::class, 'documents']);
    });

    // Teacher-specific routes
    Route::prefix('teacher')->middleware('role:teacher')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'teacherDashboard']);
        Route::get('/profile', [TeacherController::class, 'profile']);
        Route::put('/profile', [TeacherController::class, 'updateProfile']);
        Route::get('/subjects', [TeacherController::class, 'subjects']);
        Route::get('/students', [TeacherController::class, 'students']);
        Route::get('/schedule', [TeacherController::class, 'schedule']);
        Route::get('/grades', [GradeController::class, 'classGrades']);
        Route::post('/grades', [GradeController::class, 'submit']);
        Route::put('/grades/{id}', [GradeController::class, 'update']);
        Route::post('/grades/submit', [GradeController::class, 'submitFinal']);
        Route::get('/attendance', [AttendanceController::class, 'getBySubject']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::get('/announcements', [AnnouncementController::class, 'teacherIndex']);
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
        Route::get('/documents', [DocumentController::class, 'teacherIndex']);
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard']);

        // CRUD Resources
        Route::apiResource('students', StudentController::class);
        Route::post('/students/{id}/reset-password', [StudentController::class, 'resetPassword']);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('users', UserController::class);
        Route::apiResource('courses', CourseController::class);
        Route::apiResource('subjects', SubjectController::class);
        Route::apiResource('sections', SectionController::class);
        Route::apiResource('rooms', RoomController::class);
        Route::apiResource('schedules', ScheduleController::class);
        Route::apiResource('school-years', SchoolYearController::class);
        Route::apiResource('semesters', SemesterController::class);

        // Enrollment management
        Route::get('/enrollments', [EnrollmentController::class, 'index']);
        Route::put('/enrollments/{id}/approve', [EnrollmentController::class, 'approve']);
        Route::put('/enrollments/{id}/reject', [EnrollmentController::class, 'reject']);

        // Grade review
        Route::get('/grades', [GradeController::class, 'adminIndex']);
        Route::put('/grades/{id}/finalize', [GradeController::class, 'finalize']);

        // Attendance overview
        Route::get('/attendance', [AttendanceController::class, 'adminIndex']);

        // Announcements
        Route::apiResource('announcements', AnnouncementController::class);

        // Fees & Payments
        Route::get('/fees', [SchoolFeeController::class, 'index']);
        Route::post('/fees', [SchoolFeeController::class, 'store']);
        Route::put('/fees/{id}', [SchoolFeeController::class, 'update']);
        Route::post('/payments', [PaymentController::class, 'store']);

        // Reports
        Route::get('/reports/{type}', [ReportController::class, 'generate']);

        // Settings
        Route::get('/settings', [DashboardController::class, 'settings']);
        Route::put('/settings', [DashboardController::class, 'updateSettings']);
    });

    // Shared routes (all authenticated users)
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);
    Route::post('/announcements/{id}/read', [AnnouncementController::class, 'markAsRead']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Password change
    Route::put('/user/password', [AuthController::class, 'changePassword']);

    // Lookup data
    Route::get('/semesters', [SemesterController::class, 'index']);
    Route::get('/school-years', [SchoolYearController::class, 'index']);
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/sections', [SectionController::class, 'index']);
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/subjects', [SubjectController::class, 'index']);
});
