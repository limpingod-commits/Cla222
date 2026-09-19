import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { EventType, Trip, TravelEvent } from '../types';
import { tripDays, formatTripRange } from '../utils/date';
import DayStrip from './DayStrip';
import Timeline from './Timeline';
import BottomActionBar from './BottomActionBar';
import EventModal from './EventModal';
import DocumentsVault from './DocumentsVault';
import SettingsSheet from './SettingsSheet';

export default function TripView({ trip, onBack }: { trip: Trip; onBack: () => void }) {
  const { loadTrip, eventsByTrip } = useStore();
  const [tab, setTab] = useState<'timeline' | 'documents'>('timeline');
  const [activeDay, setActiveDay] = useState<string>(trip.startDate);
  const [eventDraft, setEventDraft] = useState<{ type: EventType; date: string } | null>(null);
  const [editingEvent, setEditingEvent] = useState<TravelEvent | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const days = useMemo(() => tripDays(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);
  const events = eventsByTrip[trip.id] ?? [];
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadTrip(trip.id);
  }, [trip.id, loadTrip]);

  function scrollToDay(day: string) {
    setActiveDay(day);
    dayRefs.current[day]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex h-full flex-col">
      <header
        className="safe-top px-5 pb-3 pt-6"
        style={{ background: `linear-gradient(180deg, ${trip.color}33, transparent)` }}
      >
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="rounded-full bg-white/10 p-2.5 active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-full bg-white/10 p-2.5 active:scale-95"
          >
            <Settings size={20} />
          </button>
        </div>
        <h1 className="mt-3 text-2xl font-bold">{trip.name}</h1>
        <p className="text-sm text-white/60">{formatTripRange(trip.startDate, trip.endDate)}</p>

        <div className="mt-4 flex gap-2 rounded-full bg-white/5 p-1">
          {(['timeline', 'documents'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-black' : 'text-white/60'
              }`}
            >
              {t === 'timeline' ? 'Itinerario' : 'Documenti'}
            </button>
          ))}
        </div>
      </header>

      {tab === 'timeline' ? (
        <>
          <DayStrip days={days} activeDay={activeDay} events={events} onSelect={scrollToDay} />
          <Timeline
            days={days}
            events={events}
            dayRefs={dayRefs}
            onActiveDayChange={setActiveDay}
            onEditEvent={setEditingEvent}
          />
          <BottomActionBar
            onQuickAdd={(type) => setEventDraft({ type, date: activeDay })}
            onOpenDocuments={() => setTab('documents')}
          />
        </>
      ) : (
        <DocumentsVault tripId={trip.id} />
      )}

      {(eventDraft || editingEvent) && (
        <EventModal
          tripId={trip.id}
          initialType={eventDraft?.type}
          initialDate={eventDraft?.date}
          event={editingEvent ?? undefined}
          onClose={() => {
            setEventDraft(null);
            setEditingEvent(null);
          }}
        />
      )}

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  );
}
