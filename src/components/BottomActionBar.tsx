import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { EventType } from '../types';
import { EVENT_TYPE_META } from '../types';
import { EventTypeIcon } from '../utils/icons';

const QUICK_TYPES: EventType[] = ['flight', 'sleep', 'transfer', 'location'];
const MORE_TYPES: EventType[] = ['activity', 'restaurant', 'car_rental', 'custom'];

export default function BottomActionBar({
  onQuickAdd,
  onOpenDocuments,
}: {
  onQuickAdd: (type: EventType) => void;
  onOpenDocuments: () => void;
}) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <div className="safe-bottom flex items-center gap-2 border-t border-white/10 bg-[#0b1020]/95 px-3 py-3 backdrop-blur">
        {QUICK_TYPES.map((type) => {
          const meta = EVENT_TYPE_META[type];
          return (
            <button
              key={type}
              onClick={() => onQuickAdd(type)}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 active:scale-95"
              style={{ background: `${meta.color}22`, color: meta.color }}
            >
              <EventTypeIcon type={type} size={20} />
              <span className="text-[11px] font-medium text-white/80">{meta.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowMore(true)}
          className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-white/10 py-2.5 active:scale-95"
        >
          <Plus size={20} />
          <span className="text-[11px] font-medium text-white/80">Altro</span>
        </button>
      </div>

      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setShowMore(false)}>
          <div
            className="safe-bottom w-full rounded-t-3xl bg-[#141a2e] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold">Aggiungi evento</h3>
            <div className="grid grid-cols-2 gap-3">
              {MORE_TYPES.map((type) => {
                const meta = EVENT_TYPE_META[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setShowMore(false);
                      onQuickAdd(type);
                    }}
                    className="flex items-center gap-3 rounded-2xl p-4 active:scale-95"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    <EventTypeIcon type={type} size={20} />
                    <span className="text-sm font-medium text-white/80">{meta.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setShowMore(false);
                  onOpenDocuments();
                }}
                className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-white/10 p-4 font-medium text-white/80 active:scale-95"
              >
                Vai ai Documenti (passaporto, assicurazione…)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
