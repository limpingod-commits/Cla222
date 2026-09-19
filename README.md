# Travel Planner

App di pianificazione viaggi, locale e offline-first (PWA installabile).

## Funzionalità

- **Più viaggi**: home con l'elenco dei viaggi salvati sul dispositivo.
- **Itinerario visivo**: barra dei giorni scorrevole in alto, sincronizzata con un
  feed verticale degli eventi raggruppati per giorno.
- **Eventi**: Volo, Sonno, Transfer, Location/Hotel, Attività, Ristorante,
  Noleggio auto, Personalizzato — ognuno con campi dedicati (numero volo,
  indirizzo, codice prenotazione, ecc.).
- **Foto e voucher**: per ogni evento o documento è possibile scattare una foto
  o caricare un'immagine/PDF, salvati direttamente sul dispositivo.
- **Documenti**: una sezione separata per passaporto, assicurazione, visti e
  altri documenti sempre a portata di mano.
- **Promemoria**: notifiche locali configurabili prima di ogni evento.
- **Backup**: esportazione/importazione di un file `.json` con tutti i dati e
  gli allegati, per non perdere nulla o trasferire i dati su un altro
  dispositivo.
- **100% offline**: tutti i dati sono salvati in IndexedDB sul dispositivo,
  nessun server richiesto. Installabile come PWA.

## Stack tecnico

React + TypeScript + Vite, Tailwind CSS, IndexedDB (`idb`), Zustand,
`vite-plugin-pwa` per il funzionamento offline.

## Sviluppo

```bash
npm install
npm run dev      # sviluppo
npm run build    # build di produzione (PWA + service worker)
npm run preview  # anteprima della build di produzione
```
