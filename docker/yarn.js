const child_process = require('child_process')

const registry = process.env.NPM_REGISTRY || 'https://registry.npmjs.org'

if (process.env.NPM_REGISTRY) {
  console.log(`USE ENV NPM_REGISTRY: ${process.env.NPM_REGISTRY}`)
} else {
  console.log(`USE DEFAULT NPM_REGISTRY: https://registry.npmjs.org`)
}

child_process.execSync(`yarn config set registry ${registry}`)
child_process.execSync(`yarn`)