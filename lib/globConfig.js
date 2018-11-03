const glob = require('glob')
const path = require('path')
const fs = require('fs')

module.exports = (env) => {
  const result = []
  glob.sync(path.resolve(process.cwd(), './packages/*/webpack.config.js'))
    .forEach(fullPath => {
      try {
        let target = require(fullPath)
        if (typeof target === 'function') {
          target = target(env)
        }
        const packagePath = path.resolve(
          path.dirname(fullPath),
          './package.json'
        )
        const packageJSON = JSON.parse(
          fs.readFileSync(packagePath, 'utf8')
        )

        target.name = packageJSON.name
        result.push(target)
      } catch (e) {
        console.error(e)
      }
    })

  return result
}
