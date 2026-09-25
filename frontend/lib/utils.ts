import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timeString: string) {
  if (!timeString) return "";
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (['approved', 'present', 'paid', 'active'].includes(s)) return 'success';
  if (['pending', 'late', 'partial'].includes(s)) return 'warning';
  if (['failed', 'absent', 'unpaid', 'inactive', 'rejected'].includes(s)) return 'danger';
  if (['info', 'ongoing'].includes(s)) return 'info';
  return 'default';
}

export function getStatusLabel(status: string) {
  return capitalize(status);
}

export function gradeToRemarks(grade: number) {
  if (grade >= 90) return 'Excellent';
  if (grade >= 80) return 'Good';
  if (grade >= 75) return 'Passed';
  return 'Failed';
}

export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number) {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function formatTimeAgo(dateString?: string | Date | null): string {
  if (!dateString) return 'Just now';
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    
    if (isNaN(diffMs)) return 'Just now';

    // Account for potential slight clock skew between client and server
    if (diffMs < 0 && diffMs > -60000) {
      return 'Just now';
    }

    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) {
      return 'Just now';
    }
    if (diffMin === 1) {
      return '1 minute ago';
    }
    if (diffMin < 60) {
      return `${diffMin} minutes ago`;
    }
    if (diffHour === 1) {
      return '1 hour ago';
    }
    if (diffHour < 24) {
      return `${diffHour} hours ago`;
    }
    if (diffDay === 1) {
      return 'Yesterday';
    }
    if (diffDay < 7) {
      return `${diffDay} days ago`;
    }
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Just now';
  }
}
