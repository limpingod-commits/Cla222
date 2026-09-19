import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { EventType, TravelEvent, TravelEventDetails } from '../types';
import { EVENT_TYPE_META } from '../types';
import { EventTypeIcon } from '../utils/icons';
import { formatDateTimeInput } from '../utils/date';
import AttachmentPicker from './AttachmentPicker';

const REMINDER_OPTIONS = [
  { label: 'Nessuno', value: undefined },
  { label: '30 minuti prima', value: 30 },
  { label: '1 ora prima', value: 60 },
  { label: '2 ore prima', value: 120 },
  { label: '3 ore prima', value: 180 },
  { label: '1 giorno prima', value: 1440 },
];

function defaultStart(date?: string) {
  const base = date ?? new Date().toISOString().slice(0, 10);
  return `${base}T09:00`;
}

export default function EventModal({
  tripId,
  initialType,
  initialDate,
  event,
  onClose,
}: {
  tripId: string;
  initialType?: EventType;
  initialDate?: string;
  event?: TravelEvent;
  onClose: () => void;
}) {
  const { createEvent, updateEvent, deleteEvent } = useStore();
  const [type, setType] = useState<EventType>(event?.type ?? initialType ?? 'flight');
  const [customTypeLabel, setCustomTypeLabel] = useState(event?.customTypeLabel ?? '');
  const [title, setTitle] = useState(event?.title ?? '');
  const [start, setStart] = useState(formatDateTimeInput(event?.start) || defaultStart(initialDate));
  const [end, setEnd] = useState(formatDateTimeInput(event?.end));
  const [location, setLocation] = useState(event?.location ?? '');
  const [notes, setNotes] = useState(event?.notes ?? '');
  const [details, setDetails] = useState<TravelEventDetails>(event?.details ?? {});
  const [reminder, setReminder] = useState<number | undefined>(event?.reminderMinutesBefore);

  const meta = EVENT_TYPE_META[type];
  const canSave = title.trim() && start;

  function setDetail(key: keyof TravelEventDetails, value: string) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    if (!canSave) return;
    const payload = {
      tripId,
      type,
      customTypeLabel: type === 'custom' ? customTypeLabel : undefined,
      title: title.trim(),
      start: new Date(start).toISOString(),
      end: end ? new Date(end).toISOString() : undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      details,
      reminderMinutesBefore: reminder,
    };
    if (event) {
      await updateEvent(event.id, payload);
    } else {
      await createEvent(payload);
    }
    onClose();
  }

  async function handleDelete() {
    if (!event) return;
    if (confirm('Eliminare questo evento?')) {
      await deleteEvent(event.id, tripId);
      onClose();
    }
  }

  const inputClass = 'rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-[#141a2e] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: `${meta.color}33`, color: meta.color }}
            >
              <EventTypeIcon type={type} size={18} />
            </div>
            <h2 className="text-lg font-bold">{event ? 'Modifica evento' : `Nuovo: ${meta.label}`}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2">
            <X size={18} />
          </button>
        </div>

        {!initialType && !event && (
          <div className="mb-3 flex flex-wrap gap-2">
            {(Object.keys(EVENT_TYPE_META) as EventType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: type === t ? EVENT_TYPE_META[t].color : '#ffffff1a',
                  color: type === t ? '#0b1020' : '#ffffffcc',
                }}
              >
                {EVENT_TYPE_META[t].label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {type === 'custom' && (
            <input
              className={inputClass}
              placeholder="Etichetta personalizzata (es. Traghetto)"
              value={customTypeLabel}
              onChange={(e) => setCustomTypeLabel(e.target.value)}
            />
          )}

          <input
            className={inputClass}
            placeholder="Titolo (es. Volo AZ123 Roma → Tokyo)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex gap-3">
            <label className="flex-1 text-sm text-white/60">
              Inizio
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-white outline-none"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label className="flex-1 text-sm text-white/60">
              Fine (opz.)
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-white outline-none"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>

          <input
            className={inputClass}
            placeholder="Luogo"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {type === 'flight' && (
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Compagnia aerea" value={details.airline ?? ''} onChange={(e) => setDetail('airline', e.target.value)} />
              <input className={inputClass} placeholder="Numero volo" value={details.flightNumber ?? ''} onChange={(e) => setDetail('flightNumber', e.target.value)} />
              <input className={inputClass} placeholder="Aeroporto partenza" value={details.departureAirport ?? ''} onChange={(e) => setDetail('departureAirport', e.target.value)} />
              <input className={inputClass} placeholder="Aeroporto arrivo" value={details.arrivalAirport ?? ''} onChange={(e) => setDetail('arrivalAirport', e.target.value)} />
              <input className={inputClass} placeholder="Posto" value={details.seat ?? ''} onChange={(e) => setDetail('seat', e.target.value)} />
              <input className={inputClass} placeholder="Codice prenotazione" value={details.confirmationCode ?? ''} onChange={(e) => setDetail('confirmationCode', e.target.value)} />
            </div>
          )}

          {type === 'transfer' && (
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Da" value={details.fromPlace ?? ''} onChange={(e) => setDetail('fromPlace', e.target.value)} />
              <input className={inputClass} placeholder="A" value={details.toPlace ?? ''} onChange={(e) => setDetail('toPlace', e.target.value)} />
              <input className={inputClass} placeholder="Mezzo (auto, treno, taxi…)" value={details.mode ?? ''} onChange={(e) => setDetail('mode', e.target.value)} />
              <input className={inputClass} placeholder="Codice prenotazione" value={details.confirmationCode ?? ''} onChange={(e) => setDetail('confirmationCode', e.target.value)} />
            </div>
          )}

          {type === 'location' && (
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Indirizzo" value={details.address ?? ''} onChange={(e) => setDetail('address', e.target.value)} />
              <input className={inputClass} placeholder="Telefono" value={details.phone ?? ''} onChange={(e) => setDetail('phone', e.target.value)} />
              <input className={inputClass} placeholder="Codice prenotazione" value={details.confirmationCode ?? ''} onChange={(e) => setDetail('confirmationCode', e.target.value)} />
            </div>
          )}

          {type === 'restaurant' && (
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="N. persone" value={details.partySize ?? ''} onChange={(e) => setDetail('partySize', e.target.value)} />
              <input className={inputClass} placeholder="Codice prenotazione" value={details.confirmationCode ?? ''} onChange={(e) => setDetail('confirmationCode', e.target.value)} />
            </div>
          )}

          {type === 'car_rental' && (
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Ritiro presso" value={details.pickupPlace ?? ''} onChange={(e) => setDetail('pickupPlace', e.target.value)} />
              <input className={inputClass} placeholder="Riconsegna presso" value={details.dropoffPlace ?? ''} onChange={(e) => setDetail('dropoffPlace', e.target.value)} />
              <input className={inputClass} placeholder="Codice prenotazione" value={details.confirmationCode ?? ''} onChange={(e) => setDetail('confirmationCode', e.target.value)} />
            </div>
          )}

          <textarea
            className={inputClass}
            placeholder="Note"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <label className="text-sm text-white/60">
            Promemoria
            <select
              className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-white outline-none"
              value={reminder ?? ''}
              onChange={(e) => setReminder(e.target.value ? Number(e.target.value) : undefined)}
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ''} className="bg-[#141a2e]">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {event ? (
            <AttachmentPicker ownerId={event.id} ownerKind="event" />
          ) : (
            <p className="text-xs text-white/40">
              Salva l'evento per poter aggiungere foto e voucher.
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="mt-2 rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-40"
          >
            Salva
          </button>

          {event && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 py-3 font-medium text-red-400"
            >
              <Trash2 size={16} /> Elimina evento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
