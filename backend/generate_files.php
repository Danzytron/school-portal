<?php

$baseDir = 'C:\Users\User\.gemini\antigravity\scratch\school-portal\backend';

function createFile($path, $content) {
    global $baseDir;
    $fullPath = $baseDir . DIRECTORY_SEPARATOR . $path;
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    file_put_contents($fullPath, trim($content) . "\n");
    echo "Created: $path\n";
}

$requests = [
    'LoginRequest' => "['email' => 'required|string', 'password' => 'required|string']",
    'StoreStudentRequest' => "['name' => 'required|string|max:255', 'email' => 'required|email|unique:users', 'password' => 'required|string|min:8', 'student_id_number' => 'required|string|unique:students', 'course_id' => 'required|exists:courses,id', 'year_level' => 'required|integer|min:1|max:6', 'section_id' => 'nullable|exists:sections,id', 'contact_number' => 'nullable|string', 'address' => 'nullable|string', 'date_of_birth' => 'nullable|date']",
    'UpdateStudentRequest' => "['name' => 'sometimes|string|max:255', 'email' => 'sometimes|email|unique:users,email,'.\$this->route('student'), 'password' => 'nullable|string|min:8', 'student_id_number' => 'sometimes|string|unique:students,student_id_number,'.\$this->route('student'), 'course_id' => 'sometimes|exists:courses,id', 'year_level' => 'sometimes|integer|min:1|max:6', 'section_id' => 'nullable|exists:sections,id', 'contact_number' => 'nullable|string', 'address' => 'nullable|string', 'date_of_birth' => 'nullable|date']",
    'StoreTeacherRequest' => "['name' => 'required|string|max:255', 'email' => 'required|email|unique:users', 'password' => 'required|string|min:8', 'employee_id' => 'required|string|unique:teachers', 'department' => 'required|string', 'specialization' => 'required|string', 'contact_number' => 'nullable|string']",
    'UpdateTeacherRequest' => "['name' => 'sometimes|string|max:255', 'email' => 'sometimes|email|unique:users,email,'.\$this->route('teacher'), 'password' => 'nullable|string|min:8', 'employee_id' => 'sometimes|string|unique:teachers,employee_id,'.\$this->route('teacher'), 'department' => 'sometimes|string', 'specialization' => 'sometimes|string', 'contact_number' => 'nullable|string']",
    'StoreCourseRequest' => "['code' => 'required|string|unique:courses', 'name' => 'required|string', 'department' => 'required|string', 'duration_years' => 'required|integer|min:1']",
    'UpdateCourseRequest' => "['code' => 'sometimes|string|unique:courses,code,'.\$this->route('course'), 'name' => 'sometimes|string', 'department' => 'sometimes|string', 'duration_years' => 'sometimes|integer|min:1']",
    'StoreSubjectRequest' => "['code' => 'required|string|unique:subjects', 'name' => 'required|string', 'units' => 'required|integer|min:1', 'course_id' => 'required|exists:courses,id', 'year_level' => 'required|integer|min:1', 'semester' => 'required|integer|min:1']",
    'UpdateSubjectRequest' => "['code' => 'sometimes|string|unique:subjects,code,'.\$this->route('subject'), 'name' => 'sometimes|string', 'units' => 'sometimes|integer|min:1', 'course_id' => 'sometimes|exists:courses,id', 'year_level' => 'sometimes|integer|min:1', 'semester' => 'sometimes|integer|min:1']",
    'StoreSectionRequest' => "['name' => 'required|string', 'course_id' => 'required|exists:courses,id', 'year_level' => 'required|integer|min:1', 'school_year_id' => 'required|exists:school_years,id', 'max_students' => 'required|integer|min:1']",
    'UpdateSectionRequest' => "['name' => 'sometimes|string', 'course_id' => 'sometimes|exists:courses,id', 'year_level' => 'sometimes|integer|min:1', 'school_year_id' => 'sometimes|exists:school_years,id', 'max_students' => 'sometimes|integer|min:1']",
    'StoreRoomRequest' => "['name' => 'required|string|unique:rooms', 'building' => 'required|string', 'floor' => 'required|string', 'capacity' => 'required|integer|min:1', 'type' => 'required|string']",
    'UpdateRoomRequest' => "['name' => 'sometimes|string|unique:rooms,name,'.\$this->route('room'), 'building' => 'sometimes|string', 'floor' => 'sometimes|string', 'capacity' => 'sometimes|integer|min:1', 'type' => 'sometimes|string']",
    'StoreScheduleRequest' => "['subject_id' => 'required|exists:subjects,id', 'section_id' => 'required|exists:sections,id', 'teacher_id' => 'required|exists:teachers,id', 'room_id' => 'required|exists:rooms,id', 'semester_id' => 'required|exists:semesters,id', 'day_of_week' => 'required|string', 'start_time' => 'required|date_format:H:i', 'end_time' => 'required|date_format:H:i|after:start_time']",
    'UpdateScheduleRequest' => "['subject_id' => 'sometimes|exists:subjects,id', 'section_id' => 'sometimes|exists:sections,id', 'teacher_id' => 'sometimes|exists:teachers,id', 'room_id' => 'sometimes|exists:rooms,id', 'semester_id' => 'sometimes|exists:semesters,id', 'day_of_week' => 'sometimes|string', 'start_time' => 'sometimes|date_format:H:i', 'end_time' => 'sometimes|date_format:H:i|after:start_time']",
    'StoreEnrollmentRequest' => "['semester_id' => 'required|exists:semesters,id', 'subject_ids' => 'required|array', 'subject_ids.*' => 'exists:subjects,id']",
    'UpdateEnrollmentStatusRequest' => "['status' => 'required|in:approved,rejected,cancelled', 'remarks' => 'nullable|string']",
    'StoreGradeRequest' => "['student_id' => 'required|exists:students,id', 'subject_id' => 'required|exists:subjects,id', 'midterm' => 'nullable|numeric|min:0|max:100', 'final' => 'nullable|numeric|min:0|max:100']",
    'UpdateGradeRequest' => "['midterm' => 'nullable|numeric|min:0|max:100', 'final' => 'nullable|numeric|min:0|max:100']",
    'StoreAttendanceRequest' => "['subject_id' => 'required|exists:subjects,id', 'section_id' => 'required|exists:sections,id', 'date' => 'required|date', 'records' => 'required|array', 'records.*.student_id' => 'required|exists:students,id', 'records.*.status' => 'required|in:present,late,absent,excused']",
    'StoreAnnouncementRequest' => "['title' => 'required|string', 'content' => 'required|string', 'target_audience' => 'required|in:all,students,teachers,admin']",
    'UpdateAnnouncementRequest' => "['title' => 'sometimes|string', 'content' => 'sometimes|string', 'target_audience' => 'sometimes|in:all,students,teachers,admin']",
    'StoreSchoolFeeRequest' => "['student_id' => 'required|exists:students,id', 'semester_id' => 'required|exists:semesters,id', 'tuition' => 'required|numeric|min:0', 'miscellaneous' => 'required|numeric|min:0', 'laboratory' => 'required|numeric|min:0', 'library' => 'required|numeric|min:0', 'other_fees' => 'required|numeric|min:0']",
    'StorePaymentRequest' => "['school_fee_id' => 'required|exists:school_fees,id', 'amount' => 'required|numeric|min:0.01', 'payment_date' => 'required|date', 'payment_method' => 'required|string', 'reference_number' => 'nullable|string']",
    'StoreDocumentRequest' => "['title' => 'required|string', 'description' => 'nullable|string', 'file' => 'required|file', 'subject_id' => 'nullable|exists:subjects,id']",
    'StoreSchoolYearRequest' => "['year_start' => 'required|integer', 'year_end' => 'required|integer|gt:year_start']",
    'StoreSemesterRequest' => "['school_year_id' => 'required|exists:school_years,id', 'name' => 'required|string', 'start_date' => 'required|date', 'end_date' => 'required|date|after:start_date']",
    'UpdatePasswordRequest' => "['current_password' => 'required|string', 'password' => 'required|string|confirmed|min:8']",
    'UpdateProfileRequest' => "['contact_number' => 'nullable|string', 'address' => 'nullable|string']",
];

