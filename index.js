const { profile, setOptions } = require("./lib/profiler");

// start profiling
profile();

let isListeningOnStdin = false;

module.exports = class CpuProfileWebpackPlugin {
  constructor(opts = {}) {
    // set profiling options
    setOptions(opts);
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
