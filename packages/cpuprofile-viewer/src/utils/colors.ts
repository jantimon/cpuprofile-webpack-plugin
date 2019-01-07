import { FlameGraphNode } from "cpuprofile-to-flamegraph";

export const colors = {
  NodeInternal: "#D35B7B",
  Webpack: "#8076E2",
  Loader: "#4A76CE",
  Plugin: "#2BB8CE",
  unkown: "#E2AB63"
};

export function colorMapper(d: { data: FlameGraphNode }) {
  const flamegraphNode = d.data;
  const isNodeInternal =
    !flamegraphNode.profileNode ||
    (String(flamegraphNode.profileNode.callFrame.url).indexOf("file://") !==
      0 &&
      !flamegraphNode.nodeModule);

  if (isNodeInternal) {
    return colors.NodeInternal;
  }
  const nodeModuleName = flamegraphNode.nodeModule || "";
  const isWebpack =
    [
      "webpack",
      "loader-runner",
      "tapable",
      "webpack-dev-middleware",
      "enhanced-resolve"
    ].indexOf(nodeModuleName) !== -1;
  if (isWebpack) {
    return colors.Webpack;
  }
  const isLoader = /\/[^\/]+\-loader\//.test(nodeModuleName);
  if (isLoader) {
    return colors.Loader;
  }
  const isPlugin = /\/[^\/]+\-plugin\//.test(nodeModuleName);
  if (isPlugin) {
    return colors.Plugin;
  }
  return colors.unkown;
}
