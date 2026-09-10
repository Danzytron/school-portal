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
      return "text-green-700 bg-green-50 border-green-200";
    }
    // Approved / Active / Enrolled / Paid / Present
    if (st.includes('approved') || st.includes('active') || st.includes('enrolled') || st.includes('paid') || st.includes('present') || st.includes('yes')) {
      return "text-green-700 bg-green-50 border-green-200";
    }
    // Pending / Draft / In Progress / Partial / Late / INC (Incomplete)
    if (st.includes('pending') || st.includes('draft') || st.includes('partial') || st.includes('late') || st.includes('inc') || st.includes('progress')) {
      return "text-amber-700 bg-amber-50 border-amber-200";
    }
    // Failed / Rejected / Absent / Unpaid / Inactive / DRP (Dropped)
    if (st.includes('failed') || st.includes('rejected') || st.includes('absent') || st.includes('unpaid') || st.includes('inactive') || st.includes('drp') || st.includes('no')) {
      return "text-red-700 bg-red-50 border-red-200";
    }
    // Info / Excused
    if (st.includes('info') || st.includes('excused')) {
      return "text-blue-700 bg-blue-50 border-blue-200";
    }
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const formattedLabel = label || rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium border leading-tight ${getBadgeStyle(rawStatus)}`}>
      {formattedLabel}
    </span>
  );
}

export default StatusBadge;
