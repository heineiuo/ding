import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'

const middleware = (targets) => {
  const app = express()
  targets.forEach(item => {
    const target = typeof item === 'function' ? item({}) : item
    Object.keys(target.entry, (key) => {
      target.entry[key].push(hotMiddlewareScript)
    })
    target.devtool = 'inline-source-map'
    if (target.hot) target.plugins.push(new webpack.HotModuleReplacementPlugin())
    target.plugins.push(new webpack.NoEmitOnErrorsPlugin())

    target.devServer = {
      hot: true,
      inline: true
    }

    console.log(target.output.publicPath)

    const compiler = webpack(target)
    app.use(webpackDevMiddleware(compiler, {
      publicPath: target.output.publicPath,
      stats: {
        colors: true
      }
    }))
    if (target.hot) app.use(webpackHotMiddleware(compiler))
  })

  return app
}

export default middleware
