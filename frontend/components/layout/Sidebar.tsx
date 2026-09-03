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
  MessageSquare, 
  Settings,
  Users,
  UserCheck,
  Building2,
  BarChart3,
  LogOut,
  HelpCircle,
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
          section: "Main",
          items: [
            { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/student/profile", label: "Student Profile", icon: User },
          ]
        },
        {
          section: "Academic",
          items: [
            { href: "/student/schedule", label: "Schedule", icon: Calendar },
            { href: "/student/grades", label: "Grade Report", icon: GraduationCap },
            { href: "/student/subjects", label: "Enrolled Courses", icon: BookOpen },
            { href: "/student/enrollment", label: "Course Plan", icon: FileText, badge: "Open" },
            { href: "/student/attendance", label: "Attendance", icon: ClipboardList },
            { href: "/student/documents", label: "Libraries & Docs", icon: FolderOpen },
          ]
        },
        {
          section: "Administrative",
          items: [
            { href: "/student/fees", label: "Finance & Fees", icon: CreditCard },
            { href: "/student/announcements", label: "Announcements", icon: Megaphone },
            { href: "/student/announcements?filter=notices", label: "Messages", icon: MessageSquare },
          ]
        },
        {
          section: "Settings",
          items: [
            { href: "/student/settings", label: "Account Settings", icon: Settings },
          ]
        }
      ];
    }
    if (isTeacher) {
      return [
        {
          section: "Main",
          items: [
            { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/teacher/profile", label: "Faculty Profile", icon: User },
          ]
        },
        {
          section: "Academic",
          items: [
            { href: "/teacher/schedule", label: "Teaching Schedule", icon: Calendar },
            { href: "/teacher/subjects", label: "Assigned Classes", icon: BookOpen },
            { href: "/teacher/students", label: "Class Roster", icon: Users },
            { href: "/teacher/grades", label: "Grade Management", icon: GraduationCap },
            { href: "/teacher/attendance", label: "Attendance Entry", icon: ClipboardList },
            { href: "/teacher/documents", label: "Course Documents", icon: FolderOpen },
          ]
        },
        {
          section: "Administrative",
          items: [
            { href: "/teacher/announcements", label: "Announcements", icon: Megaphone },
            { href: "/teacher/settings", label: "Account Settings", icon: Settings },
          ]
        }
      ];
    }
    if (isAdmin) {
      return [
        {
          section: "Main",
          items: [
            { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/students", label: "Student Records", icon: Users },
            { href: "/admin/teachers", label: "Faculty Directory", icon: UserCheck },
            { href: "/admin/users", label: "User Accounts", icon: User },
          ]
        },
        {
          section: "Curriculum",
          items: [
            { href: "/admin/courses", label: "Degree Programs", icon: GraduationCap },
            { href: "/admin/subjects", label: "Course Catalog", icon: BookOpen },
            { href: "/admin/sections", label: "Class Sections", icon: Building2 },
            { href: "/admin/rooms", label: "Facility Directory", icon: Building2 },
            { href: "/admin/schedules", label: "Master Timetable", icon: Calendar },
            { href: "/admin/semesters", label: "Academic Terms", icon: Clock },
          ]
        },
        {
          section: "Operations",
          items: [
            { href: "/admin/enrollment", label: "Enrollment Approvals", icon: FileText },
            { href: "/admin/grades", label: "Grade Submissions", icon: GraduationCap },
            { href: "/admin/attendance", label: "Campus Attendance", icon: ClipboardList },
            { href: "/admin/fees", label: "Fees & Treasury", icon: CreditCard },
            { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
            { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
            { href: "/admin/settings", label: "System Settings", icon: Settings },
          ]
        }
      ];
    }
    return [];
  };

  const navGroups = getNavItems();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-[240px] bg-[#1E3A8A] text-white border-r border-[#1E40AF]/60 overflow-y-auto transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } z-30 flex flex-col shadow-lg lg:shadow-none select-none`}
    >
      {/* Institutional Crest & Brand Top Header */}
      <div className="h-[60px] px-4 bg-[#172554] border-b border-[#1E3A8A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img 
            src="/cec-logo.jpg" 
            alt="Cebu Eastern College" 
            className="w-8 h-8 object-contain rounded-full bg-white p-0.5 ring-1 ring-blue-300/40 shrink-0" 
          />
          <div className="min-w-0">
            <div className="font-heading font-bold text-[11px] sm:text-xs tracking-tight text-white leading-tight truncate">
              CEBU EASTERN COLLEGE
            </div>
            <div className="text-[10px] text-blue-200 uppercase tracking-wider leading-none mt-0.5 font-sans font-medium">
              SCHOOL PORTAL
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden text-blue-200 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close Sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* User Compact Dossier Capsule */}
      <div className="px-4 py-3 bg-[#1E3A8A] border-b border-blue-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-heading font-bold text-xs shadow-2xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate font-sans">
              {user?.name || 'Student Portal'}
            </div>
            <div className="text-[10px] text-blue-200 font-mono flex items-center gap-1 mt-0.5">
              <span>{user?.role === 'admin' ? 'Administrator' : user?.role === 'teacher' ? 'Faculty ID' : 'SN: 2026-00001'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.section && (
              <div className="px-3 pb-1.5 text-[10px] font-bold text-[#93C5FD] uppercase tracking-wider font-sans">
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-2xs font-semibold"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon 
                        size={16} 
                        className={`shrink-0 ${isActive ? "text-white" : "text-blue-200"}`} 
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs">
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
      <div className="p-3 border-t border-blue-800/60 bg-[#172554]/50 shrink-0">
        <button
          onClick={() => {
            onClose?.();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={16} className="text-blue-300 shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
