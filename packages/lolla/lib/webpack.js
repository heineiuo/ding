const fs = require('fs')
const nodeExternals = require('webpack-node-externals')
const packageFile = JSON.parse(fs.readFileSync('package.json', 'UTF-8'))
const webpackLoaderExclude = (inNodeModuleButNeedCompile) => new RegExp('(node_modules\/)(?!' + inNodeModuleButNeedCompile.join('|') + ')')
const webpack = require('webpack')
const path = require('path')
const mkdirp = require('mkdirp')
const WebpackSystemRegister = require('webpack-system-register')
const BabiliPlugin = require('babili-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const trimEnd = require('lodash/trimEnd')
const defaults = require('lodash/defaults')
const StatsPlugin = require('stats-webpack-plugin')

/**
 * webpack client config
 * @param configFile
 * @param target
 */
module.exports = (configFile) => {

  configFile.packages.forEach((pkg, pkgIndex) => {

    if (configFile.ignorePackages.find(k => k === pkg.name)) {
      return console.log(`ignore: ${pkg.name}`)
    }

    defaults(pkg, {
      platform: 'web'
    })

    const distPath = path.resolve(process.cwd(), pkg.outputDir || pkg.output || pkg.name)
    const devPublicPath = `http://127.0.0.1:${configFile.port}/${pkg.name}/`
    const publicPath = `https://unpkg.com/${pkg.name}@${pkg.version}/`

    const config = {
      context: __dirname,
      devtool: false,
      entry: {
        [trimEnd(pkg.main, '.js')]: [
          path.join(process.cwd(), pkg.devEntry)
        ]
      },
      target: pkg.platform,
      output: {
        path: distPath,
        publicPath: publicPath, // css中的图片地址的前缀, 可以加上域名
        filename: '[name].js',
        library: pkg.name,
        libraryTarget: pkg.platform === 'web' ?'umd' : 'commonjs2',
        umdNamedDefine: pkg.platform === 'web' ? true : false
      },
      externals: pkg.platform === 'node' ? [nodeExternals()]: {},
      resolve: {
        alias: {},
        extensions: ['.jsx', '.js', '.json'],
        modules: [
          'node_modules',
          path.resolve(__dirname, `./node_modules`),
          path.resolve(`${process.cwd()}/node_modules`)
        ]
      },
      module: {
        rules: [
          {
            test: /\.(png|jpg|jpeg|svg|gif)$/,
            loader: 'url-loader?limit=1024&name=images/[hash].[ext]'
          },
          {
            test: /\.(json)$/,
            loader: 'json-loader'
          },
          {
            test: /\.hash\.css$/,
            use: [
              'style-loader',
              'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
            ]
          },
          {
            test: /^((?!hash).)*\.css$/,
            use: [
              'style-loader',
              'css-loader',
            ]
          },
          {
            test: /(\.js|\.jsx)$/,
            exclude: webpackLoaderExclude(configFile.modulesNeedBabel || []),
            loader: pkg['babel-loader'] || configFile['babel-loader'] || 'babel-loader'
          }
        ]
      },
      plugins: []
    }


    if (pkg.useSystemRegister) {
      // console.log('lolla: use system register')
      config.plugins.push(
        new WebpackSystemRegister({})
      )
    }

    if (pkg.externals) {
      pkg.externals.forEach(name => {
        const findExternal = configFile.externals.find(item => item.commonjs === name)
        config.externals[name] = Object.assign({ root: name }, findExternal)
      })
      // console.log(config.externals)
    }

    if (pkg.alias) {
      pkg.alias.forEach(name => {
        const findAlias = configFile.alias.find(item => item.commonjs === name)
        config.resolve.alias[name] = path.resolve(`${process.cwd()}/node_modules`, findAlias.path)
        console.log(config.resolve.alias[name])
      })
    }

    config.plugins.push(
      new StatsPlugin(`${distPath}/stats.json`, {
        chunkModules: true,
        exclude: pkg.externals.map(name => {
          return new RegExp(`/node_modules[\\\/]${name}/`)
        })
      })
    )

    if (configFile.compress) {
      // todo use uglify before bug (https://github.com/babel/babili/issues/583) fixed
      config.plugins.push(new UglifyJSPlugin())
      // config.plugins.push(new BabiliPlugin({
      //   removeConsole: true,
      //   keepFnName: true,
      //   keepClassName: true,
      // }, {
      //   test: /\.js($|\?)/i
      // }))
    }
    if (configFile.production) {
      // console.log(`[webpack configure] use define plugin, NODE_ENV: production`);
      config.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }))
    } else {
      config.output.publicPath = devPublicPath;
      // console.log(`[webpack configure] use define plugin, NODE_ENV: development`);
      config.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
      }))
    }

    configFile.packages[pkgIndex].webpack = config
  });

};