foreach ($requests as $name => $rules) {
    $content = "<?php\n\nnamespace App\Http\Requests;\n\nuse Illuminate\Foundation\Http\FormRequest;\n\nclass $name extends FormRequest\n{\n    public function authorize(): bool\n    {\n        return true;\n    }\n\n    public function rules(): array\n    {\n        return $rules;\n    }\n}\n";
    createFile("app/Http/Requests/$name.php", $content);
}

// Resources
$resources = [
    'UserResource' => "['id' => \$this->id, 'name' => \$this->name, 'email' => \$this->email, 'role' => \$this->role, 'avatar' => \$this->avatar, 'is_active' => \$this->is_active, 'created_at' => \$this->created_at]",
    'StudentResource' => "['id' => \$this->id, 'student_id_number' => \$this->student_id_number, 'user' => new UserResource(\$this->whenLoaded('user')), 'course' => new CourseResource(\$this->whenLoaded('course')), 'year_level' => \$this->year_level, 'section' => new SectionResource(\$this->whenLoaded('section')), 'contact_number' => \$this->contact_number, 'address' => \$this->address, 'date_of_birth' => \$this->date_of_birth, 'enrollment_status' => \$this->enrollment_status]",
    'TeacherResource' => "['id' => \$this->id, 'employee_id' => \$this->employee_id, 'user' => new UserResource(\$this->whenLoaded('user')), 'department' => \$this->department, 'specialization' => \$this->specialization, 'contact_number' => \$this->contact_number]",
    'CourseResource' => "['id' => \$this->id, 'code' => \$this->code, 'name' => \$this->name, 'department' => \$this->department, 'description' => \$this->description, 'duration_years' => \$this->duration_years, 'is_active' => \$this->is_active]",
    'SubjectResource' => "['id' => \$this->id, 'code' => \$this->code, 'name' => \$this->name, 'description' => \$this->description, 'units' => \$this->units, 'course' => new CourseResource(\$this->whenLoaded('course')), 'year_level' => \$this->year_level, 'semester' => \$this->semester, 'is_active' => \$this->is_active]",
    'SectionResource' => "['id' => \$this->id, 'name' => \$this->name, 'course' => new CourseResource(\$this->whenLoaded('course')), 'year_level' => \$this->year_level, 'school_year' => new SchoolYearResource(\$this->whenLoaded('school_year')), 'max_students' => \$this->max_students, 'is_active' => \$this->is_active]",
    'RoomResource' => "['id' => \$this->id, 'name' => \$this->name, 'building' => \$this->building, 'floor' => \$this->floor, 'capacity' => \$this->capacity, 'type' => \$this->type, 'is_active' => \$this->is_active]",
    'SchoolYearResource' => "['id' => \$this->id, 'year_start' => \$this->year_start, 'year_end' => \$this->year_end, 'is_current' => \$this->is_current]",
    'SemesterResource' => "['id' => \$this->id, 'name' => \$this->name, 'school_year' => new SchoolYearResource(\$this->whenLoaded('school_year')), 'start_date' => \$this->start_date, 'end_date' => \$this->end_date, 'is_current' => \$this->is_current]",
    'EnrollmentResource' => "['id' => \$this->id, 'student' => new StudentResource(\$this->whenLoaded('student')), 'semester' => new SemesterResource(\$this->whenLoaded('semester')), 'status' => \$this->status, 'enrolled_at' => \$this->enrolled_at, 'remarks' => \$this->remarks, 'subjects' => EnrollmentSubjectResource::collection(\$this->whenLoaded('subjects'))]",
    'EnrollmentSubjectResource' => "['id' => \$this->id, 'subject' => new SubjectResource(\$this->whenLoaded('subject')), 'section' => new SectionResource(\$this->whenLoaded('section')), 'schedule' => new ScheduleResource(\$this->whenLoaded('schedule'))]",
    'ScheduleResource' => "['id' => \$this->id, 'subject' => new SubjectResource(\$this->whenLoaded('subject')), 'section' => new SectionResource(\$this->whenLoaded('section')), 'teacher' => new TeacherResource(\$this->whenLoaded('teacher')), 'room' => new RoomResource(\$this->whenLoaded('room')), 'day_of_week' => \$this->day_of_week, 'start_time' => \$this->start_time, 'end_time' => \$this->end_time]",
    'GradeResource' => "['id' => \$this->id, 'student' => new StudentResource(\$this->whenLoaded('student')), 'subject' => new SubjectResource(\$this->whenLoaded('subject')), 'midterm' => \$this->midterm, 'final' => \$this->final, 'final_grade' => \$this->final_grade, 'remarks' => \$this->remarks, 'is_submitted' => \$this->is_submitted, 'submitted_at' => \$this->submitted_at]",
    'AttendanceResource' => "['id' => \$this->id, 'subject' => new SubjectResource(\$this->whenLoaded('subject')), 'section' => new SectionResource(\$this->whenLoaded('section')), 'teacher' => new TeacherResource(\$this->whenLoaded('teacher')), 'date' => \$this->date, 'records' => AttendanceRecordResource::collection(\$this->whenLoaded('records'))]",
    'AttendanceRecordResource' => "['id' => \$this->id, 'student' => new StudentResource(\$this->whenLoaded('student')), 'status' => \$this->status, 'time_recorded' => \$this->time_recorded, 'remarks' => \$this->remarks]",
    'AnnouncementResource' => "['id' => \$this->id, 'title' => \$this->title, 'content' => \$this->content, 'author' => new UserResource(\$this->whenLoaded('author')), 'target_audience' => \$this->target_audience, 'is_published' => \$this->is_published, 'published_at' => \$this->published_at, 'created_at' => \$this->created_at]",
    'SchoolFeeResource' => "['id' => \$this->id, 'student' => new StudentResource(\$this->whenLoaded('student')), 'semester' => new SemesterResource(\$this->whenLoaded('semester')), 'tuition' => \$this->tuition, 'miscellaneous' => \$this->miscellaneous, 'laboratory' => \$this->laboratory, 'library' => \$this->library, 'other_fees' => \$this->other_fees, 'total_amount' => \$this->total_amount, 'amount_paid' => \$this->amount_paid, 'balance' => \$this->balance, 'status' => \$this->status]",
    'PaymentResource' => "['id' => \$this->id, 'amount' => \$this->amount, 'payment_date' => \$this->payment_date, 'payment_method' => \$this->payment_method, 'reference_number' => \$this->reference_number, 'remarks' => \$this->remarks, 'created_at' => \$this->created_at]",
    'DocumentResource' => "['id' => \$this->id, 'title' => \$this->title, 'description' => \$this->description, 'file_path' => \$this->file_path, 'file_type' => \$this->file_type, 'file_size' => \$this->file_size, 'subject' => new SubjectResource(\$this->whenLoaded('subject')), 'created_at' => \$this->created_at]",
    'NotificationResource' => "['id' => \$this->id, 'title' => \$this->title, 'message' => \$this->message, 'type' => \$this->type, 'is_read' => \$this->is_read, 'read_at' => \$this->read_at, 'data' => \$this->data, 'created_at' => \$this->created_at]",
];

