[![CI](https://github.com/swordev/job-controller/actions/workflows/ci.yaml/badge.svg)](https://github.com/swordev/job-controller/actions/workflows/ci.yaml)

# job-controller (WIP)

> Controller server for executing remote jobs.

## Features

- Job actions (start, stop, list).
- Communication channel protected by secret token.
- Decodes streams.
- Streams stderr/stdout on live.
- Limits command arguments.

## Usage

```sh
npx job-controller --help
```
