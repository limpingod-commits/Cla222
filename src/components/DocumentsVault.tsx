import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { DocumentType, TripDocument } from '../types';
import { DOCUMENT_TYPE_META } from '../types';
import { DocumentTypeIcon } from '../utils/icons';
import { useAttachments } from '../hooks/useAttachments';
import DocumentModal from './DocumentModal';

function DocumentRow({ doc, onClick }: { doc: TripDocument; onClick: () => void }) {
  const meta = DOCUMENT_TYPE_META[doc.type];
  const attachments = useAttachments(doc.id);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-4 text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80">
        <DocumentTypeIcon type={doc.type} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">{meta.label}</p>
        <p className="truncate font-semibold">{doc.title}</p>
        {attachments.length > 0 && (
          <p className="text-xs text-white/40">{attachments.length} allegati</p>
        )}
      </div>
    </button>
  );
}

export default function DocumentsVault({ tripId }: { tripId: string }) {
  const documentsByTrip = useStore((s) => s.documentsByTrip);
  const documents = documentsByTrip[tripId] ?? [];
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TripDocument | null>(null);
  const [prefillType, setPrefillType] = useState<DocumentType>('passport');

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-28 pt-1">
      <div className="mb-4 grid grid-cols-4 gap-2">
        {(Object.keys(DOCUMENT_TYPE_META) as DocumentType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setPrefillType(type);
              setShowModal(true);
            }}
            className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 py-3 active:scale-95"
          >
            <DocumentTypeIcon type={type} size={18} />
            <span className="text-center text-[10px] text-white/70">{DOCUMENT_TYPE_META[type].label}</span>
          </button>
        ))}
      </div>

      {documents.length === 0 ? (
        <div className="mt-8 text-center text-sm text-white/30">
          Aggiungi passaporto, assicurazione, visti o altri documenti sempre a portata di mano.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onClick={() => setEditingDoc(doc)} />
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setPrefillType('other');
          setShowModal(true);
        }}
        className="safe-bottom fixed bottom-6 right-5 flex items-center gap-2 rounded-full bg-white px-5 py-3.5 font-semibold text-black shadow-xl active:scale-95"
      >
        <Plus size={20} /> Documento
      </button>

      {showModal && (
        <DocumentModal tripId={tripId} initialType={prefillType} onClose={() => setShowModal(false)} />
      )}
      {editingDoc && (
        <DocumentModal tripId={tripId} doc={editingDoc} onClose={() => setEditingDoc(null)} />
      )}
    </div>
  );
}
