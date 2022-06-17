<div align=center>
<img src="./client/src/assets/todo-app-logo/todo-app-logo.png" height="100px">

# TodoApp
    
[![Netlify Status](https://api.netlify.com/api/v1/badges/9fd8a950-2e65-4669-bb3e-7d98889c1b35/deploy-status)](https://app.netlify.com/sites/floyds-todo/deploys)
    
A small, carefully crafted todo app with a focus on user experience, built with ❤️ and angular.
</div>

## Concept
The app is designed to **reward the user** when he/she completes a task with satisfying animations to create a **positive feedback loop** and **increase motivation**. It is encouraged to break down a task into multiple _sub_-tasks so that you can cross of tasks more often and stay motivated.

## Usage
Check out [the latest production build](https://floyds-todo.netlify.app) and use it locally on your device (sync between devices coming soon).
You can also [install the PWA](https://medium.com/progressivewebapps/how-to-install-a-pwa-to-your-device-68a8d37fadc1) on desktop and mobile devices.

## Contributing
Clone the repo with `git clone git@github.com:dein-ding/todo-app.git`.
If you want your [changes](#running-the-app-locally) to be merged into production, [fork this repository and file a Pull-Request](https://www.youtube.com/watch?v=CML6vfKjQss) wenn you're done editing.

## Running the app locally
Install the dependencies ([node.js](https://nodejs.org/en/download/) required) with `npm i`

Run `npm run serve` for a dev server and navigate to `localhost:4200/`.

Or run `npm run serve:lan` for testing on your local network (e.g. on a mobile device) and navigate to `<Your local IP>:4200/`.

The app will automatically reload if you change any of the source files in the `src/` directory.

### Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
