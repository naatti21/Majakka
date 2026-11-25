// Pure Gate 1 candidate. No camera, GPS permission, network or storage dependencies.
import config from './balance-config.json' with { type: 'json' };
const { direct_efficiency_keypoints_km: points, far_efficiency_floor: floor,
  far_efficiency_exponential_scale_km: scale } = config.parameters;
export const EARTH_RADIUS_KM = 6371.0088;
export function validateCoordinates(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected {latitude, longitude}');
  const { latitude, longitude } = value;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new TypeError('Coordinates must be finite numbers');
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) throw new RangeError('Coordinates outside geographic bounds');
  return { latitude, longitude };
}
export function distanceKm(first, second) {
  const a = validateCoordinates(first), b = validateCoordinates(second);
  const rad = Math.PI / 180;
  const lat = (b.latitude - a.latitude) * rad;
  const lon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(lat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(lon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(Math.min(1, Math.max(0, h))), Math.sqrt(Math.max(0, 1 - h)));
}
export function e(distance) {
  if (!Number.isFinite(distance)) throw new TypeError('Distance must be finite');
  if (distance < 0) throw new RangeError('Distance must be nonnegative');
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1], [x1, y1] = points[i];
    if (distance <= x1) return y0 + (y1 - y0) * ((distance - x0) / (x1 - x0));
  }
  const [lastDistance, lastEfficiency] = points.at(-1);
  return floor + (lastEfficiency - floor) * Math.exp(-(distance - lastDistance) / scale);
}
