export function formatDistance(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) {
    return "Distance unavailable";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}
