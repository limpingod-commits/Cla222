import { useEffect, useRef, useState } from 'react';
import { Camera, FileUp, FileText, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAttachments } from '../hooks/useAttachments';
import type { Attachment } from '../types';

function AttachmentThumb({ attachment, onRemove }: { attachment: Attachment; onRemove: () => void }) {
  const isImage = attachment.mimeType.startsWith('image/');
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [attachment.blob]);

  if (!url) return <div className="h-20 w-20 shrink-0 rounded-xl bg-white/5" />;

  return (
    <div className="relative h-20 w-20 shrink-0">
      <a href={url} target="_blank" rel="noreferrer" className="block h-full w-full overflow-hidden rounded-xl bg-white/10">
        {isImage ? (
          <img src={url} alt={attachment.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-white/60">
            <FileText size={22} />
            <span className="px-1 text-center text-[9px] leading-tight">{attachment.name}</span>
          </div>
        )}
      </a>
      <button
        onClick={onRemove}
        className="absolute -right-1.5 -top-1.5 rounded-full bg-black/80 p-1 text-white"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function AttachmentPicker({
  ownerId,
  ownerKind,
}: {
  ownerId: string;
  ownerKind: 'event' | 'document';
}) {
  const attachments = useAttachments(ownerId);
  const { addAttachment, removeAttachment } = useStore();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      await addAttachment(ownerId, ownerKind, file, file.name || 'allegato');
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-white/60">Foto e voucher</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {attachments.map((att) => (
          <AttachmentThumb key={att.id} attachment={att} onRemove={() => removeAttachment(ownerId, att.id)} />
        ))}

        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-white/5 text-white/70"
        >
          <Camera size={20} />
          <span className="text-[10px]">Scatta</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-white/5 text-white/70"
        >
          <FileUp size={20} />
          <span className="text-[10px]">Carica</span>
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
