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
  HelpCircle,
  Clock,
  X,
  ChevronRight
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

  const getNavItems = (): NavItem[] => {
    if (isStudent) {
      return [
        { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/student/subjects", label: "My Courses", icon: BookOpen },
        { href: "/student/schedule", label: "Schedule & Timetable", icon: Calendar },
        { href: "/student/enrollment", label: "Assignments & Submissions", icon: ClipboardList },
        { href: "/student/grades", label: "Grades & Transcripts", icon: GraduationCap },
        { href: "/student/documents", label: "Campus Resources", icon: Building2 },
        { href: "/student/settings", label: "Settings & Help", icon: HelpCircle },
      ];
    }
    if (isTeacher) {
      return [
        { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/teacher/subjects", label: "My Courses", icon: BookOpen },
        { href: "/teacher/schedule", label: "Schedule & Timetable", icon: Calendar },
        { href: "/teacher/students", label: "Class List & Students", icon: Users },
        { href: "/teacher/grades", label: "Grades Management", icon: GraduationCap },
        { href: "/teacher/attendance", label: "Attendance Entry", icon: ClipboardList },
        { href: "/teacher/documents", label: "Campus Resources", icon: Building2 },
        { href: "/teacher/settings", label: "Settings & Help", icon: HelpCircle },
      ];
    }
    if (isAdmin) {
      return [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/students", label: "Student Records", icon: Users },
        { href: "/admin/teachers", label: "Faculty Directory", icon: UserCheck },
        { href: "/admin/courses", label: "Degree Programs", icon: GraduationCap },
        { href: "/admin/subjects", label: "Course Catalog", icon: BookOpen },
        { href: "/admin/schedules", label: "Master Timetable", icon: Calendar },
        { href: "/admin/enrollment", label: "Enrollment Approvals", icon: FileText },
        { href: "/admin/grades", label: "Grade Submissions", icon: GraduationCap },
        { href: "/admin/fees", label: "Finance & Accounts", icon: CreditCard },
        { href: "/admin/settings", label: "Settings & Help", icon: HelpCircle },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-[220px] bg-white text-slate-800 border-r border-slate-200/80 overflow-y-auto transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } z-30 flex flex-col shadow-lg lg:shadow-none select-none font-sans`}
    >
      {/* Brand Top Header */}
      <div className="h-[64px] px-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <Link 
          href={isTeacher ? "/teacher/dashboard" : isAdmin ? "/admin/dashboard" : "/student/dashboard"} 
          className="flex items-center gap-2.5 min-w-0 group"
        >
          <img 
            src="/cec-logo.png" 
            alt="Cebu Eastern College" 
            className="w-8 h-8 object-contain rounded-xl shrink-0 transition-transform group-hover:scale-105" 
          />
          <div className="min-w-0">
            <div className="font-heading font-extrabold text-[13px] tracking-tight text-slate-900 leading-tight truncate">
              CEC School Portal
            </div>
            <div className="text-[10px] text-[#2563EB] font-bold tracking-wider leading-none mt-0.5 uppercase">
              School Portal System
            </div>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close Sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links (Clean Single List matching Reference) */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (
            item.href !== '/student/dashboard' && 
            item.href !== '/teacher/dashboard' && 
            item.href !== '/admin/dashboard' && 
            pathname.startsWith(item.href)
          );
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
              className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-[13px] font-medium transition-all ${
                isActive 
                  ? 'bg-[#2563EB] text-white font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.25)]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon 
                  size={18} 
                  className={`shrink-0 transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`} 
                />
                <span className="truncate">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Compact Dossier Capsule at Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center font-heading font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">
                {user?.name ? user.name.split(' ')[0] : 'User'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize truncate">
                {user?.role || 'Student'}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
