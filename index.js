const profile = require("./lib/profiler");
let isListeningOnStdin = false;
const defaultOpts = {
  profilePath: void 0,
  open: true // auto open the generated html
};

module.exports = class CpuProfileWebpackPlugin {
  constructor(opts) {
    profile(Object.assign({}, defaultOpts, opts));
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
