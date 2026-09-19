import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import TripsHome from './components/TripsHome';
import TripView from './components/TripView';
import { checkAndFireReminders } from './utils/reminders';

export default function App() {
  const { loadTrips, trips, loaded, eventsByTrip } = useStore();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    const interval = setInterval(() => {
      const all = Object.values(eventsByTrip).flat();
      checkAndFireReminders(all);
    }, 30_000);
    return () => clearInterval(interval);
  }, [eventsByTrip]);

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-white/60">
        Caricamento…
      </div>
    );
  }

  const activeTrip = trips.find((t) => t.id === activeTripId) ?? null;

  if (activeTrip) {
    return <TripView trip={activeTrip} onBack={() => setActiveTripId(null)} />;
  }

  return <TripsHome onOpenTrip={(id) => setActiveTripId(id)} />;
}
