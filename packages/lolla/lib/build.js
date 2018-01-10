const fs = require('mz/fs')
const webpack = require('webpack')
const path = require('path')
const argv = require('yargs').argv
const jsonFormat = require('json-format')
const union = require('lodash/union')
const renderHTML = require('./html')
const config = require('./config')

module.exports = () => {

  const { packages, argv } = config

  packages.forEach(async (pkg) => {
    if (!pkg.webpack) return null
    try {
      const compiler = webpack(pkg.webpack)

      const targetName = pkg.name
      const outputDir = pkg.outputDir || pkg.output || pkg.name
      const targetVersion = pkg.version

      const packageFilePath = path.resolve(process.cwd(), `${outputDir}/package.json`)
      const htmlFilePath = path.resolve(process.cwd(), `${outputDir}/index.html`)

      const packageFile = JSON.parse(await fs.readFile(packageFilePath, 'utf8'))
      packageFile.version = targetVersion
      packageFile.main = pkg.main || 'index.js'

      if (pkg.hasOwnProperty('html')) {
        await fs.writeFile(htmlFilePath, renderHTML(pkg, config), 'utf8')
      }

      await fs.writeFile(packageFilePath, jsonFormat(packageFile), 'utf8')

      compiler.run((err, stats) => {
        if (err) return console.error(`webpack: error, ${err.stack || e}`)
        console.log(`webpack: build ${targetName} success`)
      })

    } catch (e) {
      console.log(e)
    }
  })
}