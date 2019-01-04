const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const cpuProfiler = require("sync-cpuprofiler");

module.exports = function(profilePath, options) {
  function onProfileDone(profilePath) {
    const profile = readFileSync(profilePath, "utf-8");
    const html = readFileSync(
      path.resolve(__dirname, "../production.html"),
      "utf-8"
    );
    const placeholder = "%%profile%%";
    const placeholderPosition = html.indexOf(placeholder);
    const firstPart = html.substr(0, placeholderPosition);
    const secondPart = html.substr(placeholderPosition + placeholder.length);
    writeFileSync(profilePath + ".html", firstPart + profile + secondPart);
    console.log("⏱️  Profile written to ", profilePath + ".html");
  }

  cpuProfiler(profilePath, Object.assign({}, options, { onProfileDone }));
};
