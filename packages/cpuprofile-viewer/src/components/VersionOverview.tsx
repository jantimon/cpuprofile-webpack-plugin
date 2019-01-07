import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { observer } from "mobx-react";
import * as React from "react";

type Versions = {
  [moduleName: string]: Array<string>;
};

const https = document.location.protocol === "https:";

export const VersionOverview = observer(
  ({ versions }: { versions: Versions }) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Versions</TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.keys(versions).map(moduleName => (
          <TableRow key={moduleName}>
            <TableCell component="th" scope="row">
              {moduleName}
            </TableCell>
            <TableCell>
              <img
                src={`http${
                  https ? "s" : ""
                }://badge.fury.io/js/${moduleName}.svg`}
              />
            </TableCell>
            <TableCell align="right">
              {versions[moduleName].join(", ")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
);
