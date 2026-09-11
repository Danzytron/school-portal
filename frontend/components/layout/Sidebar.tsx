"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  ClipboardList, 
  CreditCard, 
  FolderOpen, 
  Megaphone, 
  Settings,
  Users,
  UserCheck,
  Building2,
  BarChart3,
  LogOut,
  Clock,
  X
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

export function Sidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose?: () => void; 
}) {
  const { user, isStudent, isTeacher, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  const getNavItems = (): { section: string; items: NavItem[] }[] => {
    if (isStudent) {
      return [
        {
          section: "Dashboard",
          items: [
            { href: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
          ]
        },
        {
          section: "Academic",
          items: [
            { href: "/student/schedule", label: "Class Schedule", icon: Calendar },
            { href: "/student/grades", label: "Grade Report", icon: GraduationCap },
            { href: "/student/subjects", label: "Enrolled Courses", icon: BookOpen },
            { href: "/student/enrollment", label: "Course Plan & Curriculum", icon: FileText },
          ]
        },
        {
          section: "Student",
          items: [
            { href: "/student/profile", label: "Student Profile", icon: User },
            { href: "/student/enrollment", label: "Registration / Advising", icon: FileText, badge: "Open" },
            { href: "/student/attendance", label: "Attendance Record", icon: ClipboardList },
          ]
        },
        {
          section: "Financial",
          items: [
            { href: "/student/fees", label: "Statement of Account", icon: CreditCard },
          ]
        },
        {
          section: "Services",
          items: [
            { href: "/student/announcements", label: "Announcements & Advisories", icon: Megaphone },
            { href: "/student/documents", label: "Document Requests", icon: FolderOpen },
          ]
        },
        {
          section: "Account",
          items: [
            { href: "/student/settings", label: "Account Settings", icon: Settings },
          ]
        }
      ];
    }
    if (isTeacher) {
      return [
        {
          section: "Dashboard",
          items: [
            { href: "/teacher/dashboard", label: "Overview", icon: LayoutDashboard },
          ]
        },
        {
          section: "Instructional",
          items: [
            { href: "/teacher/schedule", label: "Faculty Schedule", icon: Calendar },
            { href: "/teacher/subjects", label: "Assigned Courses", icon: BookOpen },
            { href: "/teacher/students", label: "Student Roster", icon: Users },
            { href: "/teacher/grades", label: "Grade Submissions", icon: GraduationCap },
            { href: "/teacher/attendance", label: "Daily Attendance", icon: ClipboardList },
            { href: "/teacher/documents", label: "Course Syllabi & Docs", icon: FolderOpen },
          ]
        },
        {
          section: "Faculty Portal",
          items: [
            { href: "/teacher/profile", label: "Faculty Profile", icon: User },
            { href: "/teacher/announcements", label: "Class Announcements", icon: Megaphone },
            { href: "/teacher/settings", label: "Account Settings", icon: Settings },
          ]
        }
      ];
    }
    if (isAdmin) {
      return [
        {
          section: "Dashboard",
          items: [
            { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
          ]
        },
        {
          section: "Academic Registry",
          items: [
            { href: "/admin/students", label: "Student Registry", icon: Users },
            { href: "/admin/teachers", label: "Faculty Directory", icon: UserCheck },
            { href: "/admin/users", label: "System Accounts", icon: User },
          ]
        },
        {
          section: "Curriculum & Facilities",
          items: [
            { href: "/admin/courses", label: "Degree Programs", icon: GraduationCap },
            { href: "/admin/subjects", label: "Course Catalog", icon: BookOpen },
            { href: "/admin/sections", label: "Class Sections", icon: Building2 },
            { href: "/admin/rooms", label: "Room Allocations", icon: Building2 },
            { href: "/admin/schedules", label: "Master Timetable", icon: Calendar },
            { href: "/admin/semesters", label: "Academic Terms", icon: Clock },
          ]
        },
        {
          section: "Registrar Operations",
          items: [
            { href: "/admin/enrollment", label: "Enrollment Approvals", icon: FileText },
            { href: "/admin/grades", label: "Grade Auditing", icon: GraduationCap },
            { href: "/admin/attendance", label: "Campus Attendance", icon: ClipboardList },
            { href: "/admin/fees", label: "Tuition Ledgers", icon: CreditCard },
            { href: "/admin/reports", label: "Academic Reports", icon: BarChart3 },
            { href: "/admin/announcements", label: "Official Bulletins", icon: Megaphone },
            { href: "/admin/settings", label: "System Configuration", icon: Settings },
          ]
        }
      ];
    }
    return [];
  };

  const navGroups = getNavItems();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-[240px] bg-[#1E3A8A] text-white border-r border-[#1E40AF]/60 overflow-y-auto transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } z-30 flex flex-col shadow-md lg:shadow-none select-none font-sans`}
    >
      {/* Institutional Crest & Brand Top Header */}
      <div className="h-[56px] px-4 bg-[#172554] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img 
            src="/cec-logo.png" 
            alt="Cebu Eastern College" 
            className="w-8 h-8 object-contain rounded-full bg-white p-0.5 shrink-0" 
          />
          <div className="min-w-0">
            <div className="font-semibold text-xs tracking-tight text-white leading-tight truncate">
              CEBU EASTERN COLLEGE
            </div>
            <div className="text-[10px] text-blue-200 uppercase tracking-wider leading-none mt-0.5 font-medium">
              Student Information System
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden text-blue-200 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close Sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* User Compact Dossier Capsule */}
      <div className="px-3.5 py-3 bg-[#1E3A8A] border-b border-blue-900/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#2563EB] text-white flex items-center justify-center font-semibold text-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user?.name || 'Student Portal'}
            </div>
            <div className="text-[10px] text-blue-200 font-mono mt-0.5 truncate">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'teacher' ? 'Faculty ID' : 'SN: 2026-00001'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.section && (
              <div className="px-2.5 pb-1 text-[10px] font-semibold text-blue-300/90 uppercase tracking-wider">
                {group.section}
              </div>
            )}
            
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/student/dashboard' && item.href !== '/teacher/dashboard' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? "bg-[#2563EB] text-white font-semibold"
                        : "text-blue-100 hover:bg-white/10 hover:text-white font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon 
                        size={15} 
                        className={`shrink-0 ${isActive ? "text-white" : "text-blue-300"}`} 
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="bg-emerald-600 text-white text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer with Logout Action */}
      <div className="p-2.5 border-t border-blue-900/60 bg-[#172554]/60 shrink-0">
        <button
          onClick={() => {
            onClose?.();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-blue-200 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
        >
          <LogOut size={15} className="text-blue-300 shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
