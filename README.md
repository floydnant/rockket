<div align=center>
<img src="./client/src/assets/todo-app-logo/todo-app-logo.png" height="100px">

# Rockket
    
[![Netlify Status](https://api.netlify.com/api/v1/badges/9fd8a950-2e65-4669-bb3e-7d98889c1b35/deploy-status)](https://app.netlify.com/sites/floyds-todo/deploys)
    
A small, carefully crafted todo app with a focus on user experience, built with ❤️ and angular.

(App icon update pending)
</div>

## Concept
The app is designed to **reward the user** when he completes a task with satisfying behaivour and little easter eggs to create a **positive feedback loop** and **increase motivation**. It is encouraged to break down a task into multiple _sub_-tasks so that you can cross of tasks more often and stay motivated.

You can share lists with others and collaborate in real time[^1].

## Usage
Check out [the latest production build](https://floyds-todo.netlify.app) and use it locally on your device (sync between devices coming soon).
You can also [install the PWA](https://medium.com/progressivewebapps/how-to-install-a-pwa-to-your-device-68a8d37fadc1) on desktop and mobile devices.

## Contributing
Clone the repo with `git clone git@github.com:dein-ding/todo-app.git`.
If you want your [changes](#running-the-app-locally) to be merged into production, [fork this repository and file a Pull-Request](https://www.youtube.com/watch?v=CML6vfKjQss) wenn you're done editing.

## Running the app locally
### Requirements
- PostgreSQL database server
- Node.js 14 or higher

### Installation & Preperation
1. Install the dependencies with `npm i`
    ```sh
    cd client
    npm i
    cd ../server
    npm i
    ```
2. Create 2 databases with the names `todo-app` and `todo-app-testing` and the default credentials 
3. Fill in the .env variables in `server/.env`
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo-app?schema=public"
    TESTING_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo-app-testing?schema=public"

    JWT_SECRET="This is the mysterous the secret"
    ```
4. Run the migrations in `server/`
    ```sh
    npx prisma migrate deploy
    ```

### Running the app
Run `npm run dev` in both client and server for a dev server
- Front-end
  ```sh
  cd client
  npm run dev
  ```
  Or run `npm run dev:lan` for running on your local network (e.g. on a mobile device) and navigate to `<Your local IP>:4200/`.

- Backend-end
  ```sh
  cd server
  npm run dev
  ```

then navigate to `localhost:4200/`.
The app will automatically reload if you change any of the source files in the `src/` directories.

## Running tests
Append `:ci` to the respective command to run the tests only a single time.

You can run these commands in both the client and server directories.

- Unit tests
  ```sh
  npm run unit # watch mode
  npm run unit:ci # single run
  ```
- Component tests
  ```sh
  npm run comp # watch mode
  npm run comp:ci # single run
  ```
- E2E tests
  ```sh
  npm run e2e # watch mode
  npm run e2e:ci # single run
  ```

## Linting and Formatting
You can run these commands in both the client and server directories.

To check for code quality run
```sh
npm run lint
```
To check for code quality and fix potential problems and/or format the code run
```sh
npm run lint:fix
```

## Type checks
For manual type checks without an LSP just run the `dev` or `build` commands    .

## Further info 
- Client [README.md](./client-v2/README.md)
- Server [README.md](./server/README.md)

--- 
[^1]: near realtime