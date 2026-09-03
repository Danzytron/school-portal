import os
import json

base_dir = r"C:\Users\User\.gemini\antigravity\scratch\school-portal\backend"

def write_file(rel_path, content):
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

# Controllers
missing_controllers = ["UserController", "SemesterController", "SchoolYearController", "PaymentController", "DocumentController", "NotificationController"]

for c in missing_controllers:
    write_file(f"app/Http/Controllers/Api/{c}.php", f"""<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class {c} extends Controller
{{
    public function index(Request $request) {{
        return response()->json([]);
    }}

    public function store(Request $request) {{
        return response()->json([]);
    }}

    public function show($id) {{
        return response()->json([]);
    }}

    public function update(Request $request, $id) {{
        return response()->json([]);
    }}

    public function destroy($id) {{
        return response()->json([]);
    }}
}}
""")

# Requests
requests = [
    "LoginRequest", "StoreStudentRequest", "UpdateStudentRequest", "StoreTeacherRequest", "UpdateTeacherRequest",
    "StoreCourseRequest", "UpdateCourseRequest", "StoreSubjectRequest", "UpdateSubjectRequest", "StoreSectionRequest",
    "UpdateSectionRequest", "StoreRoomRequest", "UpdateRoomRequest", "StoreScheduleRequest", "UpdateScheduleRequest",
    "StoreEnrollmentRequest", "UpdateEnrollmentStatusRequest", "StoreGradeRequest", "UpdateGradeRequest",
    "StoreAttendanceRequest", "StoreAnnouncementRequest", "UpdateAnnouncementRequest", "StoreSchoolFeeRequest",
    "StorePaymentRequest", "StoreDocumentRequest", "StoreSchoolYearRequest", "StoreSemesterRequest",
    "UpdatePasswordRequest", "UpdateProfileRequest"
]

for r in requests:
    write_file(f"app/Http/Requests/{r}.php", f"""<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class {r} extends FormRequest
{{
    public function authorize()
    {{
        return true;
    }}

    public function rules()
    {{
        return [
            // Add rules
        ];
    }}
}}
""")

# Resources
resources = [
    "UserResource", "StudentResource", "TeacherResource", "CourseResource", "SubjectResource", "SectionResource",
    "RoomResource", "SchoolYearResource", "SemesterResource", "EnrollmentResource", "EnrollmentSubjectResource",
    "ScheduleResource", "GradeResource", "AttendanceResource", "AttendanceRecordResource", "AnnouncementResource",
    "SchoolFeeResource", "PaymentResource", "DocumentResource", "NotificationResource", "DashboardResource"
]

for r in resources:
    write_file(f"app/Http/Resources/{r}.php", f"""<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class {r} extends JsonResource
{{
    public function toArray($request)
    {{
        return parent::toArray($request);
    }}
}}
""")

# Policies
policies = [
    "StudentPolicy", "TeacherPolicy", "EnrollmentPolicy", "GradePolicy", "AttendancePolicy", "AnnouncementPolicy",
    "SubjectPolicy", "CoursePolicy", "SectionPolicy", "RoomPolicy", "SchoolFeePolicy", "DocumentPolicy"
]

for p in policies:
    write_file(f"app/Policies/{p}.php", f"""<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class {p}
{{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {{
        return true;
    }}
}}
""")

# AuthServiceProvider
write_file(f"app/Providers/AuthServiceProvider.php", f"""<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{{
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    public function boot()
    {{
        $this->registerPolicies();
    }}
}}
""")
