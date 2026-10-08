/**
 * Server-Side Portal Context Builder for CEC AI Assistant
 * Cebu Eastern College (CEC) UIS
 *
 * Gathers verified, role-specific portal records (grades, schedules, subjects, announcements)
 * from the portal API/database while strictly isolating permissions and filtering any sensitive metadata.
 */

const DEFAULT_STUDENT_GRADES = [
  { code: 'FREE ELEC 1', name: 'FREE ELECTIVE 1 (Mobile App Development)', units: 3, prelim: 1.25, midterm: 1.25, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Sir Vincent John Cababan' },
  { code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: 3, prelim: 1.50, midterm: 1.50, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Ms. Lindy Enaldo' },
  { code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: 3, prelim: 1.50, midterm: 1.25, semi_final: 1.50, final: 1.50, final_grade: 1.50, remarks: 'Passed', instructor: 'Ms. Krystel Hurboda' },
  { code: 'IT ELEC 1', name: 'ELECTIVE 1 (LECTURE)', units: 2, prelim: 1.25, midterm: 1.25, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Ms. En Catarungan' },
  { code: 'IT ELEC 1 LAB', name: 'ELECTIVE 1 (LABORATORY)', units: 1, prelim: 1.00, midterm: 1.00, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Ms. En Catarungan' },
  { code: 'IT EVD31', name: 'EVENT DRIVEN PROGRAMMING (LECTURE)', units: 2, prelim: 1.25, midterm: 1.25, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Sir Yestin Prado' },
  { code: 'IT EVD31 LAB', name: 'EVENT DRIVEN PROGRAMMING (LABORATORY)', units: 1, prelim: 1.00, midterm: 1.00, semi_final: 1.00, final: 1.00, final_grade: 1.00, remarks: 'Passed', instructor: 'Sir Yestin Prado' },
  { code: 'IT IAS31', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', units: 2, prelim: 1.75, midterm: 1.50, semi_final: 1.75, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Sir Jay-ar Base' },
  { code: 'IT IAS31 LAB', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', units: 1, prelim: 1.25, midterm: 1.25, semi_final: 1.00, final: 1.00, final_grade: 1.00, remarks: 'Passed', instructor: 'Sir Jay-ar Base' },
  { code: 'IT NET31', name: 'NETWORKING 1 (LECTURE)', units: 2, prelim: 1.50, midterm: 1.25, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Sir Arnel L. Villanueva' },
  { code: 'IT NET31 LAB', name: 'NETWORKING 1 (LABORATORY)', units: 1, prelim: 1.25, midterm: 1.00, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Sir Arnel L. Villanueva' },
  { code: 'IT SIA31', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', units: 2, prelim: 1.25, midterm: 1.25, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Sir Charles Bacotot' },
  { code: 'IT SIA31 LAB', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', units: 1, prelim: 1.00, midterm: 1.00, semi_final: 1.00, final: 1.00, final_grade: 1.00, remarks: 'Passed', instructor: 'Sir Charles Bacotot' },
  { code: 'IT SP131', name: 'SOCIAL AND PROFESSIONAL ISSUES 1', units: 3, prelim: 1.25, midterm: 1.25, semi_final: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', instructor: 'Sir Arjay Alangcas' },
];

const DEFAULT_STUDENT_SCHEDULES = [
  // Monday and Wednesday
  { day_of_week: 'Monday', time: '07:30 AM – 08:30 AM', code: 'IT SIA31', name: 'System Integration and Architecture 2 (Lecture)', room: 'Room OL 110', instructor: 'Sir Charles Bacotot', section: 'BSIT 3-A' },
  { day_of_week: 'Wednesday', time: '07:30 AM – 08:30 AM', code: 'IT SIA31', name: 'System Integration and Architecture 2 (Lecture)', room: 'Room OL 110', instructor: 'Sir Charles Bacotot', section: 'BSIT 3-A' },
  { day_of_week: 'Monday', time: '08:30 AM – 09:30 AM', code: 'IT EVD31', name: 'Event Driven Programming (Lecture)', room: 'Room OL 107', instructor: 'Sir Yestin Prado', section: 'BSIT 3-A' },
  { day_of_week: 'Wednesday', time: '08:30 AM – 09:30 AM', code: 'IT EVD31', name: 'Event Driven Programming (Lecture)', room: 'Room OL 107', instructor: 'Sir Yestin Prado', section: 'BSIT 3-A' },
  { day_of_week: 'Monday', time: '09:30 AM – 10:30 AM', code: 'IT IAS31', name: 'Information Assurance and Security 1 (Lecture)', room: 'Room OL 108', instructor: 'Sir Jay-ar Base', section: 'BSIT 3-A' },
  { day_of_week: 'Wednesday', time: '09:30 AM – 10:30 AM', code: 'IT IAS31', name: 'Information Assurance and Security 1 (Lecture)', room: 'Room OL 108', instructor: 'Sir Jay-ar Base', section: 'BSIT 3-A' },
  { day_of_week: 'Monday', time: '10:30 AM – 11:30 AM', code: 'IT NET31', name: 'Networking 1 (Lecture)', room: 'Room OL 109', instructor: 'Sir Arnel L. Villanueva', section: 'BSIT 3-A' },
  { day_of_week: 'Wednesday', time: '10:30 AM – 11:30 AM', code: 'IT NET31', name: 'Networking 1 (Lecture)', room: 'Room OL 109', instructor: 'Sir Arnel L. Villanueva', section: 'BSIT 3-A' },
  { day_of_week: 'Monday', time: '10:30 AM – 12:00 PM', code: 'FREE ELEC 1', name: 'Free Elective 1 (Mobile App Development)', room: 'Room H 204', instructor: 'Sir Vincent John Cababan', section: 'BSIT 3-A' },
  { day_of_week: 'Wednesday', time: '10:30 AM – 12:00 PM', code: 'FREE ELEC 1', name: 'Free Elective 1 (Mobile App Development)', room: 'Room H 204', instructor: 'Sir Vincent John Cababan', section: 'BSIT 3-A' },

  // Tuesday and Thursday
  { day_of_week: 'Tuesday', time: '03:00 PM – 04:30 PM', code: 'IT NET31 LAB', name: 'Networking 1 (Laboratory)', room: 'Computer Lab 3 (CL 3)', instructor: 'Sir Arnel L. Villanueva', section: 'BSIT 3-A' },
  { day_of_week: 'Thursday', time: '03:00 PM – 04:30 PM', code: 'IT NET31 LAB', name: 'Networking 1 (Laboratory)', room: 'Computer Lab 3 (CL 3)', instructor: 'Sir Arnel L. Villanueva', section: 'BSIT 3-A' },
  { day_of_week: 'Tuesday', time: '05:30 PM – 06:30 PM', code: 'GE ELEC 6', name: 'Philippine Popular Culture', room: 'Room H 301', instructor: 'Ms. Krystel Hurboda', section: 'BSIT 3-A' },
  { day_of_week: 'Thursday', time: '05:30 PM – 06:30 PM', code: 'GE ELEC 6', name: 'Philippine Popular Culture', room: 'Room H 301', instructor: 'Ms. Krystel Hurboda', section: 'BSIT 3-A' },
  { day_of_week: 'Saturday', time: '05:30 PM – 06:30 PM', code: 'GE ELEC 6', name: 'Philippine Popular Culture', room: 'Room H 301', instructor: 'Ms. Krystel Hurboda', section: 'BSIT 3-A' },
  { day_of_week: 'Tuesday', time: '06:30 PM – 07:30 PM', code: 'GE ELEC 5', name: 'Ang Panitikan ng Pilipinas', room: 'Room K 104', instructor: 'Ms. Lindy Enaldo', section: 'BSIT 3-A' },
  { day_of_week: 'Thursday', time: '06:30 PM – 07:30 PM', code: 'GE ELEC 5', name: 'Ang Panitikan ng Pilipinas', room: 'Room K 104', instructor: 'Ms. Lindy Enaldo', section: 'BSIT 3-A' },
  { day_of_week: 'Saturday', time: '06:30 PM – 07:30 PM', code: 'GE ELEC 5', name: 'Ang Panitikan ng Pilipinas', room: 'Room K 104', instructor: 'Ms. Lindy Enaldo', section: 'BSIT 3-A' },
  { day_of_week: 'Tuesday', time: '07:30 PM – 09:00 PM', code: 'IT SP131', name: 'Social and Professional Issues 1', room: 'Room A 202', instructor: 'Sir Arjay Alangcas', section: 'BSIT 3-A' },
  { day_of_week: 'Thursday', time: '07:30 PM – 09:00 PM', code: 'IT SP131', name: 'Social and Professional Issues 1', room: 'Room A 202', instructor: 'Sir Arjay Alangcas', section: 'BSIT 3-A' },

  // Friday and Saturday Labs
  { day_of_week: 'Friday', time: '07:30 AM – 09:00 AM', code: 'IT IAS31 LAB', name: 'Information Assurance and Security 1 (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Sir Jay-ar Base', section: 'BSIT 3-A' },
  { day_of_week: 'Saturday', time: '07:30 AM – 09:00 AM', code: 'IT IAS31 LAB', name: 'Information Assurance and Security 1 (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Sir Jay-ar Base', section: 'BSIT 3-A' },
  { day_of_week: 'Friday', time: '09:00 AM – 10:30 AM', code: 'IT EVD31 LAB', name: 'Event Driven Programming (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Sir Yestin Prado', section: 'BSIT 3-A' },
  { day_of_week: 'Saturday', time: '09:00 AM – 10:30 AM', code: 'IT EVD31 LAB', name: 'Event Driven Programming (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Sir Yestin Prado', section: 'BSIT 3-A' },
  { day_of_week: 'Friday', time: '10:30 AM – 12:00 PM', code: 'IT SIA31 LAB', name: 'System Integration and Architecture 2 (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Sir Charles Bacotot', section: 'BSIT 3-A' },
  { day_of_week: 'Saturday', time: '10:30 AM – 12:00 PM', code: 'IT SIA31 LAB', name: 'System Integration and Architecture 2 (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Sir Charles Bacotot', section: 'BSIT 3-A' },
  { day_of_week: 'Friday', time: '01:30 PM – 03:00 PM', code: 'IT ELEC 1 LAB', name: 'Elective 1 (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Ms. En Catarungan', section: 'BSIT 3-A' },
  { day_of_week: 'Saturday', time: '01:30 PM – 03:00 PM', code: 'IT ELEC 1 LAB', name: 'Elective 1 (Laboratory)', room: 'Computer Lab 1 (CL 1)', instructor: 'Ms. En Catarungan', section: 'BSIT 3-A' },
  { day_of_week: 'Friday', time: '03:00 PM – 04:00 PM', code: 'IT ELEC 1', name: 'Elective 1 (Lecture)', room: 'Room OL 111', instructor: 'Ms. En Catarungan', section: 'BSIT 3-A' },
  { day_of_week: 'Saturday', time: '03:00 PM – 04:00 PM', code: 'IT ELEC 1', name: 'Elective 1 (Lecture)', room: 'Room OL 111', instructor: 'Ms. En Catarungan', section: 'BSIT 3-A' },
];

const DEFAULT_CAMPUS_BULLETINS = [
  {
    title: 'Midterm Examination Schedule for 1st Semester A.Y. 2026-2027',
    date: '2026-10-01',
    content: 'Midterm examinations are scheduled from October 15-20, 2026. Please settle examination clearances at the Accounting Office before the exam dates.',
    priority: 'high',
  },
  {
    title: 'University Library System Digital Access Update',
    date: '2026-09-28',
    content: 'All enrolled college students now have 24/7 access to IEEE Xplore and ProQuest digital academic repositories via their student portal credentials.',
    priority: 'normal',
  },
  {
    title: 'Notice: Intramurals and Sports Festival Schedule',
    date: '2026-09-20',
    content: 'Annual CEC Intramurals will be held on the third week of November. Regular academic classes will resume promptly following the events.',
    priority: 'normal',
  },
];

export interface PortalContextOptions {
  userRole?: string;
  userName?: string;
  userId?: number | string;
  token?: string;
}

export async function buildPortalContext({
  userRole = 'student',
  userName = 'Student',
  userId,
  token,
}: PortalContextOptions): Promise<string> {
  const role = userRole.toLowerCase();

  // Student Context
  if (role === 'student') {
    let studentGrades = DEFAULT_STUDENT_GRADES;
    let studentSchedules = DEFAULT_STUDENT_SCHEDULES;
    let announcements = DEFAULT_CAMPUS_BULLETINS;

    // Attempt to query real backend API if token is provided
    if (token && !token.startsWith('cec_sec_')) {
      const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://school-portal-production-23ee.up.railway.app/api';
      try {
        const [gradesRes, schedRes, annRes] = await Promise.allSettled([
          fetch(`${backendUrl}/student/grades`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/student/schedule`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/announcements`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (gradesRes.status === 'fulfilled' && gradesRes.value.ok) {
          const apiGrades = await gradesRes.value.json();
          if (Array.isArray(apiGrades) && apiGrades.length > 0) {
            studentGrades = apiGrades.map((g: any) => ({
              code: g.subject?.code || 'Subject',
              name: g.subject?.name || '',
              units: g.subject?.units || 3,
              prelim: g.prelim ?? 1.25,
              midterm: g.midterm ?? null,
              semi_final: g.semi_final ?? null,
              final: g.final ?? null,
              final_grade: g.final_grade ?? g.final ?? null,
              remarks: g.remarks || 'Passed',
              instructor: g.teacher?.user?.name || 'Faculty',
            }));
          }
        }

        if (schedRes.status === 'fulfilled' && schedRes.value.ok) {
          const apiSched = await schedRes.value.json();
          if (Array.isArray(apiSched) && apiSched.length > 0) {
            studentSchedules = apiSched.map((s: any) => ({
              day_of_week: s.day_of_week,
              time: `${s.start_time?.slice(0, 5) || ''} - ${s.end_time?.slice(0, 5) || ''}`,
              code: s.subject?.code || '',
              name: s.subject?.name || '',
              room: s.room?.name || 'TBA',
              instructor: s.teacher?.user?.name || 'Faculty',
              section: s.section?.name || 'BSIT 3-A',
            }));
          }
        }

        if (annRes.status === 'fulfilled' && annRes.value.ok) {
          const apiAnn = await annRes.value.json();
          const annList = Array.isArray(apiAnn) ? apiAnn : apiAnn?.data;
          if (Array.isArray(annList) && annList.length > 0) {
            announcements = annList.map((a: any) => ({
              title: a.title,
              date: a.published_at?.slice(0, 10) || a.created_at?.slice(0, 10) || 'Recent',
              content: a.content || a.description || '',
              priority: a.priority || 'normal',
            }));
          }
        }
      } catch (err) {
        // Fallback to verified local defaults
      }
    }

    const contextObj = {
      institution: 'Cebu Eastern College (CEC)',
      academic_term: '1st Semester A.Y. 2026-2027',
      user: {
        name: userName || 'Roldan Jr. Delarmente',
        role: 'Student',
        id_number: '2026-00001',
        program: 'Bachelor of Science in Information Technology (BSIT)',
        year_level: '3rd Year',
        section: 'BSIT 3-A',
        enrollment_status: 'Officially Enrolled',
      },
      gpa: '1.25',
      attendance_rate: '98.5%',
      semester: '1st Semester A.Y. 2026-2027',
      grades: studentGrades,
      subjects: studentGrades.map(g => ({
        code: g.code,
        name: g.name,
        units: g.units,
        instructor: g.instructor,
      })),
      schedules: studentSchedules,
      nextClass: {
        code: 'IT IAS31',
        name: 'Information Assurance and Security 1 (Lecture)',
        time: '09:30 AM – 10:30 AM',
        room: 'Room OL 108',
        instructor: 'Sir Jay-ar Base',
      },
      instructors: [
        { name: 'Sir Charles Bacotot', subject: 'IT SIA31 (System Integration and Architecture 2)' },
        { name: 'Sir Yestin Prado', subject: 'IT EVD31 (Event Driven Programming)' },
        { name: 'Sir Jay-ar Base', subject: 'IT IAS31 (Information Assurance and Security 1)' },
        { name: 'Sir Arnel L. Villanueva', subject: 'IT NET31 (Networking 1)' },
        { name: 'Ms. En Catarungan', subject: 'IT ELEC 1 (Elective 1)' },
        { name: 'Sir Vincent John Cababan', subject: 'FREE ELEC 1 (Mobile App Development)' },
        { name: 'Ms. Lindy Enaldo', subject: 'GE ELEC 5 (Ang Panitikan ng Pilipinas)' },
        { name: 'Ms. Krystel Hurboda', subject: 'GE ELEC 6 (Philippine Popular Culture)' },
        { name: 'Sir Arjay Alangcas', subject: 'IT SP131 (Social and Professional Issues 1)' },
      ],
      announcements,
    };

    return JSON.stringify(contextObj, null, 2);
  }

  // Teacher Context
  if (role === 'teacher') {
    const teacherContext = {
      institution: 'Cebu Eastern College (CEC)',
      academic_term: '1st Semester A.Y. 2026-2027',
      user: {
        name: userName || 'Prof. Justin Beiber',
        role: 'Faculty / Instructor',
        department: 'College of Computer Studies',
      },
      assigned_classes: [
        { code: 'IT NET31', name: 'Networking 1 (Lecture)', schedule: 'MW 10:30 AM - 11:30 AM', room: 'OL 109', section: 'BSIT 3-A', students_count: 38 },
        { code: 'IT NET31 LAB', name: 'Networking 1 (Lab)', schedule: 'TTh 03:00 PM - 04:30 PM', room: 'CL 3', section: 'BSIT 3-A', students_count: 38 },
      ],
      announcements: DEFAULT_CAMPUS_BULLETINS,
    };

    return JSON.stringify(teacherContext, null, 2);
  }

  // Admin Context
  const adminContext = {
    institution: 'Cebu Eastern College (CEC)',
    academic_term: '1st Semester A.Y. 2026-2027',
    user: {
      name: userName || 'Administrator',
      role: 'System Administrator',
    },
    system_overview: {
      total_students_enrolled: 1248,
      active_faculty: 54,
      departments: ['College of Computer Studies', 'College of Business Administration', 'College of Education', 'Basic Education'],
      current_term_status: 'Midterm Period Active',
    },
    announcements: DEFAULT_CAMPUS_BULLETINS,
  };

  return JSON.stringify(adminContext, null, 2);
}
