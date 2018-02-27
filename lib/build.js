const fs = require('fs')
const webpack = require('webpack')
const path = require('path')
const union = require('lodash/union')

const createConfigsFromLolla = require('./createConfigsFromLolla')

const build = () => {
  const packages = createConfigsFromLolla()
  packages.forEach(async (pkg) => {
    try {
      const compiler = webpack(pkg)
      compiler.run((err, stats) => {
        if (err) return console.error(`webpack: error, ${err.stack || e}`)
      })
    } catch (e) {
      console.log(e)
    }
  })
}

module.exports = build