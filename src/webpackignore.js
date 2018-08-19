const fs = require('fs')
const path = require('path')

function getWebpackIgnore () {
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), './.webpackignore'), 'utf8')
    return content.split(/\r?\n/)
  } catch (e) {
    return []
  }
}

module.exports = getWebpackIgnore()
