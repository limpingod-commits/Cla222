import {
  Plane,
  Moon,
  Car,
  Hotel,
  Ticket,
  Utensils,
  CarFront,
  Star,
  IdCard,
  Shield,
  Stamp,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { EventType, DocumentType } from '../types';

const eventIconMap: Record<EventType, LucideIcon> = {
  flight: Plane,
  sleep: Moon,
  transfer: Car,
  location: Hotel,
  activity: Ticket,
  restaurant: Utensils,
  car_rental: CarFront,
  custom: Star,
};

const documentIconMap: Record<DocumentType, LucideIcon> = {
  passport: IdCard,
  insurance: Shield,
  visa: Stamp,
  other: FileText,
};

export function EventTypeIcon({ type, ...props }: { type: EventType; className?: string; size?: number }) {
  const Icon = eventIconMap[type] ?? Star;
  return <Icon {...props} />;
}

export function DocumentTypeIcon({
  type,
  ...props
}: {
  type: DocumentType;
  className?: string;
  size?: number;
}) {
  const Icon = documentIconMap[type] ?? FileText;
  return <Icon {...props} />;
}
