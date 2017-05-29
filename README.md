# swagger-coverage [![Build Status](https://travis-ci.org/sanagnos/swagger-coverage.svg?branch=master)](https://travis-ci.org/sanagnos/swagger-coverage)

Matches submitted requests in test files against the API endpoints specified in `swagger.json` and finds which endpoints are untested.

_Note: The module uses regexp matching to check for calls of this form: `request('<method>', '<route>')`_

# Getting started
## Arguments
```
-s, --swagger   Path or url to swagger file.
-t, --test      Path to test directory
-c, --coverage  Target coverage in % (optional); if current coverage is below target, exit(1)
```

## Examples
* `swagger-coverage -s "http://localhost:8080/explorer/swagger.json" -t "../my-project/test"`
* `swagger-coverage -s "../swagger.json" -t "../my-project/test" -c 95`
