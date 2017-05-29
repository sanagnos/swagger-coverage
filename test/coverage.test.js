const expect = require('expect')
const Coverage = require('../coverage')


describe('Coverage', () => {
  it('process', () => {
    let myCoverage = new Coverage()
    myCoverage.setSwaggerSource('./test/fixtures/swagger.json')
    myCoverage.setTestDir('./test/fixtures/testcode')

    let result = myCoverage.process(0)
    expect(result.withTests.length).toBe(1)
    expect(result.withoutTests.length).toBe(19)
    expect(result.totalTests).toBe(20)
    expect(result.testedInPercent).toBe('5.00%')
    expect(result.passed).toBe(true)
  })
})
