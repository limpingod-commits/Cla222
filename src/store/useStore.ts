import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import {
  attachmentsRepo,
  documentsRepo,
  eventsRepo,
  exportAllData,
  importAllData,
  tripsRepo,
} from '../db';
import type { Attachment, Trip, TravelEvent, TripDocument } from '../types';

interface StoreState {
  trips: Trip[];
  eventsByTrip: Record<string, TravelEvent[]>;
  documentsByTrip: Record<string, TripDocument[]>;
  attachmentsByOwner: Record<string, Attachment[]>;
  loaded: boolean;

  loadTrips: () => Promise<void>;
  loadTrip: (tripId: string) => Promise<void>;

  createTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Trip>;
  updateTrip: (id: string, data: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  createEvent: (
    data: Omit<TravelEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<TravelEvent>;
  updateEvent: (id: string, data: Partial<TravelEvent>) => Promise<void>;
  deleteEvent: (id: string, tripId: string) => Promise<void>;

  createDocument: (
    data: Omit<TripDocument, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<TripDocument>;
  updateDocument: (id: string, data: Partial<TripDocument>) => Promise<void>;
  deleteDocument: (id: string, tripId: string) => Promise<void>;

  loadAttachments: (ownerId: string) => Promise<void>;
  addAttachment: (
    ownerId: string,
    ownerKind: 'event' | 'document',
    file: File | Blob,
    name: string
  ) => Promise<void>;
  removeAttachment: (ownerId: string, attachmentId: string) => Promise<void>;

  exportBackup: () => Promise<Blob>;
  importBackup: (json: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  trips: [],
  eventsByTrip: {},
  documentsByTrip: {},
  attachmentsByOwner: {},
  loaded: false,

  async loadTrips() {
    const trips = await tripsRepo.all();
    set({ trips, loaded: true });
  },

  async loadTrip(tripId: string) {
    const [events, documents] = await Promise.all([
      eventsRepo.byTrip(tripId),
      documentsRepo.byTrip(tripId),
    ]);
    set((s) => ({
      eventsByTrip: { ...s.eventsByTrip, [tripId]: events },
      documentsByTrip: { ...s.documentsByTrip, [tripId]: documents },
    }));
  },

  async createTrip(data) {
    const now = Date.now();
    const trip: Trip = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    await tripsRepo.put(trip);
    set((s) => ({ trips: [...s.trips, trip].sort((a, b) => a.startDate.localeCompare(b.startDate)) }));
    return trip;
  },

  async updateTrip(id, data) {
    const existing = get().trips.find((t) => t.id === id);
    if (!existing) return;
    const updated: Trip = { ...existing, ...data, updatedAt: Date.now() };
    await tripsRepo.put(updated);
    set((s) => ({
      trips: s.trips
        .map((t) => (t.id === id ? updated : t))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    }));
  },

  async deleteTrip(id) {
    await tripsRepo.remove(id);
    set((s) => {
      const { [id]: _e, ...eventsByTrip } = s.eventsByTrip;
      const { [id]: _d, ...documentsByTrip } = s.documentsByTrip;
      return {
        trips: s.trips.filter((t) => t.id !== id),
        eventsByTrip,
        documentsByTrip,
      };
    });
  },

  async createEvent(data) {
    const now = Date.now();
    const event: TravelEvent = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    await eventsRepo.put(event);
    set((s) => ({
      eventsByTrip: {
        ...s.eventsByTrip,
        [event.tripId]: [...(s.eventsByTrip[event.tripId] ?? []), event].sort((a, b) =>
          a.start.localeCompare(b.start)
        ),
      },
    }));
    return event;
  },

  async updateEvent(id, data) {
    const tripId = data.tripId ?? Object.values(get().eventsByTrip).flat().find((e) => e.id === id)?.tripId;
    if (!tripId) return;
    const existing = get().eventsByTrip[tripId]?.find((e) => e.id === id);
    if (!existing) return;
    const updated: TravelEvent = { ...existing, ...data, updatedAt: Date.now() };
    await eventsRepo.put(updated);
    set((s) => ({
      eventsByTrip: {
        ...s.eventsByTrip,
        [tripId]: (s.eventsByTrip[tripId] ?? [])
          .map((e) => (e.id === id ? updated : e))
          .sort((a, b) => a.start.localeCompare(b.start)),
      },
    }));
  },

  async deleteEvent(id, tripId) {
    await eventsRepo.remove(id);
    set((s) => ({
      eventsByTrip: {
        ...s.eventsByTrip,
        [tripId]: (s.eventsByTrip[tripId] ?? []).filter((e) => e.id !== id),
      },
    }));
  },

  async createDocument(data) {
    const now = Date.now();
    const doc: TripDocument = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    await documentsRepo.put(doc);
    set((s) => ({
      documentsByTrip: {
        ...s.documentsByTrip,
        [doc.tripId]: [...(s.documentsByTrip[doc.tripId] ?? []), doc],
      },
    }));
    return doc;
  },

  async updateDocument(id, data) {
    const tripId =
      data.tripId ?? Object.values(get().documentsByTrip).flat().find((d) => d.id === id)?.tripId;
    if (!tripId) return;
    const existing = get().documentsByTrip[tripId]?.find((d) => d.id === id);
    if (!existing) return;
    const updated: TripDocument = { ...existing, ...data, updatedAt: Date.now() };
    await documentsRepo.put(updated);
    set((s) => ({
      documentsByTrip: {
        ...s.documentsByTrip,
        [tripId]: (s.documentsByTrip[tripId] ?? []).map((d) => (d.id === id ? updated : d)),
      },
    }));
  },

  async deleteDocument(id, tripId) {
    await documentsRepo.remove(id);
    set((s) => ({
      documentsByTrip: {
        ...s.documentsByTrip,
        [tripId]: (s.documentsByTrip[tripId] ?? []).filter((d) => d.id !== id),
      },
    }));
  },

  async loadAttachments(ownerId) {
    const atts = await attachmentsRepo.byOwner(ownerId);
    set((s) => ({ attachmentsByOwner: { ...s.attachmentsByOwner, [ownerId]: atts } }));
  },

  async addAttachment(ownerId, ownerKind, file, name) {
    const att: Attachment = {
      id: uuid(),
      ownerId,
      ownerKind,
      name,
      mimeType: file.type || 'application/octet-stream',
      blob: file,
      createdAt: Date.now(),
    };
    await attachmentsRepo.put(att);
    set((s) => ({
      attachmentsByOwner: {
        ...s.attachmentsByOwner,
        [ownerId]: [...(s.attachmentsByOwner[ownerId] ?? []), att],
      },
    }));
  },

  async removeAttachment(ownerId, attachmentId) {
    await attachmentsRepo.remove(attachmentId);
    set((s) => ({
      attachmentsByOwner: {
        ...s.attachmentsByOwner,
        [ownerId]: (s.attachmentsByOwner[ownerId] ?? []).filter((a) => a.id !== attachmentId),
      },
    }));
  },

  async exportBackup() {
    const data = await exportAllData();
    const toBase64 = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    const attachments = await Promise.all(
      data.attachments.map(async (a) => ({
        ...a,
        blob: await toBase64(a.blob),
      }))
    );
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      trips: data.trips,
      events: data.events,
      documents: data.documents,
      attachments,
    };
    return new Blob([JSON.stringify(payload)], { type: 'application/json' });
  },

  async importBackup(json: string) {
    const parsed = JSON.parse(json);
    const fromBase64 = async (dataUrl: string) => (await fetch(dataUrl)).blob();
    const attachments: Attachment[] = await Promise.all(
      (parsed.attachments ?? []).map(async (a: Attachment & { blob: string }) => ({
        ...a,
        blob: await fromBase64(a.blob),
      }))
    );
    await importAllData({
      trips: parsed.trips ?? [],
      events: parsed.events ?? [],
      documents: parsed.documents ?? [],
      attachments,
    });
    await get().loadTrips();
    set({ eventsByTrip: {}, documentsByTrip: {}, attachmentsByOwner: {} });
  },
}));
