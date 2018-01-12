const fs = require('mz/fs')
const express = require('express')
const webpack = require('webpack')
const path = require('path')
const argv = require('yargs').argv
const jsonFormat = require('json-format')
const union = require('lodash/union')
const shelljs = require('shelljs')
const { match, when } = require('match-when')

const config = require('./config')
const build = require('./build')

const pkginfo = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'))

const displayHelp = () => console.log(
  `Usage:  lolla COMMAND

Options: 
  --ignore list   Ignore packages to dev or build, example: "pkg1,pkg2"
  --no-webpack    Do not use webpack to bundle, use "babel src -d ." instead

Commands:
  dev       Start a dev server
  build     Build packages
  publish   Publish packages (dev)`
)

const displayVersion = () => console.log(
  `lolla version: ${pkginfo.version}`
)

const dev = () => {
  let extraCommand = ''
  if (argv.port) extraCommand += ` --port ${config.port}`
  shelljs.exec(`node ${path.resolve(__dirname, './server.js')} ${extraCommand}`)
}

match(argv._[0], {
  [when('dev')]: dev,
  [when('build')]: build,
  [when('publish')]: () => {
    const { next } = argv
    const targetPackage = argv._[1]
    if (!!targetPackage) {
      shelljs.cd(`packages/${targetPackage}`)
      shelljs.exec(`rm -f *.js`)
      shelljs.exec(`babel src -d .`)
      shelljs.exec(`npm publish --access=public ${next ? '--tag=next' : ''}`)
      shelljs.exec(`rm -f *.js`)
    }
  },
  [when('version')]: displayVersion,
  [when('help')]: displayHelp,
  [when()]: dev
})