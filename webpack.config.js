const path = require('path')
const lolla = require('./')

const publicPathPrefix = 'https://cdn.jsdeliver.net/npm'

module.exports = (env) => {
  const __DEV__ = env.NODE_ENV !== 'production'
  return [
    {
      name: 'lolla-test',
      ...lolla.createWebpackConfig({
        __DEV__,
        compress: !__DEV__,
        publicPathPrefix,
        context: path.resolve(__dirname, './examples/matcha')
      })
    }
  ]
}
