import {RouterConfiguration} from 'aurelia-router';

export class App {
    configureRouter(config: RouterConfiguration) {
        config.title = 'SpriteCSS';
        config.map([
            {route: "", moduleId: "sprites", name: "sprites"}
        ]);
    }
}
