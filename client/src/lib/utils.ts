import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  // Ensure we have a positive number and handle decimals properly
  const totalSeconds = Math.max(0, Math.floor(seconds));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}



export function formatTime(date: Date | string): string {
  const dateObj = new Date(date);
  
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date | string): string {
  const dateObj = new Date(date);
  
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  
  return `${month}/${day}/${year}`;
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

// دالة لتنسيق التوقيت والتاريخ معاً
export function formatDateTime(date: Date | string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// دالة لإنشاء Date object
export function createSyrianDate(date: Date | string): Date {
  return new Date(date);
}
