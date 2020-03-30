const profile = require("./lib/profiler");
let isListeningOnStdin = false;
const defaultOpts = {
  open: true // auto open the generated html
};

module.exports = class CpuProfileWebpackPlugin {
  constructor(profilePath, opts) {
    profile(profilePath, Object.assign({}, defaultOpts, opts));
  }
  apply(compiler) {
    compiler.hooks.watchRun.tapAsync(
      "CpuProfileWebpackPlugin",
      (compiler, callback) => {
        if (!isListeningOnStdin) {
          process.stdin.resume();
          isListeningOnStdin = true;
        }
        callback();
      }
    );
  }
};