foreach ($resources as $name => $array) {
    $content = "<?php\n\nnamespace App\Http\Resources;\n\nuse Illuminate\Http\Request;\nuse Illuminate\Http\Resources\Json\JsonResource;\n\nclass $name extends JsonResource\n{\n    public function toArray(Request \$request): array\n    {\n        return $array;\n    }\n}\n";
    createFile("app/Http/Resources/$name.php", $content);
}

// Policies
$policies = [
    'StudentPolicy' => "    public function viewAny(\$user) { return \$user->role === 'admin'; }\n    public function view(\$user, \$model) { return \$user->role === 'admin' || (\$user->role === 'student' && \$user->student && \$user->student->id === \$model->id); }\n    public function create(\$user) { return \$user->role === 'admin'; }\n    public function update(\$user, \$model) { return \$user->role === 'admin' || (\$user->role === 'student' && \$user->student && \$user->student->id === \$model->id); }\n    public function delete(\$user, \$model) { return \$user->role === 'admin'; }",
    'TeacherPolicy' => "    public function viewAny(\$user) { return \$user->role === 'admin'; }\n    public function view(\$user, \$model) { return \$user->role === 'admin' || (\$user->role === 'teacher' && \$user->teacher && \$user->teacher->id === \$model->id); }\n    public function create(\$user) { return \$user->role === 'admin'; }\n    public function update(\$user, \$model) { return \$user->role === 'admin' || (\$user->role === 'teacher' && \$user->teacher && \$user->teacher->id === \$model->id); }\n    public function delete(\$user, \$model) { return \$user->role === 'admin'; }",
    'EnrollmentPolicy' => "    public function viewAny(\$user) { return \$user->role === 'admin'; }\n    public function view(\$user, \$model) { return \$user->role === 'admin' || (\$user->role === 'student' && \$user->student && \$user->student->id === \$model->student_id); }\n    public function create(\$user) { return \$user->role === 'student'; }\n    public function approve(\$user, \$model) { return \$user->role === 'admin'; }\n    public function reject(\$user, \$model) { return \$user->role === 'admin'; }",
    'GradePolicy' => "    public function viewAny(\$user) { return in_array(\$user->role, ['admin', 'teacher']); }\n    public function view(\$user, \$model) { return in_array(\$user->role, ['admin']) || (\$user->role === 'teacher' && \$user->teacher && \$user->teacher->id === \$model->teacher_id) || (\$user->role === 'student' && \$user->student && \$user->student->id === \$model->student_id); }\n    public function create(\$user) { return \$user->role === 'teacher'; }\n    public function update(\$user, \$model) { return \$user->role === 'teacher' && \$user->teacher && \$user->teacher->id === \$model->teacher_id && !\$model->is_submitted; }\n    public function submit(\$user, \$model) { return \$user->role === 'teacher' && \$user->teacher && \$user->teacher->id === \$model->teacher_id; }\n    public function finalize(\$user, \$model) { return \$user->role === 'admin'; }",
    'AttendancePolicy' => "    public function viewAny(\$user) { return in_array(\$user->role, ['admin', 'teacher']); }\n    public function view(\$user, \$model) { return in_array(\$user->role, ['admin']) || (\$user->role === 'teacher' && \$user->teacher && \$user->teacher->id === \$model->teacher_id); }\n    public function create(\$user) { return \$user->role === 'teacher'; }",
    'AnnouncementPolicy' => "    public function viewAny(\$user) { return true; }\n    public function view(\$user, \$model) { return true; }\n    public function create(\$user) { return in_array(\$user->role, ['admin', 'teacher']); }\n    public function update(\$user, \$model) { return \$user->role === 'admin' || \$user->id === \$model->author_id; }\n    public function delete(\$user, \$model) { return \$user->role === 'admin' || \$user->id === \$model->author_id; }",
    'SubjectPolicy' => "    public function viewAny(\$user) { return true; }\n    public function view(\$user, \$model) { return true; }\n    public function create(\$user) { return \$user->role === 'admin'; }\n    public function update(\$user, \$model) { return \$user->role === 'admin'; }\n    public function delete(\$user, \$model) { return \$user->role === 'admin'; }",
    'CoursePolicy' => "    public function viewAny(\$user) { return true; }\n    public function view(\$user, \$model) { return true; }\n    public function create(\$user) { return \$user->role === 'admin'; }\n    public function update(\$user, \$model) { return \$user->role === 'admin'; }\n    public function delete(\$user, \$model) { return \$user->role === 'admin'; }",
    'SectionPolicy' => "    public function viewAny(\$user) { return true; }\n    public function view(\$user, \$model) { return true; }\n    public function create(\$user) { return \$user->role === 'admin'; }\n    public function update(\$user, \$model) { return \$user->role === 'admin'; }\n    public function delete(\$user, \$model) { return \$user->role === 'admin'; }",
    'RoomPolicy' => "    public function viewAny(\$user) { return true; }\n    public function view(\$user, \$model) { return true; }\n    public function create(\$user) { return \$user->role === 'admin'; }\n    public function update(\$user, \$model) { return \$user->role === 'admin'; }\n    public function delete(\$user, \$model) { return \$user->role === 'admin'; }",
    'SchoolFeePolicy' => "    public function viewAny(\$user) { return \$user->role === 'admin'; }\n    public function view(\$user, \$model) { return \$user->role === 'admin' || (\$user->role === 'student' && \$user->student && \$user->student->id === \$model->student_id); }\n    public function create(\$user) { return \$user->role === 'admin'; }\n    public function update(\$user, \$model) { return \$user->role === 'admin'; }",
    'DocumentPolicy' => "    public function viewAny(\$user) { return true; }\n    public function view(\$user, \$model) { return true; }\n    public function create(\$user) { return in_array(\$user->role, ['admin', 'teacher']); }\n    public function update(\$user, \$model) { return \$user->role === 'admin' || \$user->id === \$model->uploaded_by; }\n    public function delete(\$user, \$model) { return \$user->role === 'admin' || \$user->id === \$model->uploaded_by; }",
];

