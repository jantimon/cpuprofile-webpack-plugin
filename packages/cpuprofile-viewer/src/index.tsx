import Paper from "@material-ui/core/Paper";
import { FlameGraphNode } from "cpuprofile-to-flamegraph";
import "d3-flame-graph/dist/d3-flamegraph.css";
import { observer } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ColorPalette } from "./components/ColorPalette";
import { FlameGraphComponent } from "./components/FlameGraph";
import { Header } from "./components/Header";
import { VersionOverview } from "./components/VersionOverview";
import "./d3-flame-graph.scss";
import { ProfileStore } from "./stores/ProfileStore";
import { colorMapper } from "./utils/colors";
import { prettifyExecutionTime } from "./utils/times";
import { Summary } from "./components/Summary";
import { Options } from "./components/Options";

const versionElement = document.getElementById("versions")!;
const versions = JSON.parse(versionElement.innerHTML);

const profileElement = document.getElementById("cpuProfile")!;
const cpuProfileData = JSON.parse(profileElement.innerHTML);
profileElement.parentElement!.removeChild(profileElement);

const profileStore = new ProfileStore(cpuProfileData);

function labelMapper({ data }: { data: FlameGraphNode }) {
  return (
    (data.nodeModule ? "<div><b>" + data.nodeModule + "</b></div>" : "") +
    "<div>name: " +
    data.name +
    "</div> file: " +
    data.profileNode.callFrame.url
      .split(/(\\|\/)/)
      .slice(-5)
      .join("") +
    ":" +
    data.profileNode.callFrame.lineNumber +
    ":" +
    data.profileNode.callFrame.columnNumber +
    "<br />" +
    prettifyExecutionTime(data.executionTime)
  );
}

const App = observer(() => (
  <React.Fragment>
    <Header profileStore={profileStore} />
    <Paper style={{ padding: 10 }}>
      <div style={{ display: "flex" }}>
        <ColorPalette />
        <Options profileStore={profileStore} />
        {profileStore.slot ? <Summary profileStore={profileStore} /> : <div />}
      </div>
    </Paper>

    {profileStore.slot ? (
      <Paper>
        <FlameGraphComponent
          colorMapper={colorMapper}
          labelMapper={labelMapper}
          flameGraphNode={profileStore.activeSlotFlameGraph}
        />
      </Paper>
    ) : (
      <Paper>
        <VersionOverview versions={versions} />
      </Paper>
    )}
  </React.Fragment>
));

const appWrapper = document.createElement("div");
document.body.appendChild(appWrapper);
ReactDOM.render(<App />, appWrapper);
