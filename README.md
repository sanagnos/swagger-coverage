# swagger-coverage

Matches submitted requests in test files against the API endpoints specified in `swagger.json` and finds which endpoints are untested.

# Getting started
## Arguments
```
-s, --swagger   Path or url to swagger file.
-t, --test      Path to test directory
-c, --coverage  Target coverage in % (optional); if current coverage is below target, exit(1)
```

## Examples
* `test-coverage -s "http://localhost:8080/explorer/swagger.json" -t "../my-project/test"`
* `test-coverage -s "../swagger.json" -t "../my-project/test" -c 95`
