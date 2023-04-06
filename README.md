<div align=center>
<img src="./client/src/assets/todo-app-logo/todo-app-logo.png" height="100px">

# Rockket

[![Netlify Status](https://api.netlify.com/api/v1/badges/f010880f-6648-4146-9d82-b7e050e637ce/deploy-status?branch=main)](https://app.netlify.com/sites/rockket/deploys)
[![Build, Run linter and tests](https://github.com/dein-ding/rockket/actions/workflows/tests.yml/badge.svg)](https://github.com/dein-ding/rockket/actions/workflows/tests.yml)
    
A small, carefully crafted todo app with a focus on user experience, built with ❤️ and angular.

(App icon changing soon)
</div>

## Concept
Rockket is designed to _reward the user_ when he completes a task with satisfying behaviour and little easter eggs to create a _positive feedback loop_ and _increase motivation_. It is encouraged to break down a task into multiple **sub**-tasks so that you can cross of tasks more often and stay motivated.

## Core features
- Nest both tasks and tasklists indefinitely deep
- Share lists with others and collaborate in real time[^1]
- Take notes or write descriptions in rich text
- Link tasks that are related to each other e.g. by blocking them based on another task's status

## Note
I am completely rebuilding the app, so the new project (`client-v2`) is currently only in demo phase and if not yet, those features will arrive shortly.
The old project (`client`) is still in production, but I stopped maintaining it a while ago.

## Usage
Start using the [stable production version](https://rockket.netlify.app) or the [development branch](https://main--rockket.netlify.app) and [install it as a PWA](https://medium.com/progressivewebapps/how-to-install-a-pwa-to-your-device-68a8d37fadc1) on a desktop or mobile device.
(native builds on the AppStore and PlayStore are on the roadmap)

Or, if you're curious, check out [what I'm currently working on](https://github.com/dein-ding/rockket/pulls) or [what I'm planning to work on](https://github.com/dein-ding/rockket/issues).

## Contributing
If you want your changes to be merged, [fork this repository and file a Pull-Request](https://www.youtube.com/watch?v=CML6vfKjQss) when you're ready.

## Running the app locally
### Requirements
- [PostgreSQL](https://www.postgresql.org/download/) database server
- [Node.js](https://nodejs.org/en/download/) 14 or higher

### Installation & Preperation
0. Clone the repo with 
    ```sh
    git clone git@github.com:dein-ding/rockket.git
    ```

1. Install the dependencies
    ```sh
    cd client
    npm i
    cd ../server
    npm i
    ```

2. Create 2 databases with the names `rockket` and `rockket-testing` with the default credentials 

3. Fill in the environment variables in `server/.env`
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rockket?schema=public"
    TESTING_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rockket-testing?schema=public"

    JWT_SECRET="This is the mysterious secret"
    ```

4. Run the migrations in `server/`
    ```sh
    cd server
    npx prisma migrate deploy
    ```

### Running the app
Ensure postgres is up and running, then run `npm run dev` in both client and server for a dev server
- Frontend
  ```sh
  cd client
  npm run dev
  ```
  Or run `npm run dev:lan` for running on your local network (e.g. on a mobile device) and navigate to `<Your local IP>:4200/`.

- Backend
  ```sh
  cd server
  npm run dev
  ```

then navigate to `localhost:4200/`.
The app will automatically reload if you change any of the source files in the `src/` directories.

## Running tests
You can run these commands in both the client and server directories.

Append `:ci` to the respective command to run the tests only a single time, i.e. `npm run comp:ci`.

### Unit tests
```sh
npm run unit
```

### Component tests
```sh
npm run comp
```

### End to end tests
```sh
npm run e2e
```

## Linting and Formatting
You can run these commands in both the client and server directories.

To check for code quality, run
```sh
npm run lint
```
To fix potential problems and/or format the code, run
```sh
npm run lint:fix
```

## Type checks
For manual type checks without an LSP just run the `dev` or `build` commands.

## Further info 
- Client [README.md](./client-v2/README.md)
- Server [README.md](./server/README.md)
### Relevant documentation
- Frontend framework -> [Angular](https://angular.io/docs)
    - State management -> [NgRx](https://ngrx.io/docs)
- Styling -> [Tailwind](https://tailwindcss.com/docs/editor-setup)
- Backend framework -> [NestJS](https://docs.nestjs.com)
- ORM -> [Prisma](https://www.prisma.io/docs/)

## Get in touch
Hi, I'm Floyd Haremsa and you can reach me through floyd.haremsa@berlin-bytes.de,
I'm happy to answer any questions you might have or just to have a chat.

<br>

[^1]: near realtime
