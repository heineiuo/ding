const express = require('express')
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const Multiprogress = require('multi-progress')
const webpackIgnore = require('./webpackIgnore')

/**
 *
 * @param {object} argv
 * @param {string} argv.config
 * @param {boolean} argv.hot
 * @param {number} argv.port
 * @param {string} argv.workdir
 */
module.exports = (argv) => {
  const multi = new Multiprogress()
  const bars = []

  const app = express()

  app.use(cors())

  let rootConfigs = require(path.resolve(process.cwd(), argv.config || './webpack.config.js'))({})

  if (!(rootConfigs instanceof Array)) {
    rootConfigs = [rootConfigs]
  }

  const targets = rootConfigs.filter(target => {
    return !webpackIgnore.includes(target.name)
  })

  if (targets.length === 0) {
    return console.log('Zero package found.')
  }

  targets.forEach((target, index) => {
    if (argv.hot) {
      Object.keys(target.entry).forEach((key) => {
        target.entry[key].unshift('webpack/hot/only-dev-server')
        target.entry[key].unshift(
          `webpack-hot-middleware/client?name=${target.name}&timeout=20000&reload=true`
        )
      })
    }
    target.devtool = 'inline-source-map'
    if (argv.hot) target.plugins.push(new webpack.HotModuleReplacementPlugin())
    target.plugins.push(new webpack.NoEmitOnErrorsPlugin())

    bars.push({
      current: 0,
      bar: multi.newBar(`${target.name} [:bar] :percent`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 1
      })
    })
    target.plugins.push(new webpack.ProgressPlugin((percentage, msg) => {
      let { bar, current } = bars[index]
      const tick = percentage - current
      bar.tick(tick)
      bars[index].current = percentage
    }))
    target.devServer = {
      hot: true,
      inline: true
    }
    target.stats = 'errors-only'
  })

  const compiler = webpack(targets)
  app.use(webpackDevMiddleware(compiler, {
    publicPath: '/',
    stats: 'errors-only'
  }))
  if (argv.hot) app.use(webpackHotMiddleware(compiler))

  app.use(compression())
  app.use('/node_modules', express.static(path.resolve(process.cwd(), './node_modules')))
  app.use(express.static(path.resolve(process.cwd(), './public')))

  app.get(/^[^.]*$/, (req, res, next) => {
    res.sendFile(path.resolve(process.cwd(), './public/index.html'))
  })

  app.listen(argv.port, () => {
    console.log(`Listening on port ${argv.port}`)
  })
}
