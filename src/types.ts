export type EventType =
  | 'flight'
  | 'sleep'
  | 'transfer'
  | 'location'
  | 'activity'
  | 'restaurant'
  | 'car_rental'
  | 'custom';

export type DocumentType = 'passport' | 'insurance' | 'visa' | 'other';

export interface Attachment {
  id: string;
  ownerId: string; // eventId or documentId
  ownerKind: 'event' | 'document';
  name: string;
  mimeType: string;
  blob: Blob;
  createdAt: number;
}

export interface Trip {
  id: string;
  name: string;
  destination?: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface TravelEventDetails {
  // flight
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  seat?: string;
  confirmationCode?: string;
  // transfer
  fromPlace?: string;
  toPlace?: string;
  mode?: string;
  // location / hotel
  address?: string;
  phone?: string;
  // restaurant
  partySize?: string;
  // car rental
  pickupPlace?: string;
  dropoffPlace?: string;
  // generic
  price?: string;
}

export interface TravelEvent {
  id: string;
  tripId: string;
  type: EventType;
  customTypeLabel?: string;
  title: string;
  start: string; // ISO datetime
  end?: string; // ISO datetime
  location?: string;
  notes?: string;
  details: TravelEventDetails;
  reminderMinutesBefore?: number;
  createdAt: number;
  updatedAt: number;
}

export interface TripDocument {
  id: string;
  tripId: string;
  type: DocumentType;
  title: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export const EVENT_TYPE_META: Record<
  EventType,
  { label: string; icon: string; color: string }
> = {
  flight: { label: 'Volo', icon: 'plane', color: '#3b82f6' },
  sleep: { label: 'Sonno', icon: 'moon', color: '#6366f1' },
  transfer: { label: 'Transfer', icon: 'car', color: '#f59e0b' },
  location: { label: 'Location', icon: 'hotel', color: '#10b981' },
  activity: { label: 'Attività', icon: 'ticket', color: '#ec4899' },
  restaurant: { label: 'Ristorante', icon: 'utensils', color: '#ef4444' },
  car_rental: { label: 'Noleggio auto', icon: 'car-front', color: '#f97316' },
  custom: { label: 'Personalizzato', icon: 'star', color: '#8b5cf6' },
};

export const DOCUMENT_TYPE_META: Record<DocumentType, { label: string; icon: string }> = {
  passport: { label: 'Passaporto', icon: 'id-card' },
  insurance: { label: 'Assicurazione', icon: 'shield' },
  visa: { label: 'Visto', icon: 'stamp' },
  other: { label: 'Altro documento', icon: 'file-text' },
};
