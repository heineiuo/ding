import fs from 'fs'
import path from 'path'
import nodeExternals from 'webpack-node-externals'
import webpack from 'webpack'
import WebpackSystemRegister from 'webpack-system-register'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import defaults from 'lodash/defaults'
import Visualizer from 'webpack-visualizer-plugin'
import url from 'url'

/**
 * webpack client config
 * @param configFile
 * @param target
 */
const createWebpackConfig = (configFile) => {
  /**
   * @deprecated devUnpkgOrigin and unpkgOrigin will be deprecated
   */
  if (!configFile.publicPathPrefix && configFile.unpkgOrigin) {
    console.warn(`'unpkgOrigin' will be deprecated`)
    configFile.publicPathPrefix = configFile.unpkgOrigin
  }

  defaults(configFile, {
    __DEV__: process.env.NODE_ENV !== 'production',
    context: process.cwd(),
    platform: 'web',
    entry: './src/index.js',
    nodeModulesDir: './node_modules',
    packageFile: './package.json',
    outputDir: './umd/',
    publicPathPrefix: 'https://cdn.jsdelivr.net/npm'
  })

  const {
    __DEV__,
    context,
    platform,
    nodeModulesDir,
    packageFile,
    outputDir,
    publicPathPrefix
  } = configFile

  const packageJSON = JSON.parse(
    fs.readFileSync(path.resolve(context, packageFile), 'utf8')
  )

  const nodeModulesPath = path.resolve(context, nodeModulesDir) + path.sep
  const outputPath = path.resolve(context, outputDir) + path.sep
  const publicPath = url.resolve(publicPathPrefix, '') +
    path.posix.resolve(`/${packageJSON.name}@${__DEV__ ? 'latest' : packageJSON.version}`, outputDir).substr(1) + path.sep
  const entryName = path.basename(packageJSON.name)

  const config = {
    context,
    devtool: false,
    node: {
      fs: 'empty'
    },
    entry: {
      [entryName]: [
        path.resolve(context, configFile.entry)
      ]
    },
    target: platform,
    output: {
      path: outputPath,
      publicPath: publicPath, // css中的图片地址的前缀, 可以加上域名
      filename: `[name].${__DEV__ ? 'development' : 'production'}.js`,
      library: packageJSON.name,
      libraryTarget: platform === 'web' ? 'umd' : 'commonjs2',
      umdNamedDefine: platform === 'web'
    },
    externals: platform === 'node' ? [nodeExternals()] : {},
    resolve: {
      alias: {},
      extensions: ['.jsx', '.js', '.json'],
      modules: [
        'node_modules',
        path.resolve(context, `node_modules`)
      ]
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|jpeg|svg|gif|bmp|jpeg)$/,
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
            'css-loader'
          ]
        },
        {
          test: /(\.js|\.jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },
    plugins: []
  }

  if (configFile.useSystemRegister) {
    // console.log('lolla: use system register')
    config.plugins.push(
      new WebpackSystemRegister({})
    )
  }

  if (configFile.externals) {
    configFile.externals.forEach(externalItem => {
      config.externals[externalItem.commonjs] = Object.assign({
        root: externalItem.commonjs
      }, externalItem)
    })
    // console.log(config.externals)
  }

  if (configFile.alias) {
    configFile.alias.forEach(aliasItem => {
      config.resolve.alias[aliasItem.commonjs] = path.resolve(nodeModulesPath, aliasItem.path)
      // console.log(config.resolve.alias[aliasItem])
    })
  }

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
  if (__DEV__) {
    // console.log(`[webpack configure] use define plugin, NODE_ENV: development`)
    config.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }))
  } else {
    // console.log(`[webpack configure] use define plugin, NODE_ENV: production`)
    // config.plugins.push(
    //   new StatsPlugin(`./stats.json`, {
    //     chunkModules: true,
    //     exclude: configFile.externals.map(name => {
    //       return new RegExp(`/node_modules[\\\/]${name}/`)
    //     })
    //   })
    // )
    config.plugins.push(new Visualizer({
      filename: `./stats.html`
    }))
    config.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }))
  }

  return config
}

export default createWebpackConfig
