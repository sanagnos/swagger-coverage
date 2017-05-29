#! /usr/bin/env node
'use strict'

// imports
const fs = require('fs')
const path = require('path')
const SwaggerWalk = require('swagger-walk')

// parse arguments
var argmap = {}
for (var i = 2, l = process.argv.length; i < l; ++i)
  argmap[process.argv[i]] = process.argv[++i]


// constants
var COVERAGE = argmap['-c'] || argmap['--coverage']
var TEST     = argmap['-t'] || argmap['--test']
var SWAGGER  = argmap['-s'] || argmap['--swagger']

if (!SWAGGER) {
  console.error('Missing path to swagger json')
  process.exit(1)
}

if (!SWAGGER) {
  console.error('Missing path to the test directory')
  process.exit(1)
}

// list of test files
const testFiles = fs.readdirSync(TEST).filter(function (path) {
  return /.js$/.test(path)
})

// map test file path -> test file data
var requests = {}
for (var i = 0, l = testFiles.length; i < l; ++i) {
  var code = fs.readFileSync(path.join(TEST, testFiles[i]), 'utf8').split(/\n/g)
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
if (fs.existsSync(SWAGGER)) {
  sw.setSpec(require(SWAGGER))
  sw.walkPathMethods(function (index, route, method, data) {
    onMethod(route, method)
  })
  onDone()
} else {
  sw.loadSpec(SWAGGER, function () {
    sw.walkPathMethods(function (index, route, method, data) {
      onMethod(route, method)
    })
    onDone()
  })
}

function onMethod (route, method) {
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
}

function onDone () {
  var sum = hasTest.length + noTest.length
  console.log(' ')
  console.log('Stats')
  console.log('==================================================================')
  console.log('Untested endpoints    : ' + noTest.length)
  console.log('Total endpoints       : ' + sum)
  console.log('Endpoint test coverage: ' + (100 * hasTest.length / sum).toFixed(2) + '%')
  console.log(' ')

  if (COVERAGE !== undefined && 100 * hasTest.length / sum < COVERAGE) {
    console.log('Current coverage below given target')
    process.exit(1)
  } else {
    process.exit(0)
  }
}
