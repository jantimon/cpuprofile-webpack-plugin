import { Profile } from "cpuprofile-to-flamegraph";

/**
 * Return a copy of the given cpuProfile
 * with all samples matching the expression
 */
export function filterCpuProfileSampleNodes(
  cpuProfile: Profile,
  filterFunction: (cpuProfileNodeId: number, index: number) => boolean
) {
  const filteredSamples: Array<number> = [];
  const filteredTimeDeltas: Array<number> = [];
  for (let i = 0; i < cpuProfile.samples.length; i++) {
    const sampleId = cpuProfile.samples[i];
    if (filterFunction(sampleId, i)) {
      filteredSamples.push(sampleId);
      filteredTimeDeltas.push(cpuProfile.timeDeltas[i]);
    }
  }
  return {
    ...cpuProfile,
    samples: filteredSamples,
    timeDeltas: filteredTimeDeltas
  };
}

/**
 * Returns the cpuProfile without nodes named "(garbage collector)"
 */
export function getCpuProfileWithoutGarbageCollectionNodes(
  cpuProfile: Profile
) {
  // Get profile without garbage collector entries
  const garbageCollectorIds = cpuProfile.nodes
    .filter(node => node.callFrame.functionName === "(garbage collector)")
    .map(node => node.id);
  // Get profile without nodes with a garbage collector id
  return filterCpuProfileSampleNodes(
    cpuProfile,
    cpuProfileNodeId => garbageCollectorIds.indexOf(cpuProfileNodeId) === -1
  );
}
