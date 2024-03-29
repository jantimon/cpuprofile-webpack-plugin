import { computed, observable } from "mobx";
import {
  Profile,
  convertToMergedFlameGraph,
  FlameGraphNode
} from "cpuprofile-to-flamegraph";
import { getCpuProfileWithoutGarbageCollectionNodes } from "../utils/cpuProfileConverter";
import {
  getFlameGraphWithoutPauseBreakers,
  getFlameGraphNodeTiminigs
} from "../utils/flameGraphConverter";

export type Slot = {
  flameGraphNode: FlameGraphNode & {
    children: FlameGraphNode[];
    executionTime: number;
  };
  start: number;
  end: number;
  duration: number;
  slotIndex: number;
};

export class ProfileStore {
  cpuProfile: Profile;
  /**
   * Pause time in micro seconds (1000000 = 1s)
   */
  @observable minimalPauseTime: number = 200000;
  @observable slot: number = 0;
  @observable showGarbageCollector: boolean = false;
  @observable hideSmallSlots: boolean = true;

  constructor(cpuProfile: Profile) {
    this.cpuProfile = cpuProfile;
  }

  @computed get filteredCpuProfile(): Profile {
    if (this.showGarbageCollector) {
      return this.cpuProfile;
    } else {
      return getCpuProfileWithoutGarbageCollectionNodes(this.cpuProfile);
    }
  }

  /**
   * Get the merged flameGraph root node
   */
  @computed get mergedFlameGraph() {
    const graph = convertToMergedFlameGraph(this.filteredCpuProfile);
    graph.children.unshift({
      value: 0,
      name: "(init)",
      executionTime: 0,
      children: [],
      profileNode: {
        id: -1,
        callFrame: {
          scriptId: "-1",
          functionName: "(init)",
          lineNumber: -1,
          columnNumber: -1,
          url: ""
        }
      }
    });
    return graph;
  }

  @computed get filteredFlameGraph() {
    return this.hideSmallSlots
      ? getFlameGraphWithoutPauseBreakers(this.mergedFlameGraph)
      : this.mergedFlameGraph;
  }

  /**
   * Return the execution time of the entire profile
   */
  @computed get executionTime(): number {
    return this.cpuProfile.endTime - this.cpuProfile.startTime;
  }

  @computed get slotPositions() {
    const children = this.filteredFlameGraph.children;
    let currentExecutionSum = 0;
    let currentSlotStart = 0;
    const slots: Array<{ start: number; end: number; duration: number }> = [];
    for (let i = 0; i <= children.length; i++) {
      const node = children[i];
      if (
        node === undefined ||
        (node.name === "(program)" &&
          node.executionTime > this.minimalPauseTime)
      ) {
        if (currentSlotStart !== i) {
          slots.push({
            start: currentSlotStart,
            end: i - 1,
            duration: currentExecutionSum
          });
        }
        currentExecutionSum = 0;
        currentSlotStart = i + 1;
      } else {
        currentExecutionSum += node.executionTime;
      }
    }
    const filteredSlots =
      this.hideSmallSlots === false
        ? slots
        : slots.filter((slot, i) => slot.duration > 50000);
    filteredSlots.unshift({
      start: 0,
      end: 0,
      duration: 0
    });
    return filteredSlots.map((slot, i) =>
      Object.assign(slot, { slotIndex: i })
    );
  }

  @computed get slots(): Array<Slot> {
    return this.slotPositions.map(slotPosition => {
      const childNodes = this.filteredFlameGraph.children.filter(
        (_, i) => i >= slotPosition.start && i <= slotPosition.end
      );
      const flameGraphNode = Object.assign({}, this.filteredFlameGraph, {
        children: childNodes,
        executionTime: slotPosition.duration
      });

      return {
        ...slotPosition,
        flameGraphNode
      };
    });
  }

  @computed get slotPhases() {
    return this.slotsTimeDetails.map(timing => ({
      loader: Object.keys(timing).some(key => key.indexOf("(loader)") !== -1),
      parse: Boolean(timing["parse (webpack)"]),
      seal: Boolean(timing["seal (webpack)"]),
      emit: Boolean(timing["emit (webpack)"])
    }));
  }

  /**
   * Slots which include the `emitFiles` phase
   * are concidered to be the end of a build
   *
   * buildSlotIndexes includes all builds split by
   * a emit phase
   */
  @computed get buildSlotIndexes(): Array<Array<Slot>> {
    const phases = this.slotPhases;
    const slots = this.slots;
    const builds: Array<Array<Slot>> = [];
    let buildIndex = 0;
    for (let i = 0; i < slots.length; i++) {
      if (!builds[buildIndex]) {
        builds.push([]);
      }
      builds[buildIndex].push(slots[i]);
      if (phases[i].emit) {
        buildIndex++;
      }
    }
    return builds;
  }

  @computed get slotsTimeDetails() {
    return this.slots.map(({ flameGraphNode }) => {
      return getFlameGraphNodeTiminigs(flameGraphNode);
    });
  }

  /**
   * Returns the flame graph of the active slot
   */
  @computed get activeSlotFlameGraph() {
    const activeSlot = Math.min(this.slots.length - 1, this.slot);
    return this.slots[activeSlot].flameGraphNode;
  }

  /**
   * Active slot execution time
   */
  @computed get activeSlotExecutionTime() {
    function getNodeTime(node: FlameGraphNode) {
      return (
        node.value +
        node.children.reduce(
          (sum, childNode) => sum + getNodeTime(childNode),
          0
        )
      );
    }
    return getNodeTime(this.activeSlotFlameGraph);
  }

  @computed get durationSummary() {
    const nodeTimes = getFlameGraphNodeTiminigs(this.activeSlotFlameGraph);
    const sum = Object.keys(nodeTimes).reduce(
      (sum, timeName) => sum + nodeTimes[timeName],
      0
    );
    const result = Object.keys(nodeTimes).map(timeName => {
      return {
        name: timeName,
        duration: nodeTimes[timeName],
        relative:
          sum === 0 ? "0%" : Math.round((nodeTimes[timeName] / sum) * 100) + "%"
      };
    });
    result.sort((a, b) =>
      a.duration > b.duration ? -1 : a.duration < b.duration ? 1 : 0
    );
    return result;
  }
}
