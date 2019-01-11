import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { observer } from "mobx-react";
import * as React from "react";
import { ProfileStore } from "../stores/ProfileStore";
import { prettifyExecutionTime } from "../utils/times";
import { ColorIcon } from "./ColorPalette";
import { ColorName } from "../utils/colors";

export const Summary = observer(
  ({ profileStore }: { profileStore: ProfileStore }) => (
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
              <ColorIcon colorName={nameToColorMap(row.name)} /> {row.name}
            </TableCell>
            <TableCell align="right">
              {prettifyExecutionTime(row.duration)}
            </TableCell>
            <TableCell align="right">{row.relative}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
);

function nameToColorMap(rowTitle: string): ColorName {
  if (/\-plugin/.test(rowTitle)) {
    return "Plugin";
  }
  if (/\-loader/.test(rowTitle)) {
    return "Loader";
  }
  if (/webpack/.test(rowTitle)) {
    return "Webpack";
  }
  if (rowTitle === "garbageCollector") {
    return "NodeInternal";
  }
  return "unkown";
}
