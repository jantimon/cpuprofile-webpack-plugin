# cpuprofile-webpack-plugin

Generate a cpuprofile for your webpack builds  
The profile can be imported into GoogleChrome Dev Tools.

In addition a [flame graph](https://github.com/spiermar/d3-flame-graph) representation is generated:
![Flame Graph Example](https://github.com/jantimon/cpuprofile-webpack-plugin/raw/master/preview.gif "Flame Graph Example")

## ⚠️ Warning ⚠️
This library is a work in progress, use at your own risk. But feel free to help out where you see bugs or incomplete things!


## Usage

### cli

```
webpack --plugin cpuprofile-webpack-plugin
```

### dev-server

```
webpack-dev-server --plugin cpuprofile-webpack-plugin
```

### webpack.config.js

```js
const CpuProfilerWebpackPlugin = require('cpuprofile-webpack-plugin');

module.exports = {
  plugins: [
    new CpuProfilerWebpackPlugin({
      open: true // open the generated html!
    })
  ]
}
```

## Example

[Example Profile (6MB)](http://jantimon.github.io/cpuprofile-webpack-plugin)
