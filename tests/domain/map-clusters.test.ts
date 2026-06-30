import { describe, expect, it } from "vitest";
import { createCoordinateClusters } from "@/lib/geo/map-clusters";

const points = [
  { id: "first", latitude: 42.8749, longitude: 74.6122 },
  { id: "second", latitude: 42.8751, longitude: 74.6125 },
  { id: "third", latitude: 42.884, longitude: 74.624 },
];

describe("createCoordinateClusters", () => {
  it("groups nearby points when the map is zoomed out", () => {
    const clusters = createCoordinateClusters(points, 12);

    expect(clusters).toHaveLength(2);
    expect(clusters[0]).toMatchObject({
      id: "cluster:first-second",
      isCluster: true,
    });
    expect(clusters[0].points.map((point) => point.id)).toEqual([
      "first",
      "second",
    ]);
  });

  it("splits nearby points when the map is zoomed in", () => {
    const clusters = createCoordinateClusters(points, 17);

    expect(clusters).toHaveLength(3);
    expect(clusters.every((cluster) => !cluster.isCluster)).toBe(true);
  });

  it("places a cluster at the average point of its members", () => {
    const [cluster] = createCoordinateClusters(points.slice(0, 2), 12);

    expect(cluster.latitude).toBeCloseTo(42.875, 6);
    expect(cluster.longitude).toBeCloseTo(74.61235, 6);
  });
});
