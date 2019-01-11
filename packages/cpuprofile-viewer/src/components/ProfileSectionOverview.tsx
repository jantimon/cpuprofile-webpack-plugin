import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { observer } from "mobx-react";
import * as React from "react";
import { ProfileStore } from "../stores/ProfileStore";
import { prettifyExecutionTime } from "../utils/times";
import Button from "@material-ui/core/Button";

function sleepDuration(profileStore: ProfileStore, start: number, end: number) {
  let duration = 0;
  for (let i = start; i <= end; i++) {
    duration += profileStore.filteredFlameGraph.children[i].executionTime;
  }
  return duration;
}

export const ProfileSectionOverview = observer(
  ({ profileStore }: { profileStore: ProfileStore }) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Part</TableCell>
          <TableCell align="right">Duration</TableCell>
          <TableCell>Phases</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {profileStore.slots
          .filter((slot, i) => i > 0)
          .map((slot, i, slots) => (
            <React.Fragment key={`${slot.start}-${slot.end}`}>
              {i === 0 ? null : (
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ color: "#999" }}
                  >
                    Sleep
                  </TableCell>
                  <TableCell align="right" style={{ color: "#999" }}>
                    {prettifyExecutionTime(
                      sleepDuration(
                        profileStore,
                        slots[i - 1].end + 1,
                        slot.start - 1
                      )
                    )}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              )}
              <TableRow>
                <TableCell component="th" scope="row" align="right">
                  {i + 1}
                </TableCell>
                <TableCell align="right">
                  {prettifyExecutionTime(slot.duration)}
                </TableCell>
                <TableCell>
                  {Object.keys(profileStore.slotPhases[i + 1])
                    .filter(
                      phaseName => profileStore.slotPhases[i + 1][phaseName]
                    )
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => (profileStore.slot = i + 1)}
                    color="primary"
                    variant="contained"
                  >
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
      </TableBody>
    </Table>
  )
);
