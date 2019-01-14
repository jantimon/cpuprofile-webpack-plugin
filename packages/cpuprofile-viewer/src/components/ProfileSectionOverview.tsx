import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { observer } from "mobx-react";
import * as React from "react";
import { ProfileStore, Slot } from "../stores/ProfileStore";
import { prettifyExecutionTime } from "../utils/times";
import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";

function sleepDuration(profileStore: ProfileStore, start: number, end: number) {
  let duration = 0;
  for (let i = start; i <= end; i++) {
    duration += profileStore.filteredFlameGraph.children[i].executionTime;
  }
  return duration;
}

export const ProfileSectionOverview = observer(
  ({ profileStore }: { profileStore: ProfileStore }) => {
    const hasIncrementalBuilds = profileStore.buildSlotIndexes.length > 1;
    return (
      <React.Fragment>
        {hasIncrementalBuilds && (
          <Typography variant="h6" style={{ marginTop: 20, marginBottom: 10 }}>
            Initial build
          </Typography>
        )}
        <ProfileSectionTable
          profileStore={profileStore}
          slots={profileStore.buildSlotIndexes[0]}
        />
        {hasIncrementalBuilds &&
          profileStore.buildSlotIndexes.map(
            (slots, i) =>
              i > 0 && (
                <React.Fragment>
                  <Typography
                    variant="h6"
                    style={{ marginTop: 20, marginBottom: 10 }}
                  >
                    Incremental build {i}
                  </Typography>
                  <ProfileSectionTable
                    profileStore={profileStore}
                    slots={slots}
                  />
                </React.Fragment>
              )
          )}
      </React.Fragment>
    );
  }
);

export const ProfileSectionTable = observer(
  ({
    profileStore,
    slots
  }: {
    slots: Array<Slot>;
    profileStore: ProfileStore;
  }) => {
    return (
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
          {slots
            .filter(slot => slot.slotIndex > 0)
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
                    {Object.keys(profileStore.slotPhases[slot.slotIndex])
                      .filter(
                        phaseName =>
                          profileStore.slotPhases[slot.slotIndex][phaseName]
                      )
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => (profileStore.slot = slot.slotIndex)}
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
    );
  }
);
