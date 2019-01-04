import * as React from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { ProfileStore } from "../stores/ProfileStore";
import { observer } from "mobx-react";

export const Options = observer(
  ({ profileStore }: { profileStore: ProfileStore }) => (
    <div style={{ minWidth: 200 }}>
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
