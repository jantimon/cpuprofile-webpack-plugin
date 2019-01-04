import { colors } from "../utils/colors";
import * as React from "react";

const colorNames = Object.keys(colors);

export const ColorPalette = () => (
  <div style={{ minWidth: 200, paddingTop: 15 }}>
    {colorNames.map(colorName => (
      <div key={colorName} style={{ whiteSpace: "nowrap" }}>
        <div
          className="palette__color"
          style={{
            background: colors[colorName],
            width: 10,
            height: 10,
            border: "1px solid #333",
            display: "inline-block",
            marginRigh: 5
          }}
        />
        <span className="palette__color-name"> {colorName}</span>
      </div>
    ))}
  </div>
);
