import React from "react";
import { FlameGraphNode } from "cpuprofile-to-flamegraph";
import { easeCubic, select } from "d3";
import { flamegraph } from "d3-flame-graph";
import { observer } from "mobx-react";

type Props = {
  colorMapper: ({ data }: { data: FlameGraphNode }) => string;
  labelMapper: ({ data }: { data: FlameGraphNode }) => string;
  onClick?: () => any;
  flameGraphNode: FlameGraphNode;
};

@observer
export class FlameGraphComponent extends React.Component<Props, {}> {
  wrapperRef = React.createRef<HTMLDivElement>();

  onClickHandler() {
    this.props.onClick && this.props.onClick();
  }

  colorMapper(data: { data: FlameGraphNode }) {
    return this.props.colorMapper(data);
  }

  labelMapper(data: { data: FlameGraphNode }) {
    return this.props.labelMapper(data);
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  renderChart() {
    const wrapper = this.wrapperRef.current;
    if (!wrapper) {
      return;
    }
    const flameGraph = flamegraph()
      .width(1600)
      .cellHeight(18)
      .transitionDuration(250)
      .minFrameSize(0.1)
      .inverted(true)
      .transitionEase(easeCubic)
      .sort(false)
      .onClick(this.onClickHandler.bind(this))
      .differential(false)
      .elided(false)
      .selfValue(false)
      .setColorMapper(this.colorMapper.bind(this))
      .label(this.labelMapper.bind(this));
    const chart = document.createElement("div");
    select(chart)
      .datum(this.props.flameGraphNode)
      .call(flameGraph);

    // Resize to 100% width
    const svg = chart.querySelector("svg")!;
    svg.setAttribute(
      "viewBox",
      `0 0 ${svg.getAttribute("width")} ${svg.getAttribute("height")}`
    );
    svg.style.width = "100%";
    svg.style.height = "auto";

    wrapper.innerHTML = "";
    wrapper.appendChild(chart);
  }

  render() {
    return <div ref={this.wrapperRef} />;
  }
}
