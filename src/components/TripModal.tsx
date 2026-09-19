import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Trip } from '../types';

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function TripModal({
  trip,
  onClose,
  onOpenAfterSave,
}: {
  trip?: Trip;
  onClose: () => void;
  onOpenAfterSave?: (id: string) => void;
}) {
  const { createTrip, updateTrip, deleteTrip } = useStore();
  const [name, setName] = useState(trip?.name ?? '');
  const [destination, setDestination] = useState(trip?.destination ?? '');
  const [startDate, setStartDate] = useState(trip?.startDate ?? '');
  const [endDate, setEndDate] = useState(trip?.endDate ?? '');
  const [color, setColor] = useState(trip?.color ?? COLORS[0]);

  const canSave = name.trim() && startDate && endDate && startDate <= endDate;

  async function handleSave() {
    if (!canSave) return;
    if (trip) {
      await updateTrip(trip.id, { name, destination, startDate, endDate, color });
      onOpenAfterSave?.(trip.id);
    } else {
      const created = await createTrip({ name, destination, startDate, endDate, color });
      onOpenAfterSave?.(created.id);
    }
    onClose();
  }

  async function handleDelete() {
    if (!trip) return;
    if (confirm(`Eliminare il viaggio "${trip.name}"? Verranno eliminati anche eventi e documenti.`)) {
      await deleteTrip(trip.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-[#141a2e] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{trip ? 'Modifica viaggio' : 'Nuovo viaggio'}</h2>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            className="rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none"
            placeholder="Nome viaggio (es. Giappone 2026)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none"
            placeholder="Destinazione (opzionale)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <div className="flex gap-3">
            <label className="flex-1 text-sm text-white/60">
              Dal
              <input
                type="date"
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-white outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className="flex-1 text-sm text-white/60">
              Al
              <input
                type="date"
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-white outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm text-white/60">Colore</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-9 w-9 rounded-full ring-offset-2 ring-offset-[#141a2e]"
                  style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="mt-2 rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-40"
          >
            Salva
          </button>

          {trip && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 py-3 font-medium text-red-400"
            >
              <Trash2 size={16} /> Elimina viaggio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
