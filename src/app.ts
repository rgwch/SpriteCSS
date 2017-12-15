import {Router, RouterConfiguration, NavigationInstruction, Next, PipelineStep, Redirect} from 'aurelia-router';
import "packer.growing";

export class App {
    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'SpriteCSS';
        config.map([
            {route: "", moduleId: "spritecss", name: "spritecss"}
        ]);
    }
}
