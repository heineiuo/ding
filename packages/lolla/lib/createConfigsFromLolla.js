const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv
const union = require('lodash/union')
const omit = require('lodash/omit')
const defaults = require('lodash/defaults')
const createWebpackConfig = require('./createWebpackConfig')

const createConfigsFromLolla = (lollaFile = `${process.cwd()}/lolla.json`) => {
  try {
    const lollaJSON = JSON.parse(fs.readFileSync(lollaFile, 'utf-8'))
    return lollaJSON.packages.map(pkg => {
      return createWebpackConfig(
        Object.assign(
          {
            __DEV__: !(process.env.NODE_ENV === 'production') && !argv.production,
            compress: argv.compress
          },
          omit(lollaJSON, ['packages']),
          pkg,
          {
            context: path.resolve(process.cwd(), pkg.context)
          }
        )
      )
    })
  } catch(e){
    console.log('Could not find lolla.json')
    return []
  }
}

module.exports = createConfigsFromLolla