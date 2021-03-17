## Daivita
....

## Getting Started

### Requirements

- Mac OS X, Windows, or Linux
- [Yarn](https://yarnpkg.com/) package + [Node.js](https://nodejs.org/) v8.16.2 or
  newer
- Text editor or IDE pre-configured with React/JSX/Flow/ESlint
  ([learn more](./how-to-configure-text-editors.md))

### Quick Start

#### 1. Get the latest version

You can start by cloning the latest version of React Starter Kit (RSK) on your
local machine by running:

```shell
$ git clone https://github.com/datvt151099/daivita.git
$ cd daivita
```

#### 2. Run `yarn install`

This will install both run-time project dependencies and developer tools listed
in [package.json](../package.json) file.

#### 3. Run `yarn start`

This command will build the app from the source files (`/src`) into the output
`/build` folder. As soon as the initial build completes, it will start the
Node.js server (`node build/server.js`) and
[Browsersync](https://browsersync.io/) with
[HMR](https://webpack.github.io/docs/hot-module-replacement) on top of it.

> [http://localhost:3000/](http://localhost:3000/) — Node.js server
> (`build/server.js`) with Browsersync and HMR enabled\
> [http://localhost:3000/graphql](http://localhost:3000/graphql) — GraphQL server
> and IDE\
> [http://localhost:3001/](http://localhost:3001/) — Browsersync control panel
> (UI)


### How to Build, Test, Deploy

If you need just to build the app (without running a dev server), simply run:

```shell
$ yarn run build
```

or, for a production build:

```shell
$ yarn run build --release
```

or, for a production docker build:

```shell
$ yarn run build --release --docker
```

_NOTE: double dashes are required_

After running this command, the `/build` folder will contain the compiled
version of the app. For example, you can launch Node.js server normally by
running `node build/server.js`.

To check the source code for syntax errors and potential issues run:

```shell
$ yarn run lint
```

To launch unit tests:

```shell
$ yarn run test          # Run unit tests with Jest
$ yarn run test-watch    # Launch unit test runner and start watching for changes
```
