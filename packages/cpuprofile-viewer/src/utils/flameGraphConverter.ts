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
    const nextNode = originalChildren[i - 1];
    const previousNodeIsProgramNode =
      previousNode && previousNode.name === "(program)";
    const nextNodeIsProgramNode = nextNode && nextNode.name === "(program)";
    // Don't remove nodes if surrounded by program nodes
    if (!previousNodeIsProgramNode || !nextNodeIsProgramNode) {
      filteredChildren.push(childNode);
      continue;
    }
    const surroundedExecutionTime =
      previousNode.executionTime + nextNode.executionTime;
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
