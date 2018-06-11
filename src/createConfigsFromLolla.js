const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv
const omit = require('lodash/omit')
const createWebpackConfig = require('./createWebpackConfig')

console.log(`reading ${process.cwd()}/lolla.json`)

const createConfigsFromLolla = (lollaFile = `${process.cwd()}/lolla.json`) => {
  try {
    const lollaJSON = JSON.parse(fs.readFileSync(lollaFile, 'utf-8'))
    const configs = []
    lollaJSON.packages.forEach(pkg => {
      if (pkg.ignore) return console.log(`ignore package: ${pkg.context}`)
      try {
        configs.push(createWebpackConfig(
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
        ))
      } catch (e) {
        console.log(`valid fail, context': ${pkg.context}`)
        console.log(e)
      }
    })
    return configs
  } catch (e) {
    console.log('Could not find lolla.json or format error')
    console.log(e)
    return []
  }
}

module.exports = createConfigsFromLolla
