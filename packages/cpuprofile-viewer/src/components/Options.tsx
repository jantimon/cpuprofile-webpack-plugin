import * as React from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import { ProfileStore } from "../stores/ProfileStore";
import { observer } from "mobx-react";
import { prettifyExecutionTime } from "../utils/times";

export const Options = observer(
  ({ profileStore }: { profileStore: ProfileStore }) => (
    <div style={{ minWidth: 200 }}>
      <div>
        <Select
          onChange={({ target }) => (profileStore.slot = Number(target.value))}
          value={profileStore.slot}
        >
          {profileStore.slots.map(({ duration }, i) => (
            <option value={i} key={i}>
              Part {i} ({prettifyExecutionTime(duration)})
            </option>
          ))}
        </Select>
      </div>
      <FormControlLabel
        control={
          <Checkbox
            checked={profileStore.showGarbageCollector}
            onClick={() => {
              profileStore.showGarbageCollector = !profileStore.showGarbageCollector;
            }}
          />
        }
        label="garbage collector"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={profileStore.hideSmallSlots}
            onClick={() => {
              profileStore.hideSmallSlots = !profileStore.hideSmallSlots;
            }}
          />
        }
        label="hide small slots"
      />
    </div>
  )
);
