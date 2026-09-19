import { useEffect, useState } from 'react';
import { Paperclip } from 'lucide-react';
import type { TravelEvent } from '../types';
import { EVENT_TYPE_META } from '../types';
import { EventTypeIcon } from '../utils/icons';
import { formatTime } from '../utils/date';
import { useAttachments } from '../hooks/useAttachments';

export default function EventCard({
  event,
  onClick,
}: {
  event: TravelEvent;
  onClick: () => void;
}) {
  const meta = EVENT_TYPE_META[event.type];
  const attachments = useAttachments(event.id);
  const firstImage = attachments.find((a) => a.mimeType.startsWith('image/'));
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!firstImage) {
      setThumbUrl(null);
      return;
    }
    const url = URL.createObjectURL(firstImage.blob);
    setThumbUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [firstImage]);

  const label = event.type === 'custom' && event.customTypeLabel ? event.customTypeLabel : meta.label;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl bg-white/5 p-3 text-left active:scale-[0.98] transition-transform"
      style={{ borderLeft: `4px solid ${meta.color}` }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${meta.color}33`, color: meta.color }}
      >
        <EventTypeIcon type={event.type} size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: meta.color }}>
            {label}
          </span>
          <span className="text-xs text-white/50">
            {formatTime(event.start)}
            {event.end ? ` – ${formatTime(event.end)}` : ''}
          </span>
        </div>
        <p className="mt-0.5 truncate font-semibold">{event.title}</p>
        {event.location && <p className="truncate text-sm text-white/60">{event.location}</p>}
        {attachments.length > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
            <Paperclip size={12} /> {attachments.length} allegat{attachments.length === 1 ? 'o' : 'i'}
          </p>
        )}
      </div>

      {thumbUrl && (
        <img src={thumbUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      )}
    </button>
  );
}
