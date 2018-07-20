import fs from 'fs'
import path from 'path'
import omit from 'lodash/omit'
import createWebpackConfig from './createWebpackConfig'

// console.log(`reading ${process.cwd()}/lolla.json`)

const createConfigsFromLolla = (
  lollaFile = `${process.cwd()}/lolla.json`,
  compress = false
) => {
  try {
    const lollaJSON = JSON.parse(fs.readFileSync(lollaFile, 'utf-8'))
    const configs = []
    lollaJSON.packages.forEach(pkg => {
      if (pkg.ignore) return console.log(`ignore package: ${pkg.context}`)
      try {
        configs.push(createWebpackConfig(
          Object.assign(
            {
              __DEV__: process.env.NODE_ENV !== 'production',
              compress: compress
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

export default createConfigsFromLolla
