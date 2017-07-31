const fs = require('mz/fs')
const express = require('express')
const webpack = require('webpack')
const path = require('path')
const argv = require('yargs').argv
const jsonFormat = require('json-format')
const union = require('lodash/union')
const shelljs = require('shelljs')

const config = require('./config')
const build = require('./build')

const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'

process.nextTick(() => {

  if (argv.build) {
    build()
  } else {
    
    let extraCommand = '';
    if (argv.port) extraCommand += ` --port ${config.port}`
    shelljs.exec(`node ${path.resolve(__dirname, './server.js')} ${extraCommand}`);

  }

});
