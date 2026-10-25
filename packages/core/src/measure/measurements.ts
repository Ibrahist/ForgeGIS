/**
 * Geodesic distance calculation between two points [lon, lat] using Haversine formula
 * Returns distance in meters
 */
export function calculateDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371008.8; // Earth radius in meters
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates total path length in meters across multiple vertices
 */
export function calculatePathLengthMeters(coords: [number, number][]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += calculateDistanceMeters(coords[i], coords[i + 1]);
  }
  return total;
}

/**
 * Calculates spherical polygon area in square meters using spherical excess formula
 */
export function calculatePolygonAreaSquareMeters(coords: [number, number][]): number {
  if (coords.length < 3) return 0;

  const R = 6371008.8; // Earth radius in meters
  let totalAngle = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    const p3 = coords[(i + 2) % coords.length];

    const bearing1 = calculateBearing(p2, p1);
    const bearing2 = calculateBearing(p2, p3);

    let angle = bearing2 - bearing1;
    if (angle < 0) angle += 360;
    totalAngle += angle;
  }

  const n = coords.length;
  const excess = (totalAngle - (n - 2) * 180) * (Math.PI / 180);
  const area = Math.abs(excess * R * R);

  return isNaN(area) ? 0 : area;
}

export function calculateBearing(start: [number, number], end: [number, number]): number {
  const [lon1, lat1] = [((start[0] * Math.PI) / 180), ((start[1] * Math.PI) / 180)];
  const [lon2, lat2] = [((end[0] * Math.PI) / 180), ((end[1] * Math.PI) / 180)];

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatArea(sqMeters: number): string {
  if (sqMeters < 10000) {
    return `${sqMeters.toFixed(1)} m²`;
  }
  if (sqMeters < 1000000) {
    return `${(sqMeters / 10000).toFixed(2)} ha`;
  }
  return `${(sqMeters / 1000000).toFixed(2)} km²`;
}
