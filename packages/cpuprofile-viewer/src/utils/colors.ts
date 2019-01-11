import { FlameGraphNode } from "cpuprofile-to-flamegraph";
import {
  getFlameGraphCategory,
  FlameGraphCategory
} from "./flameGraphConverter";

export const colors = {
  NodeInternal: "#D35B7B",
  Webpack: "#8076E2",
  Loader: "#4A76CE",
  Plugin: "#2BB8CE",
  unknown: "#E2AB63"
};

const categoryMap: { [category in FlameGraphCategory]: keyof typeof colors } = {
  loader: "Loader",
  plugin: "Plugin",
  webpack: "Webpack",
  unknown: "unknown",
  nodeInternal: "NodeInternal",
  garbageCollector: "NodeInternal"
};

export type ColorName = keyof typeof colors;

export function colorMapper(d: { data: FlameGraphNode }) {
  const flamegraphNode = d.data;
  const category = getFlameGraphCategory(flamegraphNode);
  return colors[categoryMap[category]];
}
