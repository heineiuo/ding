const fs = require('mz/fs')
const express = require('express')
const webpack = require('webpack')
const path = require('path')
const argv = require('yargs').argv
const jsonFormat = require('json-format')
const union = require('lodash/union')
const cors = require('cors')
const renderHTML = require('./renderHTML')
const configFile = require('./config')

const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'

process.nextTick(() => {

  const {parsedTargets, argv} = configFile;
  const webroot = path.join(process.cwd(), configFile.webroot || configFile.devPublicPath || './');

  const app = express();
  app.use(cors())

  if (!argv.preview) {
    parsedTargets.forEach( target => {

      delete target.name;
      delete target.version;
      // target.entry.app.push(hotMiddlewareScript);
      target.devtool = 'inline-source-map';
      // target.plugins.push(new webpack.HotModuleReplacementPlugin());
      target.plugins.push(new webpack.NoEmitOnErrorsPlugin());

      target.devServer = {
        hot: true,
        inline: true
      };

      const compiler = webpack(target);
      app.use(require('webpack-dev-middleware')(compiler, {
        publicPath: target.output.publicPath,
        stats: {
          colors: true
        }
      }));
      // app.use(require("webpack-hot-middleware")(compiler));
      // app.use('/node_modules', express.static(`${process.cwd()}/node_modules`));
    });
  }


  app.route('/').all((req, res, next) => {
    res.write(renderHTML(configFile))
    res.end()
  })

  app.route('*').all((req, res, next) => {
    try {
      res.sendFile(`${webroot}/${req.path}`)
    } catch(e){
      res.sendStatus(404)
    }
  });


  app.listen(configFile.port, '127.0.0.1', (err) => {
    if (err) return console.log(err);
    console.log(`webpack:  Listening at http://127.0.0.1:${configFile.port}`)
  })

  console.warn('lolla: you should install loaders in this project directory')
})