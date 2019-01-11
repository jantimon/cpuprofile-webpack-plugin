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
    console.log({
      previousNode: previousNode.executionTime,
      childNode: childNode.executionTime,
      nextNode: nextNode.executionTime,
      surroundedExecutionTime
    });
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

  if (
    nodeCategory === "plugin" ||
    nodeCategory === "loader" ||
    nodeCategory === "webpack"
  ) {
    const webpack = (recursiveChildTimes as { webpack?: number }).webpack || 0;
    const selfTiming =
      timingKey === "webpack"
        ? 0
        : (recursiveChildTimes as any)[timingKey] || 0;
    return {
      ...recursiveChildTimes,
      webpack: 0,
      [timingKey]: recursiveChildTimes.unknown + webpack + selfTiming,
      unknown: 0
    };
  }

  return recursiveChildTimes;
}
