import { format, parseISO, isValid, differenceInCalendarDays, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatDay(dateStr: string) {
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, 'EEE d MMM', { locale: it });
}

export function formatDayShort(dateStr: string) {
  const d = parseISO(dateStr);
  if (!isValid(d)) return { weekday: '', day: dateStr };
  return { weekday: format(d, 'EEE', { locale: it }), day: format(d, 'd') };
}

export function formatTime(dateTimeStr?: string) {
  if (!dateTimeStr) return '';
  const d = parseISO(dateTimeStr);
  if (!isValid(d)) return '';
  return format(d, 'HH:mm');
}

export function formatDateTimeInput(dateTimeStr?: string) {
  if (!dateTimeStr) return '';
  const d = parseISO(dateTimeStr);
  if (!isValid(d)) return '';
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function dateOfEvent(startIso: string) {
  return startIso.slice(0, 10);
}

export function tripDays(startDate: string, endDate: string): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isValid(start) || !isValid(end)) return [];
  const days: string[] = [];
  const total = Math.max(0, differenceInCalendarDays(end, start));
  for (let i = 0; i <= total; i++) {
    days.push(format(addDays(start, i), 'yyyy-MM-dd'));
  }
  return days;
}

export function formatTripRange(startDate: string, endDate: string) {
  const s = parseISO(startDate);
  const e = parseISO(endDate);
  if (!isValid(s) || !isValid(e)) return '';
  return `${format(s, 'd MMM', { locale: it })} – ${format(e, 'd MMM yyyy', { locale: it })}`;
}
