import "d3-flame-graph/dist/d3-flamegraph.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FlameGraphComponent } from "./components/FlameGraph";
import "./d3-flame-graph.scss";
import { FlameGraphNode } from "cpuprofile-to-flamegraph";
import { ProfileStore } from "./stores/ProfileStore";
import { colorMapper } from "./utils/colors";
import { ColorPalette } from "./components/ColorPalette";
import { observer } from "mobx-react";
import { prettifyExecutionTime } from "./utils/times";
import Select from "@material-ui/core/Select";
import Paper from "@material-ui/core/Paper";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

const profileElement = document.getElementById("cpuProfile")!;
const data = JSON.parse(profileElement.innerHTML);
profileElement.parentElement!.removeChild(profileElement);

const profileStore = new ProfileStore(data);

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
    <AppBar position="static">
      <Toolbar>
        <Select
          style={{ color: "white" }}
          onChange={({ target }) => (profileStore.slot = Number(target.value))}
          value={profileStore.slot}
        >
          {profileStore.slots.map(({ duration }, i) => (
            <option value={i} key={i}>
              CPU Profile Slot {i} {prettifyExecutionTime(duration)}
            </option>
          ))}
        </Select>
      </Toolbar>
    </AppBar>

    <Paper style={{ padding: 10 }}>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ flexGrow: 1 }}>
            <ColorPalette />
          </div>
          <div style={{ alignSelf: "flex-end", flexShrink: 1 }}>
            Execution time:{" "}
            {prettifyExecutionTime(profileStore.activeSlotExecutionTime)}
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell align="right">Duration</TableCell>
              <TableCell align="right">Relative</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profileStore.durationSummary.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">
                  {prettifyExecutionTime(row.duration)}
                </TableCell>
                <TableCell align="right">{row.relative}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Paper>

    <Paper>
      <FlameGraphComponent
        colorMapper={colorMapper}
        labelMapper={labelMapper}
        flameGraphNode={profileStore.activeSlotFlameGraph}
      />
    </Paper>
  </React.Fragment>
));

const appWrapper = document.createElement("div");
document.body.appendChild(appWrapper);
ReactDOM.render(<App />, appWrapper);
