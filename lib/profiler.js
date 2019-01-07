const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const cpuProfiler = require("sync-cpuprofiler");

/**
 * Extract the package versions from the node require cache
 */
function getUsedNodeModules() {
  const moduleNameRegexp = /(^(webpack|webpack-cli|webpack-dev-server|loader-runner|tapable|webpack-dev-middleware|enhanced-resolve)|(\-loader|\-plugin))$/;
  const moduleNameFilter = moduleName => {
    return moduleNameRegexp.test(moduleName);
  };

  const directories = Array.from(
    new Set(Object.keys(require.cache).map(filename => path.dirname(filename)))
  );
  const nodeModulePaths = directories
    .filter(
      directory => path.basename(path.dirname(directory)) === "node_modules"
    )
    .filter(directory => moduleNameFilter(path.basename(directory), directory));

  const versions = nodeModulePaths.map(directory => {
    const name = path.basename(directory);
    const packageJsonPath = path.join(directory, "package.json");
    let version = "unknown";
    try {
      version = JSON.parse(readFileSync(packageJsonPath)).version;
    } catch (e) {}
    return {
      name,
      version,
      directory
    };
  });

  return versions.reduce(
    (result, versionInformation) => {
      result[versionInformation.name] = result[versionInformation.name]
        ? [versionInformation.version].concat(result[versionInformation.name])
        : [versionInformation.version];
      return result;
    },
    {
      node: [process.versions.node]
    }
  );
}

function writeProfileFiles(profilePath, options) {
  function onProfileDone(profilePath) {
    const profile = readFileSync(profilePath, "utf-8");
    const html = readFileSync(
      path.resolve(__dirname, "../production.html"),
      "utf-8"
    );
    const versions = JSON.stringify(getUsedNodeModules());
    const htmlParts = html.split("%~~%");
    const htmlResult =
      /* before %~~%profile%~~% */ htmlParts[0] +
      profile +
      /* after %~~%profile%~~% before %~~%versions%~~% */ htmlParts[2] +
      versions +
      /* after %~~%versions%~~% */ htmlParts[4];
    writeFileSync(profilePath + ".html", htmlResult);
    console.log(
      "⏱️  Profile written to ",
      path.relative(process.cwd(), profilePath + ".html")
    );
  }

  cpuProfiler(profilePath, Object.assign({}, options, { onProfileDone }));
}

module.exports = (profilePath, options) => {
  try {
    return writeProfileFiles(profilePath, options);
  } catch (e) {
    console.log("Writting profile failed", e);
  }
};