foreach ($policies as $name => $methods) {
    $modelName = str_replace('Policy', '', $name);
    $content = "<?php\n\nnamespace App\Policies;\n\nuse App\Models\\User;\nuse App\Models\\$modelName;\nuse Illuminate\Auth\Access\HandlesAuthorization;\n\nclass $name\n{\n    use HandlesAuthorization;\n\n$methods\n}\n";
    createFile("app/Policies/$name.php", $content);
}

// Controllers
$controllers = [
    'UserController' => ['User', 'Request', 'Request'], // Uses generic Request for now to avoid needing StoreUserRequest
    'SubjectController' => ['Subject', 'StoreSubjectRequest', 'UpdateSubjectRequest'],
    'CourseController' => ['Course', 'StoreCourseRequest', 'UpdateCourseRequest'],
    'SectionController' => ['Section', 'StoreSectionRequest', 'UpdateSectionRequest'],
    'RoomController' => ['Room', 'StoreRoomRequest', 'UpdateRoomRequest'],
    'ScheduleController' => ['Schedule', 'StoreScheduleRequest', 'UpdateScheduleRequest'],
    'SemesterController' => ['Semester', 'StoreSemesterRequest', 'Request'],
    'SchoolYearController' => ['SchoolYear', 'StoreSchoolYearRequest', 'Request'],
    'DocumentController' => ['Document', 'StoreDocumentRequest', 'Request'],
];

