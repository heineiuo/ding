import webpack from 'webpack'
import createConfigsFromLolla from './createConfigsFromLolla'

const build = () => {
  const packages = createConfigsFromLolla()
  packages.forEach(async (pkg) => {
    try {
      const compiler = webpack(pkg)
      compiler.run((err, stats) => {
        if (err) return console.error(`webpack: error, ${err.stack || err}`)
      })
    } catch (e) {
      console.log(e)
    }
  })
}

export default build
