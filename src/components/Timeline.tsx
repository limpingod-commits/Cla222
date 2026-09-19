import { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import type { TravelEvent } from '../types';
import EventCard from './EventCard';

export default function Timeline({
  days,
  events,
  dayRefs,
  onActiveDayChange,
  onEditEvent,
}: {
  days: string[];
  events: TravelEvent[];
  dayRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onActiveDayChange: (day: string) => void;
  onEditEvent: (event: TravelEvent) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const day = visible[0].target.getAttribute('data-day');
          if (day) onActiveDayChange(day);
        }
      },
      { root: container, threshold: 0, rootMargin: '0px 0px -75% 0px' }
    );
    Object.values(dayRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [days, dayRefs, onActiveDayChange]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 pb-4">
      <div className="flex flex-col gap-6">
        {days.map((day, idx) => {
          const dayEvents = events.filter((e) => e.start.slice(0, 10) === day);
          const d = parseISO(day);
          return (
            <div
              key={day}
              data-day={day}
              ref={(el) => {
                dayRefs.current[day] = el;
              }}
              className="scroll-mt-2"
            >
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-lg font-bold">Giorno {idx + 1}</span>
                <span className="text-sm text-white/50">
                  {format(d, 'EEEE d MMMM', { locale: it })}
                </span>
              </div>

              {dayEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/30">
                  Nessun evento — usa i pulsanti qui sotto per aggiungerne uno
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayEvents.map((event) => (
                    <EventCard key={event.id} event={event} onClick={() => onEditEvent(event)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
