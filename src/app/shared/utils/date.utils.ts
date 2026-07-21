export const PT_BR_LOCALE = 'pt-BR';

export function parseLocalDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + distanceToMonday);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat(PT_BR_LOCALE).format(parseLocalDate(date));
}

export function formatHours(value: number): string {
  return new Intl.NumberFormat(PT_BR_LOCALE, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 2
  }).format(value);
}
