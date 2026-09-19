import { useRef, useState } from 'react';
import { X, Download, Upload, Bell, BellOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { requestNotificationPermission } from '../utils/reminders';

export default function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { exportBackup, importBackup } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | 'unsupported'>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  async function handleExport() {
    setStatus('Esportazione in corso…');
    const blob = await exportBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Backup scaricato ✔');
  }

  async function handleImportFile(file: File) {
    if (
      !confirm(
        'Importare questo backup sostituirà tutti i dati attuali dell\'app. Continuare?'
      )
    ) {
      return;
    }
    setStatus('Importazione in corso…');
    try {
      const text = await file.text();
      await importBackup(text);
      setStatus('Importazione completata ✔');
    } catch {
      setStatus('Errore durante l\'importazione: file non valido');
    }
  }

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission();
    setNotifStatus(result as NotificationPermission | 'unsupported');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-[#141a2e] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Impostazioni</h2>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <section>
            <p className="mb-2 text-sm font-medium text-white/70">Promemoria</p>
            <button
              onClick={handleEnableNotifications}
              disabled={notifStatus === 'granted' || notifStatus === 'unsupported'}
              className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                {notifStatus === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
                Notifiche promemoria eventi
              </span>
              <span className="text-xs text-white/50">
                {notifStatus === 'granted'
                  ? 'Attive'
                  : notifStatus === 'denied'
                    ? 'Bloccate dal browser'
                    : notifStatus === 'unsupported'
                      ? 'Non supportate'
                      : 'Attiva'}
              </span>
            </button>
            <p className="mt-1 text-xs text-white/40">
              I promemoria funzionano quando l'app è aperta in background sul dispositivo.
            </p>
          </section>

          <section>
            <p className="mb-2 text-sm font-medium text-white/70">Backup dati (locale)</p>
            <p className="mb-2 text-xs text-white/40">
              L'app salva tutto solo su questo dispositivo. Esporta un backup per non perdere i
              dati o per trasferirli su un altro dispositivo.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black"
              >
                <Download size={16} /> Esporta backup (.json)
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 font-medium text-white"
              >
                <Upload size={16} /> Importa backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                  e.target.value = '';
                }}
              />
            </div>
            {status && <p className="mt-2 text-xs text-white/50">{status}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