foreach ($controllers as $name => $info) {
    $modelName = $info[0];
    $storeReq = $info[1];
    $updateReq = $info[2];
    $resourceName = $modelName . 'Resource';
    $varName = strtolower($modelName);

    $content = "<?php\n\nnamespace App\Http\Controllers\Api;\n\nuse App\Http\Controllers\Controller;\nuse App\Models\\$modelName;\nuse App\Http\Resources\\$resourceName;\nuse Illuminate\Http\Request;\n";
    if ($storeReq !== 'Request') $content .= "use App\Http\Requests\\$storeReq;\n";
    if ($updateReq !== 'Request' && $updateReq !== $storeReq) $content .= "use App\Http\Requests\\$updateReq;\n";
    
    $content .= "\nclass $name extends Controller\n{\n";
    
    // Index
    $content .= "    public function index(Request \$request)\n    {\n        \$query = $modelName::query();\n        if (\$request->has('search')) {\n            // Add basic search placeholder\n        }\n        \$items = \$query->paginate(\$request->get('per_page', 15));\n        return $resourceName::collection(\$items);\n    }\n\n";
    
    // Store
    $content .= "    public function store($storeReq \$request)\n    {\n        \$data = \$request->validated ?? \$request->all();\n        \$item = $modelName::create(\$data);\n        return new $resourceName(\$item);\n    }\n\n";

    // Show
    $content .= "    public function show(\$id)\n    {\n        \$item = $modelName::findOrFail(\$id);\n        return new $resourceName(\$item);\n    }\n\n";

    // Update
    $content .= "    public function update($updateReq \$request, \$id)\n    {\n        \$item = $modelName::findOrFail(\$id);\n        \$data = \$request->validated ?? \$request->all();\n        \$item->update(\$data);\n        return new $resourceName(\$item);\n    }\n\n";

    // Destroy
    $content .= "    public function destroy(\$id)\n    {\n        \$item = $modelName::findOrFail(\$id);\n        \$item->delete();\n        return response()->json(['message' => 'Deleted successfully']);\n    }\n}\n";

    createFile("app/Http/Controllers/Api/$name.php", $content);
}

