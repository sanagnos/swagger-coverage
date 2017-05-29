#! /usr/bin/env node
'use strict'

const Coverage = require('./coverage')

// parse arguments
var argmap = {}
for (var i = 2, l = process.argv.length; i < l; ++i) { argmap[process.argv[i]] = process.argv[++i] }

// constants
var COVERAGE = argmap['-c'] || argmap['--coverage']
var TEST = argmap['-t'] || argmap['--test']
var SWAGGER = argmap['-s'] || argmap['--swagger']

if (!SWAGGER) {
  console.error('Missing path to swagger json')
  process.exit(1)
}

if (!TEST) {
  console.error('Missing path to the test directory')
  process.exit(1)
}

let coverage = new Coverage(SWAGGER, TEST)
coverage.setSwaggerSource(SWAGGER)
coverage.setTestDir(TEST)
let result = coverage.process(COVERAGE)

console.log(' ')
console.log('Stats')
console.log('==================================================================')
console.log('Tested endpoints      : ' + result.withTests.length)
console.log('Untested endpoints    : ' + result.withoutTests.length)
console.log('Total endpoints       : ' + result.totalTests)
console.log('Endpoint test coverage: ' + result.testedInPercent)
console.log(' ')

if (result.passed) {
  process.exit(0)
} else {
  console.log('Current coverage below given target')
  process.exit(1)
}
