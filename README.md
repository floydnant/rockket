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
Install the dependencies ([node.js](https://nodejs.org/en/download/) required) with `npm i`
```sh
cd client
npm i
cd ../server
npm i
```

Run `npm run dev` for a dev server
- Front-end `cd client && npm run dev`
    
    Or run `npm run dev:lan` for testing on your local network (e.g. on a mobile device) and navigate to `<Your local IP>:4200/`.

- Backend-end `cd server && npm run dev`

then navigate to `localhost:4200/`.
The app will automatically reload if you change any of the source files in the `src/` directories.

## Further info 
- Client [README.md](./client-v2/README.md)
- Server [README.md](./server/README.md)

--- 
[^1]: near realtime