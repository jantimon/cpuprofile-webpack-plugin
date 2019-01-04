require('./lib/profiler')();
let isListeningOnStdin = false;

module.exports = class CpuProfileWebpackPlugin {
  apply(compiler) {
    compiler.hooks.watchRun.tapAsync('CpuProfileWebpackPlugin', (compiler, callback) => {
      if (!isListeningOnStdin) {
        process.stdin.resume();
        isListeningOnStdin = true;
      }
      callback();
    });
  }
};