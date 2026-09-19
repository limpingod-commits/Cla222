import { formatDayShort } from '../utils/date';
import type { TravelEvent } from '../types';
import { EVENT_TYPE_META } from '../types';

export default function DayStrip({
  days,
  activeDay,
  events,
  onSelect,
}: {
  days: string[];
  activeDay: string;
  events: TravelEvent[];
  onSelect: (day: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      {days.map((day, idx) => {
        const { weekday, day: dayNum } = formatDayShort(day);
        const dayEvents = events.filter((e) => e.start.slice(0, 10) === day);
        const isActive = day === activeDay;
        const dotColors = [...new Set(dayEvents.map((e) => EVENT_TYPE_META[e.type].color))].slice(0, 3);
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`flex min-w-14 flex-col items-center rounded-2xl px-3 py-2 transition-colors ${
              isActive ? 'bg-white text-black' : 'bg-white/5 text-white/70'
            }`}
          >
            <span className="text-[10px] font-medium uppercase opacity-70">{weekday}</span>
            <span className="text-lg font-bold">{dayNum}</span>
            <span className="mt-0.5 text-[9px] opacity-60">G{idx + 1}</span>
            <div className="mt-1 flex h-1.5 gap-0.5">
              {dotColors.map((c) => (
                <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
