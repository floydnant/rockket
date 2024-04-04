<div align=center>
<img src="./apps/rockket-web/src/assets/rockket-logo.png" height="100px">

# Rockket

[![Netlify Status](https://api.netlify.com/api/v1/badges/f010880f-6648-4146-9d82-b7e050e637ce/deploy-status?branch=main)](https://app.netlify.com/sites/rockket/deploys)
[![Build, Run linter and tests](https://github.com/floydnant/rockket/actions/workflows/tests.yml/badge.svg)](https://github.com/floydnant/rockket/actions/workflows/tests.yml)

A small, carefully crafted todo app with a focus on user experience, built with ❤️ and angular.

</div>

## Concept

Rockket is designed to _reward the user_ when they complete a task with satisfying behaviour and little easter eggs to create a _positive feedback loop_ and _increase motivation_. It is encouraged to break down a task into multiple **sub**-tasks so that you can cross of tasks more often and stay motivated.

<!-- @TODO: make this section useful -->
<!-- ## Core features

-   Nest both tasks and tasklists indefinitely deep
-   Share lists with others and collaborate in real time[^1]
-   Take notes or write descriptions in rich text
-   Link tasks that are related to each other e.g. by blocking them based on another task's status -->

## Usage

Create an account and start using the [web version](https://rockket.netlify.app) today!
Desktop and mobile apps are on the roadmap.

## Known issues

A list of known issues can be found here: [known-issues.md](../../docs/known-issues.md).

## Contributing

-   Base branch: `main`
-   Only squash merging allowed to `main`
-   Before merging
    -   Ensure all linter warnings are resolved or ignored with a description
    -   Ensure the changeset is easy to understand (describe the changes in the PR)
-   Anything merged to `main` must be deployable

## Running the app locally

### Requirements

-   [PostgreSQL](https://www.postgresql.org/download/) database
-   [Node.js](https://nodejs.org/en/download/) 14 or higher

### Installation & Preparation

0. Clone the repo with

    ```sh
    git clone git@github.com:floydnant/rockket.git
    ```

1. Install the dependencies

    ```sh
    npm i
    ```

2. Create a database with the name `rockket` and the default credentials

3. Add the environment variables by running `npm run init-env` which does the following:

    - Copy `apps/rockket-backend/.env.sample` -> `apps/rockket-backend/.env`
    - Link from `apps/rockket-backend-e2e/.env` to `apps/rockket-backend/.env`

4. Run the db migrations
    ```sh
    nx run rockket-backend:db:migrate:dev
    ```

### Running the app

Ensure postgres is up and running, then, to run the dev servers, run the `serve` targets for `rockket-web` and `rockket-backend` or simply `npm run dev` from the root to do both in one terminal.

The frontend is listening on `localhost:4200` while the backend is listening on `localhost:3000`.

```sh
npm run dev
```

If you need to run the app on the local network (e.g. for testing on a different device, like a mobile phone) you can run the following and navigate to `<Your local IP>:4200/` on the other device.

```sh
npm run dev:lan
```

Please note that if you want to run the serve targets separately, you have to specify the backend base url as an env var manually, i.e.

```sh
NG_APP_SERVER_BASE_URL=http://$(ipconfig getifaddr en0):3000 nx run rockket-web:serve:local-network
# and
nx run rockket-backend:serve
```

## Monorepo structure @TODO

-   Libraries are located in the `packages` directory
-   Apps and e2e tests are located in the `apps` directory
-   Libraries have the tag `type:lib`

## Running tests

You can run these commands in both the client and server directories.

All of the following commands support reruns on changes. Simply append `--watch` to the respective command and the tests rerun when the source code changes.

### Unit tests

```sh
nx test rockket-web
nx test rockket-backend
```

### Component tests

```sh
nx component-test rockket-web
```

### End to end tests

```sh
nx e2e rockket-web-e2e
nx e2e rockket-backend-e2e
```

## Linting and Formatting

To run linting and formatting for the whole codebase:

```sh
npm run lint # only lint
npm run lint:fix # lint and fix fixable linting issues

npm run format # only format

npm run fix # both format and fix linting issues
```

To run linting for a specific project:

```sh
nx lint rockket-web
nx lint rockket-backend
```

## Type checks

For manual type checks without an LSP just run `npm run dev` or the respective `serve` or `build` targets for the project.

## Further info on each project

-   [`rockket-web`](./apps/rockket-web/README.md)
-   [`rockket-web-e2e`](./apps/rockket-web-e2e/README.md)
-   [`rockket-backend`](./apps/rockket-backend/README.md)
-   [`rockket-backend-e2e`](./apps/rockket-backend-e2e/README.md)

You can also run `nx show project <projectName> --json false` for a list of targets (scripts to run).

### Relevant documentation

-   Build system: [Nx](https://nx.dev)
-   Frontend framework: [Angular](https://angular.io/docs)
    -   State management: [NgRx](https://ngrx.io/docs)
-   Styling: [Tailwind](https://tailwindcss.com/docs/editor-setup)
-   Backend framework: [NestJS](https://docs.nestjs.com)
-   ORM: [Prisma](https://www.prisma.io/docs/)

## Get in touch

Hi I'm Floyd Haremsa, you can reach me through floyd.haremsa@berlin-bytes.de,
I'm happy to answer any questions you might have or just to have a chat.

<br>

<!-- [^1]: near realtime -->
