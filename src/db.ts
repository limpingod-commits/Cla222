import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Attachment, Trip, TravelEvent, TripDocument } from './types';

interface TravelDB extends DBSchema {
  trips: { key: string; value: Trip; indexes: { byCreatedAt: number } };
  events: { key: string; value: TravelEvent; indexes: { byTrip: string } };
  documents: { key: string; value: TripDocument; indexes: { byTrip: string } };
  attachments: { key: string; value: Attachment; indexes: { byOwner: string } };
}

const DB_NAME = 'travel-planner';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TravelDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TravelDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const trips = db.createObjectStore('trips', { keyPath: 'id' });
        trips.createIndex('byCreatedAt', 'createdAt');

        const events = db.createObjectStore('events', { keyPath: 'id' });
        events.createIndex('byTrip', 'tripId');

        const documents = db.createObjectStore('documents', { keyPath: 'id' });
        documents.createIndex('byTrip', 'tripId');

        const attachments = db.createObjectStore('attachments', { keyPath: 'id' });
        attachments.createIndex('byOwner', 'ownerId');
      },
    });
  }
  return dbPromise;
}

export const tripsRepo = {
  async all(): Promise<Trip[]> {
    const db = await getDB();
    return (await db.getAll('trips')).sort((a, b) => a.startDate.localeCompare(b.startDate));
  },
  async get(id: string) {
    const db = await getDB();
    return db.get('trips', id);
  },
  async put(trip: Trip) {
    const db = await getDB();
    await db.put('trips', trip);
  },
  async remove(id: string) {
    const db = await getDB();
    const tx = db.transaction(['trips', 'events', 'documents', 'attachments'], 'readwrite');
    const events = await tx.objectStore('events').index('byTrip').getAll(id);
    const documents = await tx.objectStore('documents').index('byTrip').getAll(id);
    const attStore = tx.objectStore('attachments');
    for (const ev of events) {
      const atts = await attStore.index('byOwner').getAll(ev.id);
      for (const a of atts) await attStore.delete(a.id);
      await tx.objectStore('events').delete(ev.id);
    }
    for (const doc of documents) {
      const atts = await attStore.index('byOwner').getAll(doc.id);
      for (const a of atts) await attStore.delete(a.id);
      await tx.objectStore('documents').delete(doc.id);
    }
    await tx.objectStore('trips').delete(id);
    await tx.done;
  },
};

export const eventsRepo = {
  async byTrip(tripId: string): Promise<TravelEvent[]> {
    const db = await getDB();
    const items = await db.getAllFromIndex('events', 'byTrip', tripId);
    return items.sort((a, b) => a.start.localeCompare(b.start));
  },
  async put(event: TravelEvent) {
    const db = await getDB();
    await db.put('events', event);
  },
  async remove(id: string) {
    const db = await getDB();
    const tx = db.transaction(['events', 'attachments'], 'readwrite');
    const atts = await tx.objectStore('attachments').index('byOwner').getAll(id);
    for (const a of atts) await tx.objectStore('attachments').delete(a.id);
    await tx.objectStore('events').delete(id);
    await tx.done;
  },
};

export const documentsRepo = {
  async byTrip(tripId: string): Promise<TripDocument[]> {
    const db = await getDB();
    const items = await db.getAllFromIndex('documents', 'byTrip', tripId);
    return items.sort((a, b) => a.createdAt - b.createdAt);
  },
  async put(doc: TripDocument) {
    const db = await getDB();
    await db.put('documents', doc);
  },
  async remove(id: string) {
    const db = await getDB();
    const tx = db.transaction(['documents', 'attachments'], 'readwrite');
    const atts = await tx.objectStore('attachments').index('byOwner').getAll(id);
    for (const a of atts) await tx.objectStore('attachments').delete(a.id);
    await tx.objectStore('documents').delete(id);
    await tx.done;
  },
};

export const attachmentsRepo = {
  async byOwner(ownerId: string): Promise<Attachment[]> {
    const db = await getDB();
    const items = await db.getAllFromIndex('attachments', 'byOwner', ownerId);
    return items.sort((a, b) => a.createdAt - b.createdAt);
  },
  async put(att: Attachment) {
    const db = await getDB();
    await db.put('attachments', att);
  },
  async remove(id: string) {
    const db = await getDB();
    await db.delete('attachments', id);
  },
};

export async function exportAllData() {
  const db = await getDB();
  const [trips, events, documents, attachments] = await Promise.all([
    db.getAll('trips'),
    db.getAll('events'),
    db.getAll('documents'),
    db.getAll('attachments'),
  ]);
  return { trips, events, documents, attachments };
}

export async function importAllData(data: {
  trips: Trip[];
  events: TravelEvent[];
  documents: TripDocument[];
  attachments: Attachment[];
}) {
  const db = await getDB();
  const tx = db.transaction(['trips', 'events', 'documents', 'attachments'], 'readwrite');
  await Promise.all([
    tx.objectStore('trips').clear(),
    tx.objectStore('events').clear(),
    tx.objectStore('documents').clear(),
    tx.objectStore('attachments').clear(),
  ]);
  for (const t of data.trips) await tx.objectStore('trips').put(t);
  for (const e of data.events) await tx.objectStore('events').put(e);
  for (const d of data.documents) await tx.objectStore('documents').put(d);
  for (const a of data.attachments) await tx.objectStore('attachments').put(a);
  await tx.done;
}
