const fs = require('mz/fs')
const argv = require('yargs').argv
const union = require('lodash/union')
const defaults = require('lodash/defaults')
const configure = require('./configure')

const configFilename = argv.configFilename || `${process.cwd()}/lolla.json`;
const config = JSON.parse(fs.readFileSync(configFilename, 'utf-8'));
const ignorePackages = !argv.ignorePackages ? [] : argv.ignorePackages.split(',')
config.ignorePackages = union(config.ignorePackages, ignorePackages)
console.log('ignore targets: ' + config.ignorePackages || 'no ignore')

config.argv = argv;
const parsedTargets = config.packages
  .filter(item => !config.ignorePackages.find(k => k === item.name))
  .map(target => {
    return Object.assign({name: target.name, version: target.version}, configure(config, target))
  });

config.parsedTargets = parsedTargets;

defaults(config, {port: 8080})

module.exports = config