# drouter

![Image](https://img.shields.io/badge/coverage-100%25-green)

A router that generates an OpenAPI spec and validates inputs.

## Unstable

This repo uses the new Deno.serve library and thus requires the `--unstable`
parameter.

## Commands

Run `deno task test` to test, format and output coverage report.

## Api Versioning

The API version is automatically added as a header. If `requireApiVersionHeader`
is set on the config then it will be marked as required as well.

In time, it should be possible to specify multiple versions of each operation.
Each previous version should be expressed as a series of changes required to
upgrade legacy inputs to the latest op and downgrade responses to legacy
outputs.

This information should be used during op processing to upgrade/downgrade
requests and responses so that only the latest live version of an operation
needs to be maintained.

This information should also be used to produce multiple versions of the OpenAPI
documentation so that a client can use whichever version they like.
