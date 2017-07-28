const fs = require('mz/fs')
const webpack = require('webpack')
const path = require('path')
const argv = require('yargs').argv
const jsonFormat = require('json-format')
const union = require('lodash/union')
const renderHTML = require('./renderHTML')


module.exports = (config, selectedTarget) => {

  const {parsedTargets, argv} = config;

  parsedTargets.forEach(async target => {
    try {
      const targetName = target.name;
      const targetVersion = target.version;
      delete target.name;
      delete target.version;
      const compiler = !!!selectedTarget ?
        webpack(target) : 
        targetName === selectedTarget ?
          webpack(target) : 
          {run: e => console.log(`ignore: ${targetName}`)};    

      const packageFilePath = `${process.cwd()}/packages/${targetName}/package.json`;
      const packageFile = JSON.parse(await fs.readFile(packageFilePath, 'utf8'))
      packageFile.version = targetVersion
      packageFile.main = target.main || 'index.js'
      if (packageFile.hasOwnProperty('html')){
        const html = renderHTML(packageFile, config)
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