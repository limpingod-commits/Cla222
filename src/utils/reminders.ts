import type { TravelEvent } from '../types';

const notifiedKey = 'travel-planner:notified-events';

function getNotified(): Set<string> {
  try {
    const raw = localStorage.getItem(notifiedKey);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveNotified(set: Set<string>) {
  try {
    localStorage.setItem(notifiedKey, JSON.stringify([...set]));
  } catch {
    // ignore storage errors
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported' as const;
  if (Notification.permission === 'granted') return 'granted' as const;
  if (Notification.permission === 'denied') return 'denied' as const;
  const result = await Notification.requestPermission();
  return result;
}

export function checkAndFireReminders(allEvents: TravelEvent[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  const notified = getNotified();
  let changed = false;

  for (const event of allEvents) {
    if (!event.reminderMinutesBefore) continue;
    const startMs = new Date(event.start).getTime();
    if (Number.isNaN(startMs)) continue;
    const triggerAt = startMs - event.reminderMinutesBefore * 60_000;
    const key = `${event.id}:${event.updatedAt}`;
    if (notified.has(key)) continue;
    if (now >= triggerAt && now < startMs + 60_000) {
      new Notification(event.title, {
        body: `Tra poco: ${event.title}${event.location ? ' · ' + event.location : ''}`,
        tag: event.id,
      });
      notified.add(key);
      changed = true;
    }
  }
  if (changed) saveNotified(notified);
}
