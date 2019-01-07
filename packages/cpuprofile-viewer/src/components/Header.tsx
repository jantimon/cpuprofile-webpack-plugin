import AppBar from "@material-ui/core/AppBar";
import Select from "@material-ui/core/Select";
import Toolbar from "@material-ui/core/Toolbar";
import { observer } from "mobx-react";
import * as React from "react";
import { ProfileStore } from "../stores/ProfileStore";
import Typography from "@material-ui/core/Typography";

export const Header = observer(
  ({ profileStore }: { profileStore: ProfileStore }) => (
    <AppBar position="static">
      <Toolbar>
        <Typography style={{ color: "white" }} variant="h6">
          CPU Profile Viewer - Part {profileStore.slot}
        </Typography>
      </Toolbar>
    </AppBar>
  )
);
