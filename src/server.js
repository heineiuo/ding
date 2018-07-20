import express from 'express'
import { argv } from 'yargs'
import cors from 'cors'
import compression from 'compression'
import serveIndex from 'serve-index'
import createConfigsFromLolla from './createConfigsFromLolla'
import lolla from './express'

const start = () => {
  const app = express()
  app.use(cors())
  app.use(compression())

  app.use(lolla({
    packages: createConfigsFromLolla()
  }))

  app.route('*').all(
    express.static(process.cwd()), serveIndex(process.cwd(), {
      icons: true
    }))

  const port = argv.port || process.env.PORT || 9090

  app.listen(port, (err) => {
    if (err) return console.log(err)
    console.log(`webpack:  Listening at http://localhost:${port}`)
  })

  console.warn('lolla: you should install loaders in this project directory')
}

export default start