// PaymentController (just store)
$paymentController = "<?php\n\nnamespace App\Http\Controllers\Api;\n\nuse App\Http\Controllers\Controller;\nuse App\Models\Payment;\nuse App\Http\Resources\PaymentResource;\nuse App\Http\Requests\StorePaymentRequest;\n\nclass PaymentController extends Controller\n{\n    public function store(StorePaymentRequest \$request)\n    {\n        \$item = Payment::create(\$request->validated());\n        return new PaymentResource(\$item);\n    }\n}\n";
createFile("app/Http/Controllers/Api/PaymentController.php", $paymentController);

// NotificationController (list, markAsRead, markAllRead)
$notificationController = "<?php\n\nnamespace App\Http\Controllers\Api;\n\nuse App\Http\Controllers\Controller;\nuse App\Models\\Notification;\nuse App\Http\Resources\\NotificationResource;\nuse Illuminate\Http\Request;\n\nclass NotificationController extends Controller\n{\n    public function index(Request \$request)\n    {\n        \$items = Notification::where('user_id', \$request->user()->id)->paginate(\$request->get('per_page', 15));\n        return NotificationResource::collection(\$items);\n    }\n\n    public function markAsRead(Request \$request, \$id)\n    {\n        \$notification = Notification::where('user_id', \$request->user()->id)->findOrFail(\$id);\n        \$notification->update(['is_read' => true, 'read_at' => now()]);\n        return new NotificationResource(\$notification);\n    }\n\n    public function markAllRead(Request \$request)\n    {\n        Notification::where('user_id', \$request->user()->id)->update(['is_read' => true, 'read_at' => now()]);\n        return response()->json(['message' => 'All notifications marked as read']);\n    }\n}\n";
createFile("app/Http/Controllers/Api/NotificationController.php", $notificationController);

