'use strict'

// imports
const fs = require('fs')
const path = require('path')
const SwaggerWalk = require('swagger-walk')

// constants
const SWAGGER_FILE = null
const TEST_DIR     = null

if (!SWAGGER_FILE)
  throw new Error('Missing path to the swagger file (SWAGGER_FILE)')

if (!TEST_DIR)
  throw new Error('Missing path to the test directory (TEST_DIR)')

// swagger json to object
const swagger = require(SWAGGER_FILE)

// list of test files
const testFiles = fs.readdirSync(TEST_DIR).filter(function (path) {
  return /.js$/.test(path)
})

// map test file path -> test file data
var requests = {}
for (var i = 0, l = testFiles.length; i < l; ++i) {
  var code = fs.readFileSync(path.join(TEST_DIR, testFiles[i]), 'utf8').split(/\n/g)
  for (var j = 0, jl = code.length; j < jl; ++j) {
    var line = code[j]
    var match = // match for "request(<method>, <route>)"
      line.match(/request\(\'(.*)\'\,\s\'(.*)\'\)/) ||
      line.match(/request\(\'(.*)\'\,\s\`(.*)\`\)/)
    if (match) {
      var method = match[1].toLowerCase()
      var route  = match[2].toLowerCase()
        .replace(/[-0-9]{1,10}/g, '{id}')
        .replace(/\$\{.*\}/g, '{id}')
      if (requests[route] === undefined) requests[route] = {}
      if (requests[route][method] === undefined) requests[route][method] = true
    }
  }
}

// check requests object from test suite against swagger object
var hasTest = []
var noTest = []
const sw = new SwaggerWalk()
sw.setSpec(swagger)
sw.walkPathMethods(function (index, route, method, data) {
  route = route.toLowerCase()
  if (!requests[route] || !requests[route][method]) {
    if (noTest.length === 0) {
      console.log(' ')
      console.log('Untested endpoints')
      console.log('==================================================================')
    }
    noTest.push(`${method.toUpperCase()} ${route}`)
    console.log(`${method.toUpperCase()} ${route}`)
  } else {
    hasTest.push(`${method.toUpperCase()} ${route}`)
  }
})

// log stats
var sum = hasTest.length + noTest.length
console.log(' ')
console.log('Stats')
console.log('==================================================================')
console.log('Untested endpoints    : ' + noTest.length)
console.log('Total endpoints       : ' + sum)
console.log('Endpoint test coverage: ' + (100 * hasTest.length / sum).toFixed(2) + '%')
console.log(' ')
