const createServer = require('./dist/createServer')
const { argv } = require('yargs')

createServer(argv)
