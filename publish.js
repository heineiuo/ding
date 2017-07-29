const argv = require('yargs').argv
const shelljs = require('shelljs')
const {promisify} = require('util')
const fs = require('fs')


const {package} = argv

process.nextTick(async () => {

  if (!!package) {
    shelljs.cd(`packages/${package}`)
    shelljs.exec(`rm -f *.js`)
    shelljs.exec(`babel src -d .`)
    shelljs.exec(`npm publish --access=public`)
    shelljs.exec(`rm -f *.js`)
  }
})