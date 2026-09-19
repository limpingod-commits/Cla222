import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { DocumentType, TripDocument } from '../types';
import { DOCUMENT_TYPE_META } from '../types';
import { DocumentTypeIcon } from '../utils/icons';
import AttachmentPicker from './AttachmentPicker';

export default function DocumentModal({
  tripId,
  initialType,
  doc,
  onClose,
}: {
  tripId: string;
  initialType?: DocumentType;
  doc?: TripDocument;
  onClose: () => void;
}) {
  const { createDocument, updateDocument, deleteDocument } = useStore();
  const [type, setType] = useState<DocumentType>(doc?.type ?? initialType ?? 'other');
  const [title, setTitle] = useState(doc?.title ?? '');
  const [notes, setNotes] = useState(doc?.notes ?? '');
  const [savedId, setSavedId] = useState<string | null>(doc?.id ?? null);

  const canSave = title.trim().length > 0;
  const inputClass = 'rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none w-full';

  async function handleSave() {
    if (!canSave) return;
    if (doc) {
      await updateDocument(doc.id, { type, title: title.trim(), notes: notes.trim() || undefined });
    } else if (!savedId) {
      const created = await createDocument({ tripId, type, title: title.trim(), notes: notes.trim() || undefined });
      setSavedId(created.id);
      return;
    } else {
      await updateDocument(savedId, { type, title: title.trim(), notes: notes.trim() || undefined });
    }
    onClose();
  }

  async function handleDelete() {
    const id = doc?.id ?? savedId;
    if (!id) return;
    if (confirm('Eliminare questo documento?')) {
      await deleteDocument(id, tripId);
      onClose();
    }
  }

  const activeId = doc?.id ?? savedId;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-[#141a2e] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{doc ? 'Modifica documento' : 'Nuovo documento'}</h2>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2">
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {(Object.keys(DOCUMENT_TYPE_META) as DocumentType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                type === t ? 'bg-white text-black' : 'bg-white/10 text-white/70'
              }`}
            >
              <DocumentTypeIcon type={t} size={14} />
              {DOCUMENT_TYPE_META[t].label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <input
            className={inputClass}
            placeholder="Titolo (es. Passaporto Mario Rossi)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className={inputClass}
            placeholder="Note (numero documento, scadenza…)"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {activeId ? (
            <AttachmentPicker ownerId={activeId} ownerKind="document" />
          ) : (
            <p className="text-xs text-white/40">Salva il documento per poter aggiungere foto/scansioni.</p>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="mt-2 rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-40"
          >
            {savedId && !doc ? 'Fatto' : 'Salva'}
          </button>

          {activeId && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 py-3 font-medium text-red-400"
            >
              <Trash2 size={16} /> Elimina documento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
