import { FlameGraphNode } from "cpuprofile-to-flamegraph";

/*+
 * Remove very short node exections (<50ms) during idle times
 * To allow propper computation splitting
 */
export function getFlameGraphWithoutPauseBreakers(
  rootFlameGraphNode: FlameGraphNode
) {
  const originalChildren = rootFlameGraphNode.children;
  const filteredChildren: Array<FlameGraphNode> = [];
  for (let i = 0; i < originalChildren.length; i++) {
    const childNode = originalChildren[i];
    // Add all nodes above 50ms
    if (childNode.executionTime >= 5000) {
      filteredChildren.push(childNode);
      continue;
    }
    const previousNodeIndex = filteredChildren.length - 1;
    const previousNode = filteredChildren[previousNodeIndex];
    const nextNode = originalChildren[i + 1];
    const previousNodeIsProgramNode =
      previousNode && previousNode.name === "(program)";
    const nextNodeIsProgramNode = nextNode && nextNode.name === "(program)";
    // Don't remove nodes if surrounded by program nodes
    if (!previousNodeIsProgramNode || !nextNodeIsProgramNode) {
      filteredChildren.push(childNode);
      continue;
    }
    const surroundedExecutionTime =
      previousNode.executionTime +
      childNode.executionTime +
      nextNode.executionTime;
    // Don't remove nodes if the surrounding program nodes
    // are shorter than 100ms
    if (
      previousNode.executionTime < 100000 ||
      nextNode.executionTime < 100000
    ) {
      filteredChildren.push(childNode);
      continue;
    }
    // Merge programe nodes if possible
    filteredChildren[previousNodeIndex] = {
      ...previousNode,
      executionTime: surroundedExecutionTime
    };
    // Skip next node as it was already merged
    i++;
  }
  return {
    ...rootFlameGraphNode,
    children: filteredChildren
  };
}

const webpackModules = [
  "webpack",
  "loader-runner",
  "tapable",
  "webpack-dev-middleware"
];
export type FlameGraphCategory =
  | "loader"
  | "plugin"
  | "webpack"
  | "unknown"
  | "nodeInternal"
  | "garbageCollector";
/**
 * Returns the category of the given FlameGraphNode
 */
export function getFlameGraphCategory(
  node: FlameGraphNode
): FlameGraphCategory {
  if (node.name === "(garbage collector)") {
    return "garbageCollector";
  }
  if (node.nodeModule) {
    if (/\-loader$/.test(node.nodeModule)) {
      return "loader";
    }
    if (/\-plugin$/.test(node.nodeModule)) {
      return "plugin";
    }
    if (webpackModules.indexOf(node.nodeModule) !== -1) {
      return "webpack";
    }
  }

  const url = node.profileNode.callFrame.url;
  if (url === "" || url.indexOf("internal") === 0 || url.indexOf("/") === -1) {
    return "nodeInternal";
  }

  return "unknown";
}

export function getFlameGraphSubCategory(
  node: FlameGraphNode,
  nodeCategory: FlameGraphCategory
) {
  const nodeModule = node.nodeModule;
  if (!nodeModule) {
    return nodeCategory;
  }
  if (nodeCategory === "plugin" || nodeCategory === "loader") {
    return nodeModule;
  }
  if (
    nodeModule === "webpack" &&
    node.profileNode.callFrame.functionName === "emitFiles"
  ) {
    return "webpack (emit)";
  }
  if (
    nodeModule === "webpack" &&
    node.profileNode.callFrame.functionName === "seal"
  ) {
    return "webpack (seal)";
  }
  if (
    nodeModule === "webpack" &&
    node.profileNode.callFrame.functionName === "parse"
  ) {
    return "webpack (parse)";
  }
  return nodeCategory;
}

/**
 * Iterate through all child nodes to meassure the time for plugins, loaders and webpack
 */
export function getFlameGraphNodeTiminigs(node: FlameGraphNode) {
  const nodeCategory = getFlameGraphCategory(node);
  const timingKey = getFlameGraphSubCategory(node, nodeCategory);
  // If we are at the end of the tree return the childs execution time
  if (node.children.length === 0) {
    return {
      [timingKey]: node.executionTime
    };
  }

  const recursiveChildTimes = node.children.reduce(
    (sum, childNode) => {
      const childTimes = getFlameGraphNodeTiminigs(childNode);
      Object.keys(childTimes).forEach(type => {
        sum[type] = (sum[type] || 0) + childTimes[type];
      });
      return sum;
    },
    {
      unknown: 0
    }
  );
  // Merge child timings of webpack, nodejs and unknown into plugins and loaders
  if (
    nodeCategory === "plugin" ||
    nodeCategory === "loader" ||
    nodeCategory === "webpack"
  ) {
    // The webpack time should not include seal, parse and emit children
    const includeWebpackParts =
      nodeCategory !== "webpack"
        ? ["webpack (seal)", "webpack (parse)", "webpack (emit)"]
        : [];
    // Sum up all children if they have the same name, are from webpack or nodeinternals
    let inheritedTime = 0;
    let includedTime = {};
    new Set(
      ["nodeInternal", "webpack", "unknown", timingKey].concat(
        includeWebpackParts
      )
    ).forEach(childTimeKey => {
      if (recursiveChildTimes[childTimeKey]) {
        inheritedTime += recursiveChildTimes[childTimeKey];
      }
      // Reset the timing to 0 as they are already
      // Part of the sum
      includedTime[childTimeKey] = 0;
    });
    // Merge timings
    return {
      ...recursiveChildTimes,
      ...includedTime,
      [timingKey]: inheritedTime
    };
  }
  // Merge nodeInternal childs into unknown
  if (
    nodeCategory === "unknown" &&
    (("nodeInternal" in recursiveChildTimes) as { nodeInternal?: number })
  ) {
    const nodeInternal = (recursiveChildTimes as { nodeInternal?: number })
      .nodeInternal!;
    return {
      ...recursiveChildTimes,
      unknown: nodeInternal + (recursiveChildTimes.unknown || 0),
      nodeInternal: 0
    };
  }

  return recursiveChildTimes;
}