// AuthServiceProvider
$authServiceProvider = "<?php\n\nnamespace App\Providers;\n\nuse Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;\n\nclass AuthServiceProvider extends ServiceProvider\n{\n    protected \$policies = [\n        \App\Models\Student::class => \App\Policies\StudentPolicy::class,\n        \App\Models\Teacher::class => \App\Policies\TeacherPolicy::class,\n        \App\Models\Enrollment::class => \App\Policies\EnrollmentPolicy::class,\n        \App\Models\Grade::class => \App\Policies\GradePolicy::class,\n        \App\Models\Attendance::class => \App\Policies\AttendancePolicy::class,\n        \App\Models\Announcement::class => \App\Policies\AnnouncementPolicy::class,\n        \App\Models\Subject::class => \App\Policies\SubjectPolicy::class,\n        \App\Models\Course::class => \App\Policies\CoursePolicy::class,\n        \App\Models\Section::class => \App\Policies\SectionPolicy::class,\n        \App\Models\Room::class => \App\Policies\RoomPolicy::class,\n        \App\Models\SchoolFee::class => \App\Policies\SchoolFeePolicy::class,\n        \App\Models\Document::class => \App\Policies\DocumentPolicy::class,\n    ];\n\n    public function boot(): void\n    {\n        \$this->registerPolicies();\n    }\n}\n";
createFile("app/Providers/AuthServiceProvider.php", $authServiceProvider);

echo "Done.\n";
