const fs = require('mz/fs')
const argv = require('yargs').argv
const union = require('lodash/union')
const defaults = require('lodash/defaults')

const configure = require('./webpack')

const ignorePackages = !argv.ignorePackages ? [] : argv.ignorePackages.split(',')

const configFilename = argv.configFilename || `${process.cwd()}/lolla.json`;
const configFile = JSON.parse(fs.readFileSync(configFilename, 'utf-8'));
const unionPackages = union(configFile.ignorePackages, ignorePackages)

Object.assign(configFile, argv, {ignorePackages: unionPackages})
configure(configFile)
defaults(configFile, {port: 8080})

module.exports = configFile