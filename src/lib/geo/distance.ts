export function formatDistance(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) {
    return "Расстояние неизвестно";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  }

  return `${(meters / 1000).toFixed(1)} км`;
}

export function calculateDistanceMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const earthRadiusMeters = 6_371_000;
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;

  return Math.round(
    earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)),
  );
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
