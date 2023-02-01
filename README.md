# drouter

![Image](https://img.shields.io/badge/coverage-100%25-green)

A router that generates an OpenAPI spec and validates inputs.

## Unstable

This repo uses the new Deno.serve library and thus requires the `--unstable`
parameter.

## Commands

Run `deno task test` to test, format and output coverage report.

## Api Versioning

The API version is automatically added as a header. It must be supplied with
every request to an operation.

Each operation defines an api-version which is the first version of the api when
the operation should appear. This should be a date in the form YYYY-MM-DD.

In time, it should be possible to specify multiple inputs and outputs for
historical versions of an operation. This will allow a new version to be
deployed with adapaters written to upgrade old requests and downgrade newer
responses. Handlers for this translation will need to be defined on the
operation itself. Typed interfaces should also be built for these historical
versions to help with the conversion process.

This information should also be used to produce multiple versions of the OpenAPI
documentation so that a client can use whichever version they like.

## Api Key

Mark any operation as `requiresApi` key. This will trigger the `x-api-key`
header to be expected in the openapi documentation.

If an operation is marked as `requiresApi` key then an `apiKeyHandler` function
will need to be supplied with the service config. This should typically check
the API key against a value in a database of acceptable keys.
