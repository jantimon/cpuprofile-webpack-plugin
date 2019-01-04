import AppBar from "@material-ui/core/AppBar";
import Select from "@material-ui/core/Select";
import Toolbar from "@material-ui/core/Toolbar";
import { observer } from "mobx-react";
import * as React from "react";
import { prettifyExecutionTime } from "../utils/times";
import { ProfileStore } from "../stores/ProfileStore";

export const Header = observer(
  ({ profileStore }: { profileStore: ProfileStore }) => (
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
  )
);
