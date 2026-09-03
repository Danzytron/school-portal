// User types
export interface User { id: number; name: string; email: string; role: 'student' | 'teacher' | 'admin'; avatar?: string; is_active: boolean; created_at: string; }
export interface LoginCredentials { email: string; password?: string; }
export interface AuthResponse { user: User; token: string; }

// Student types
export interface Student { id: number; user_id: number; student_id_number: string; course_id: number; year_level: number; section_id: number; contact_number: string; address: string; date_of_birth: string; enrollment_status: string; user?: User; course?: Course; section?: Section; }

// Teacher types  
export interface Teacher { id: number; user_id: number; employee_id: string; department: string; specialization: string; contact_number: string; user?: User; subjects?: Subject[]; }

// Academic types
export interface Course { id: number; code: string; name: string; department: string; description: string; duration_years: number; is_active: boolean; }
export interface Subject { id: number; code: string; name: string; description: string; units: number; course_id: number; year_level: number; semester: number; is_active: boolean; course?: Course; teacher?: Teacher; }
export interface Section { id: number; name: string; course_id: number; year_level: number; school_year_id: number; max_students: number; is_active: boolean; course?: Course; }
export interface Room { id: number; name: string; building: string; floor: string; capacity: number; type: string; is_active: boolean; }
export interface SchoolYear { id: number; year_start: number; year_end: number; is_current: boolean; }
export interface Semester { id: number; school_year_id: number; name: string; start_date: string; end_date: string; is_current: boolean; school_year?: SchoolYear; }

// Enrollment
export interface Enrollment { id: number; student_id: number; semester_id: number; status: string; enrolled_at: string; approved_by: number; remarks: string; student?: Student; semester?: Semester; subjects?: EnrollmentSubject[]; }
export interface EnrollmentSubject { id: number; enrollment_id: number; subject_id: number; section_id: number; schedule_id: number; subject?: Subject; section?: Section; schedule?: Schedule; }

// Schedule
export interface Schedule { id: number; subject_id: number; section_id: number; teacher_id: number; room_id: number; semester_id: number; day_of_week: string; start_time: string; end_time: string; subject?: Subject; section?: Section; teacher?: Teacher; room?: Room; }

// Grade
export interface Grade { id: number; student_id: number; subject_id: number; semester_id: number; section_id: number; teacher_id: number; midterm: number; final: number; final_grade: number; remarks: string; is_submitted: boolean; submitted_at: string; student?: Student; subject?: Subject; teacher?: Teacher; }

// Attendance
export interface Attendance { id: number; subject_id: number; section_id: number; teacher_id: number; date: string; semester_id: number; subject?: Subject; }
export interface AttendanceRecord { id: number; attendance_id: number; student_id: number; status: string; time_recorded: string; remarks: string; student?: Student; attendance?: Attendance; }

// Announcement
export interface Announcement { id: number; title: string; content: string; author_id: number; target_audience: string; is_published: boolean; published_at: string; created_at: string; author?: User; }

// Financial
export interface SchoolFee { id: number; student_id: number; semester_id: number; tuition: number; miscellaneous: number; laboratory: number; library: number; other_fees: number; total_amount: number; amount_paid: number; balance: number; status: string; }
export interface Payment { id: number; school_fee_id: number; amount: number; payment_date: string; payment_method: string; reference_number: string; remarks: string; }

// Documents & Notifications
export interface Document { id: number; title: string; description: string; file_path: string; file_type: string; file_size: number; uploaded_by: number; subject_id?: number; section_id?: number; is_downloadable: boolean; created_at: string; }
export interface Notification { id: number; user_id: number; title: string; message: string; type: string; is_read: boolean; read_at: string; data: any; created_at: string; }

// API response types
export interface ApiResponse<T> { data: T; message?: string; }
export interface PaginatedResponse<T> { data: T[]; meta: { current_page: number; last_page: number; per_page: number; total: number; }; }

// Dashboard types
export interface StudentDashboard { enrolled_subjects: number; gpa: number; attendance_rate: number; recent_announcements: Announcement[]; upcoming_classes: Schedule[]; enrollment_status: string; current_semester: string; }
export interface TeacherDashboard { assigned_subjects: number; total_students: number; todays_classes: Schedule[]; pending_grades: number; attendance_tasks: number; recent_announcements: Announcement[]; }
export interface AdminDashboard { total_students: number; total_teachers: number; total_courses: number; total_subjects: number; active_enrollments: number; pending_enrollments: number; students_by_course: any[]; enrollment_by_year: any[]; attendance_stats: any; grade_distribution: any; }
