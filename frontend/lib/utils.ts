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
