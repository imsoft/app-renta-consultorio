import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear fechas en formato DD/MM/AAAA
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Función para formatear moneda en pesos mexicanos
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Función para formatear números con comas para mejor lectura
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('es-MX').format(number);
}

// Función para formatear fechas y horas en formato DD/MM/AAAA HH:MM
export function formatDateTime(dateString: string, timeString?: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (timeString) {
    return `${day}/${month}/${year} ${timeString}`;
  }
  
  return `${day}/${month}/${year}`;
}
