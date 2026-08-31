import { Coordinates } from '../types';

/**
 * Calculates great-circle distance between two points in meters using Haversine formula
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format current date in Indonesian format e.g. "Minggu, 30 Agustus 2026"
 */
export function formatIndonesianDate(dateInput: Date | string = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Format with explicit Indonesian days and months for consistent rendering
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format time in HH:mm:ss format
 */
export function formatTime(date: Date = new Date()): string {
  return date.toTimeString().split(' ')[0];
}

/**
 * Calculate working days between two date strings (inclusive)
 */
export function calculateLeaveDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (end < start) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    // Exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(1, count);
}

/**
 * Approximate address based on offset from office
 */
export function getApproximateAddress(
  coords: Coordinates,
  officeCoords: Coordinates,
  officeAddress: string
): string {
  const distance = calculateDistanceMeters(coords, officeCoords);
  if (distance <= 100) {
    return officeAddress;
  }
  if (distance <= 500) {
    return `Sekitar Kawasan Gedung Perkantoran (${distance}m dari Kantor)`;
  }
  return `Lokasi WFH / Remote - Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)} (${(distance / 1000).toFixed(1)} km dari Kantor)`;
}
