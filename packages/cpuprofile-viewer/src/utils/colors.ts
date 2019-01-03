import { FlameGraphNode } from "./cpuProfileSamplesToFlameGraph";

export const colors = {
  NodeInternal: "#D35B7B",
  Webpack: "#8076E2",
  Loader: "#4A76CE",
  Plugin: "#2BB8CE",
  unkown: "#E2AB63"
};

export function colorMapper(d: { data: FlameGraphNode }) {
  const isNodeInternal =
    !d.data.profileNode ||
    String(d.data.profileNode.callFrame.url).indexOf("file://") !== 0;

  if (isNodeInternal) {
    return colors.NodeInternal;
  }
  const url = String(d.data.profileNode.callFrame.url);
  const isWebpack = /\/(webpack|loader-runner|tapable|webpack-dev-middleware)\//.test(
    url
  );
  if (isWebpack) {
    return colors.Webpack;
  }
  const isLoader = /\/[^\/]+\-loader\//.test(url);
  if (isLoader) {
    return colors.Loader;
  }
  const isPlugin = /\/[^\/]+\-plugin\//.test(url);
  if (isPlugin) {
    return colors.Plugin;
  }
  return colors.unkown;
}
