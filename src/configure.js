const fs = require('fs')
const nodeExternals = require('webpack-node-externals')
const packageFile = JSON.parse(fs.readFileSync('package.json', 'UTF-8'))
const webpackLoaderExclude = (inNodeModuleButNeedCompile) => new RegExp('(node_modules\/)(?!'+inNodeModuleButNeedCompile.join('|')+')')
const webpack = require('webpack')
const path = require('path')
const mkdirp = require('mkdirp')
const WebpackSystemRegister = require('webpack-system-register')
const BabiliPlugin = require('babili-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

/**
 * webpack client config
 * @param configFile
 * @param target
 */
module.exports = (configFile, target) => {

  console.log(`[webpack target] name: ${target.name}, main: ${target.main}`);

  const {argv} = configFile;

  const distPath = `./packages/${target.name}/dist/`
  const devPublicPath = `http://127.0.0.1:${configFile.port}/${target.name}/dist/`
  const publicPath = `https://unpkg.com/${target.name}@${target.version}/dist/`

  const config = {
    context: __dirname,
    devtool: false,
    entry: {
      [target.name]: [
        path.join(process.cwd(), target.main)
      ]
    },
    target: 'web',
    output: {
      path: `${path.join(process.cwd(), distPath)}/`,
      // css中的图片地址的前缀, 可以加上域名
      publicPath: publicPath,
      filename: '[name].js',
      libraryTarget: 'umd',
      library: target.name,
      umdNamedDefine: true
    },
    externals: {},
    resolve: {
      alias: {},
      extensions: ['.jsx', '.js', '.json'],
      modules: [
        'node_modules',
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
          exclude: webpackLoaderExclude(configFile.modulesNeedBabel|| []),
          loader: !configFile.hasOwnProperty('babel-loader') ? 'babel-loader': 
            configFile['babel-loader']
        }
      ]
    },
    plugins: []
  };
  
  if (target.useSystemRegister) {
    console.log('lolla: use system register')
    config.plugins.push(
      new WebpackSystemRegister({})
    )
  }

  if (argv.compress) {

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

  if (target.externals) {
    target.externals.forEach(name => {
      const findExternal = configFile.externals.find(item => item.commonjs === name)
      config.externals[name] = Object.assign({root: name}, findExternal)
    })
    console.log(config.externals)
  }

  if (configFile.alias) {
    Object.keys(configFile.alias).forEach(name => {
      config.resolve.alias[name] = path.join(`${process.cwd()}/node_modules`, configFile.alias[name])
    })
  }

  if (argv.production) {
    console.log(`[webpack configure] use define plugin, NODE_ENV: production`);
    config.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }))
  } else {
    config.output.publicPath = devPublicPath;
    console.log(`[webpack configure] use define plugin, NODE_ENV: development`);
    config.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }))
  }

  return config

};
