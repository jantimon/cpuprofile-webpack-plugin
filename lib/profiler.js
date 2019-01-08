const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const cpuProfiler = require("sync-cpuprofiler");

/**
 * Extract the package versions from the node require cache
 */
function getUsedNodeModules() {
  const directories = Array.from(
    new Set(Object.keys(require.cache).map(filename => path.dirname(filename)))
  );

  const moduleRootDirectories = Array.from(
    new Set(
      directories
        .map(directory => {
          let parsedDirectory = path.parse(directory);
          let folders = parsedDirectory.dir
            .substr(parsedDirectory.root.length)
            .split(path.sep)
            .concat(parsedDirectory.base);
          for (let i = folders.length - 1; i >= 0; i--) {
            if (folders[i] === "node_modules") {
              const subFolder = folders[i + 1];
              if (
                subFolder.substr(0, 1) === "@" &&
                folders[i + 2] !== undefined
              ) {
                return (
                  parsedDirectory.root + folders.slice(0, i + 3).join(path.sep)
                );
              }
              return (
                parsedDirectory.root + folders.slice(0, i + 2).join(path.sep)
              );
            }
          }
        })
        .filter(directory => directory)
    )
  );

  const moduleNameRegexp = /(^(webpack|webpack-cli|webpack-dev-server|loader-runner|tapable|webpack-dev-middleware|enhanced-resolve|typescript|babel|@babel.core)|(\-loader|\-plugin))$/;
  const moduleNameFilter = moduleName => {
    return moduleNameRegexp.test(moduleName);
  };
  const matchingModulePaths = moduleRootDirectories
    .filter(
      directory => path.basename(path.dirname(directory)) === "node_modules"
    )
    .filter(directory => moduleNameFilter(path.basename(directory), directory));

  const versions = matchingModulePaths.map(directory => {
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

  versions.sort((packageA, packageB) =>
    packageA.name > packageB.name ? 1 : packageA.name < packageB.name ? -1 : 0
  );

  return versions.reduce(
    (result, versionInformation) => {
      result[versionInformation.name] = result[versionInformation.name]
        ? [versionInformation.version].concat(result[versionInformation.name])
        : [versionInformation.version];
      return result;
    },
    {
      os: [process.platform],
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
