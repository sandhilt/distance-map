import { createHash } from 'crypto';
import { Geolocation } from '../entity/Geolocation';

export function generateHash(value: string): string {
  const hash = createHash('sha256');
  hash.update(value);
  const hex = hash.digest('hex');
  return hex;
}

export const distEuclidFromGeolocation = (p1: Geolocation, p2: Geolocation) => {
  const dx = p1.latitute - p2.latitute;
  const dy = p1.longitude - p2.longitude;

  return Math.sqrt(dx * dx + dy * dy);
};

export const roundNumber = (x: number) => {
  const rounded = x.toFixed(5);
  const roundedNumber = parseFloat(rounded);
  return roundedNumber;
};
