const fs = require('mz/fs')
const argv = require('yargs').argv
const union = require('lodash/union')
const defaults = require('lodash/defaults')
const configure = require('./configure')

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


defaults(config, {port: 8080})

module.exports = config