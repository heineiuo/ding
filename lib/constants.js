module.exports.externals = [
  { 'commonjs': 'react', 'root': 'React', 'amd': 'react' },
  { 'commonjs': 'react-dom', 'root': 'ReactDOM', 'amd': 'react-dom' },
  { 'commonjs': 'react-router-dom', 'root': 'ReactRouterDOM', 'amd': 'react-router-dom' },
  { 'commonjs': 'systemjs', 'commonjs2': 'systemjs', 'root': 'System', amd: 'systemjs' },
  { 'commonjs': 'styled-components', commonjs2: 'styled-components', root: 'styled', amd: 'styled-components' },
  { 'commonjs': 'royalblue', 'commonjs2': 'royalblue', 'root': 'royalblue', amd: 'royalblue' }
]

module.exports.publicPathPrefix = 'https://cdn.jsdeliver.net/npm'
