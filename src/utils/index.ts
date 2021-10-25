import { createHash } from 'crypto';
import { Geolocation } from '../entity/Geolocation';
import { Location } from '../entity/Location';
import { Distance } from '../typings';

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
  const rounded = x.toFixed(6);
  const roundedNumber = parseFloat(rounded);
  return roundedNumber;
};

export function allDistEuclid(locations: Location[]): Distance[] {
  const distances: Distance[] = [];

  for (let i = 0, k = locations.length; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const distanceNumber = distEuclidFromGeolocation(
        locations[i].geolocation,
        locations[j].geolocation,
      );

      const distance: Distance = {
        address_1: locations[i].address_name,
        address_2: locations[j].address_name,
        value: roundNumber(distanceNumber),
      };
      distances.push(distance);
    }
  }

  distances.sort((a, b) => a.value - b.value);

  return distances;
}
