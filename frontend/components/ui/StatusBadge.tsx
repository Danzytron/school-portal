import React from "react";

interface StatusBadgeProps {
  status: string;
  label?: string;
  type?: string;
  variant?: string;
}

export function StatusBadge({ status, label, type, variant }: StatusBadgeProps) {
  const rawStatus = (status || type || variant || "default").toString().toLowerCase();

  const getBadgeStyle = (st: string) => {
    // Passed / Good Standing / Honors
    if (st.includes('passed') || st.includes('pass') || st.includes('honor') || st.includes('dean')) {
      return "bg-blue-50 text-[#1D4ED8] border-blue-200";
    }
    // Approved / Active / Enrolled / Paid / Present
    if (st.includes('approved') || st.includes('active') || st.includes('enrolled') || st.includes('paid') || st.includes('present') || st.includes('yes')) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    // Pending / Draft / In Progress / Partial / Late / INC (Incomplete)
    if (st.includes('pending') || st.includes('draft') || st.includes('partial') || st.includes('late') || st.includes('inc') || st.includes('progress')) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    // Failed / Rejected / Absent / Unpaid / Inactive / DRP (Dropped)
    if (st.includes('failed') || st.includes('rejected') || st.includes('absent') || st.includes('unpaid') || st.includes('inactive') || st.includes('drp') || st.includes('no')) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    // Info / Excused
    if (st.includes('info') || st.includes('excused')) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formattedLabel = label || rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border leading-tight ${getBadgeStyle(rawStatus)}`}>
      {formattedLabel}
    </span>
  );
}

export default StatusBadge;
