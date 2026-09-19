import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useAttachments(ownerId: string) {
  const attachments = useStore((s) => s.attachmentsByOwner[ownerId]);
  const loadAttachments = useStore((s) => s.loadAttachments);

  useEffect(() => {
    if (attachments === undefined) {
      loadAttachments(ownerId);
    }
  }, [ownerId, attachments, loadAttachments]);

  return attachments ?? [];
}
