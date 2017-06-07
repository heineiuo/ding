const fs = require('mz/fs')
const express = require('express')
const webpack = require('webpack')
const path = require('path')
const argv = require('yargs').argv
const jsonFormat = require('json-format')
const union = require('lodash/union')
const renderHTML = require('./renderHTML')

const configure = require('./configure')

const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'

const build = (config, selectedTarget) => {

  const {parsedTargets, argv} = config;

  parsedTargets.forEach(async target => {
    try {
      const targetName = target.name;
      const targetVersion = target.version;
      delete target.name;
      delete target.version;
      const compiler = !!!selectedTarget ? webpack(target) : 
        targetName === selectedTarget ? webpack(target) : {run: e => console.log(`ignore: ${targetName}`)};    

      const packageFilePath = `${process.cwd()}/packages/${targetName}/package.json`;
      const packageFile = JSON.parse(await fs.readFile(packageFilePath, 'utf8'))
      packageFile.version = targetVersion
      if (config.targetsWithHTML.find(item => targetName === item)){
        const html = renderHTML(config)
        const htmlFilePath = `${process.cwd()}/packages/${targetName}/index.html`;
        await fs.writeFile(htmlFilePath, html, 'utf8')
      }
      await fs.writeFile(packageFilePath, jsonFormat(packageFile), 'utf8')
      compiler.run((err, stats) => {
        if (err) return console.error(`webpack: error, ${err.stack||e}`);
        console.log(`webpack: build ${targetName} success`);
      })

    } catch(e) {
      console.log(e)
    }
    

  });

};

const dev = (configFile) => {

  const {parsedTargets, argv} = configFile;
  const webroot = path.join(process.cwd(), configFile.webroot || configFile.devPublicPath || './');

  const app = express();

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
};


process.nextTick(() => {

  console.log(`webpack:  ${JSON.stringify(argv)}`);

  const configFilename = argv.configFilename || `${process.cwd()}/lolla.json`;
  const config = JSON.parse(fs.readFileSync(configFilename, 'utf-8'));
  const ignoreTargets = !argv.ignoreTargets ? [] : argv.ignoreTargets.split(',')
  config.ignoreTargets = union(config.ignoreTargets, ignoreTargets)
  console.log('ignore targets: ' + config.ignoreTargets || 'no ignore')

  config.argv = argv;
  const parsedTargets = config.targets
    .filter(item => !config.ignoreTargets.find(k => k === item.name))
    .map(target => {
      return Object.assign({name: target.name, version: target.version}, configure(config, target))
    });

  config.parsedTargets = parsedTargets;

  if (argv.build){
    build(config, argv.target)
  } else {
    dev(config)
  }

});
