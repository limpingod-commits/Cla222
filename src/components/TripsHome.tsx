import { useState } from 'react';
import { Plus, MapPin, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatTripRange } from '../utils/date';
import TripModal from './TripModal';
import SettingsSheet from './SettingsSheet';
import type { Trip } from '../types';

export default function TripsHome({ onOpenTrip }: { onOpenTrip: (id: string) => void }) {
  const trips = useStore((s) => s.trips);
  const [showModal, setShowModal] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top flex items-center justify-between px-5 pb-2 pt-6">
        <div>
          <p className="text-sm text-white/50">I tuoi viaggi</p>
          <h1 className="text-2xl font-bold">✈️ Travel Planner</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="rounded-full bg-white/10 p-2.5 text-white/80 active:scale-95"
        >
          <Settings size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-2">
        {trips.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center text-white/50">
            <MapPin size={40} className="mb-3 opacity-60" />
            <p className="text-lg font-medium text-white/70">Nessun viaggio ancora</p>
            <p className="mt-1 text-sm">Crea il tuo primo viaggio per iniziare a pianificare</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenTrip(trip.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpenTrip(trip.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setEditTrip(trip);
              }}
              className="relative overflow-hidden rounded-3xl p-5 text-left shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${trip.color}dd, ${trip.color}55)`,
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                {formatTripRange(trip.startDate, trip.endDate)}
              </p>
              <h2 className="mt-1 text-xl font-bold">{trip.name}</h2>
              {trip.destination && (
                <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                  <MapPin size={14} /> {trip.destination}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditTrip(trip);
                }}
                className="absolute right-4 top-4 rounded-full bg-black/20 px-3 py-1 text-xs text-white/80"
              >
                Modifica
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="safe-bottom fixed bottom-6 right-5 flex items-center gap-2 rounded-full bg-white px-5 py-3.5 font-semibold text-black shadow-xl active:scale-95"
      >
        <Plus size={20} /> Nuovo viaggio
      </button>

      {showModal && (
        <TripModal
          onClose={() => setShowModal(false)}
          onOpenAfterSave={(id) => {
            setShowModal(false);
            onOpenTrip(id);
          }}
        />
      )}
      {editTrip && (
        <TripModal
          trip={editTrip}
          onClose={() => setEditTrip(null)}
          onOpenAfterSave={(id) => {
            setEditTrip(null);
            onOpenTrip(id);
          }}
        />
      )}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  );
}
