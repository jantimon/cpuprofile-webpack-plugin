# cpuprofile-webpack-plugin

Generate a cpuprofile for your webpack builds  
The profile can be imported into GoogleChrome Dev Tools.

In addition a [flame graph](https://github.com/spiermar/d3-flame-graph) representation is generated:
![Flame Graph Example](https://github.com/jantimon/cpuprofile-webpack-plugin/raw/master/preview.gif "Flame Graph Example")


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
require('cpuprofile-webpack-plugin');
```

