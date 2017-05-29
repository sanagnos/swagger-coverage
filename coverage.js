// dependencies
const fs = require('fs')
const path = require('path')
const SwaggerWalk = require('swagger-walk')

class Coverage {
  constructor () {
    this.swaggerSource = null
    this.testDir = null
    this.testFiles = {}
    this.coverage = 0
  }

  setSwaggerSource (src) {
    this.swaggerSource = src
  }

  setTestDir (dir) {
    this.testDir = dir
     // list of test files
    this.testFiles = fs.readdirSync(dir).filter(function (path) {
      return /.js$/.test(path)
    })
  }

  process (coverage) {
    let self = this

    // map test file path -> test file data
    var requests = {}
    for (var i = 0, l = self.testFiles.length; i < l; ++i) {
      var code = fs.readFileSync(path.join(self.testDir, self.testFiles[i]), 'utf8').split(/\n/g)
      for (var j = 0, jl = code.length; j < jl; ++j) {
        var line = code[j]
        var match = // match for "request(<method>, <route>)"
          line.match(/request\('(.*)',\s'(.*)'\)/) ||
          line.match(/request\('(.*)',\s`(.*)`\)/)
        if (match) {
          var method = match[1].toLowerCase()
          var route = match[2].toLowerCase()
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
    if (fs.existsSync(self.swaggerSource)) {
      sw.setSpec(require(self.swaggerSource))
      sw.paths.walkMethods(function (index, route, method, data) {
        onMethod(route, method)
      })
      return onDone()
    } else {
      sw.loadSpec(self.swaggerSource, function () {
        sw.walkPathMethods(function (index, route, method, data) {
          onMethod(route, method)
        })
        return onDone()
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
      // console.log(' ')
      // console.log('Stats')
      // console.log('==================================================================')
      // console.log('Untested endpoints    : ' + noTest.length)
      // console.log('Total endpoints       : ' + sum)
      // console.log('Endpoint test coverage: ' + (100 * hasTest.length / sum).toFixed(2) + '%')
      // console.log(' ')

      let tmpPassed = null

      if (coverage !== undefined && 100 * hasTest.length / sum < coverage) {
      //   console.log('Current coverage below given target')
      //   process.exit(1)
        tmpPassed = false
      } else {
        tmpPassed = true
      //   process.exit(0)
      }
      return {
        withTests: hasTest,
        withoutTests: noTest,
        totalTests: sum,
        testedInPercent: (100 * hasTest.length / sum).toFixed(2) + '%',
        passed: tmpPassed
      }
    }
  }
}

module.exports = Coverage
