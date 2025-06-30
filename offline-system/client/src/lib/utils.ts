import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ar-SA', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getCarBrandInArabic(brand: string): string {
  const brandMap: Record<string, string> = {
    'audi': 'أودي',
    'seat': 'سيات',
    'skoda': 'سكودا',
    'volkswagen': 'فولكس فاجن',
  };
  
  return brandMap[brand] || brand;
}

export function getWorkerCategoryInArabic(category: string): string {
  const categoryMap: Record<string, string> = {
    'technician': 'فني',
    'assistant': 'مساعد',
    'supervisor': 'مشرف',
    'trainee_technician': 'فني تحت الإشراف',
  };
  
  return categoryMap[category] || category;
}

export function getTaskStatusInArabic(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'قيد التنفيذ',
    'paused': 'متوقفة',
    'completed': 'مكتملة',
    'archived': 'مؤرشفة',
  };
  
  return statusMap[status] || status;
}

export function getTaskStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'active': 'bg-red-100 text-red-800',
    'paused': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'archived': 'bg-blue-100 text-blue-800',
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
