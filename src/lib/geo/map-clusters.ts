export type ClusterablePoint = {
  id: string;
  latitude: number;
  longitude: number;
};

export type MapCluster<T extends ClusterablePoint> = {
  id: string;
  latitude: number;
  longitude: number;
  isCluster: boolean;
  points: T[];
};

export function createCoordinateClusters<T extends ClusterablePoint>(
  points: T[],
  zoom: number,
  baseRadius = 0.00045,
): MapCluster<T>[] {
  const radius = baseRadius * 2 ** (15 - zoom);
  const visited = new Set<string>();
  const clusters: MapCluster<T>[] = [];

  for (const point of points) {
    if (visited.has(point.id)) continue;

    const group = points.filter((candidate) => {
      if (visited.has(candidate.id)) return false;

      return (
        Math.hypot(
          candidate.latitude - point.latitude,
          candidate.longitude - point.longitude,
        ) <= radius
      );
    });

    for (const member of group) visited.add(member.id);

    const latitude =
      group.reduce((sum, member) => sum + member.latitude, 0) / group.length;
    const longitude =
      group.reduce((sum, member) => sum + member.longitude, 0) / group.length;
    const ids = group.map((member) => member.id).sort();

    clusters.push({
      id: group.length > 1 ? `cluster:${ids.join("-")}` : `point:${point.id}`,
      latitude,
      longitude,
      isCluster: group.length > 1,
      points: group,
    });
  }

  return clusters;
}
