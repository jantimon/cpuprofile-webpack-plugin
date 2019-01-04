const CpuProfilerWebpackPlugin = require("../");

module.exports = {
  context: __dirname,
  plugins: [new CpuProfilerWebpackPlugin()]
};
