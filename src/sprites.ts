import {autoinject, TaskQueue} from 'aurelia-framework';
import {ValidationRules, ValidationController, validateTrigger} from "aurelia-validation";
import {BootstrapFormRenderer} from "./BootstrapFormRenderer";
import {GrowingPacker} from "./packerGrowing";
import {cargarImagenes, porcentage, colorAleatorio} from "./util";

import * as SVG from "svg.js";

@autoinject
export class Sprites {
    private claseBase = "sprite";
    private prefijo = "sprite-";
    private archivos: FileList;

    private nombreArchivo: string;
    private cssGenerado: string;
    private ejemplo = "";
    private ejemploVertical = "";

    private bloques: Bloque[];
    private packer: GrowingPacker;
    private taskqeue: TaskQueue;
    private validationController: ValidationController;
    constructor(taskqeue: TaskQueue,
        validationController: ValidationController) {
        this.taskqeue = taskqeue;
        this.validationController = validationController;
        this.validationController.addRenderer(new BootstrapFormRenderer());
        this.validationController.validateTrigger = validateTrigger.changeOrBlur;
    }
    attached(): void {
        ValidationRules
            .ensure((s: Sprites) => s.claseBase)
            .required().withMessage(`Clase base requerida`)
            .matches(/^[a-zA-Z_].*$/).withMessage(`Debe de empezar con alguna letra o guión bajo`)
            .matches(/^(?!__).*$/).withMessage(`No puede empezar con dos guiones bajos`)
            .matches(/^[a-zA-Z0-9_-]*$/).withMessage(`Sólo puede contener letras, numeros o guiones`)
            .ensure((s: Sprites) => s.prefijo)
            .required().withMessage(`Prefijo requerido`)
            .matches(/^[a-zA-Z_].*$/).withMessage(`Debe de empezar con alguna letra o guión bajo`)
            .matches(/^(?!__).*$/).withMessage(`No puede empezar con dos guiones bajos`)
            .matches(/^[a-zA-Z0-9_-]*$/).withMessage(`Sólo puede contener letras, numeros o guiones`)
            .ensure((s: Sprites) => s.archivos)
            .required().withMessage(`Selecciona imágenes`)
            .on(this);
    }
    procesar(): void {
        this.validationController.validate().then(result => {
            if (result.valid) {
                this.generar();
            }
        });
    }
    private generar(): void {
        this.nombreArchivo = this.claseBase;
        this.cargarBloques().then(() => {
            this.packer = new GrowingPacker();
            this.packer.fit(this.bloques);
            this.dibujarImagenes();
            this.generarCss();
            this.taskqeue.queueMicroTask(() => {
                document.getElementById("divGenerado").scrollIntoView({behavior: "smooth", block: "start"});
            });
        })
    }
    private cargarBloques(): Promise<any> {
        this.bloques = [];
        return cargarImagenes(this.archivos).then(imagenes => {
            for (let i = 0; i < imagenes.length; i++) {
                this.bloques.push(new Bloque(imagenes[i]));
            }
            return Promise.resolve();
        });
    }
    private dibujarImagenes() {
        if (this.archivos === undefined || this.archivos.length <= 0) {
            console.log("Imagenes requeridas");
            return;
        }
        var areaDibujo = document.getElementById("dibujo");
        areaDibujo.innerText = "";

        var dibujo = SVG(areaDibujo).size(this.packer.root.w, this.packer.root.h);
        dibujo.viewbox(0, 0, this.packer.root.w, this.packer.root.h);
        dibujo.addClass("img-responsive");
        dibujo.addClass("center-block");
        var mouseover = function () {
            this.fill({opacity: 1});
        }
        var mouseout = function () {
            this.fill({opacity: .1});
        }
        for (var i = 0; i < this.bloques.length; i++) {
            var bloque = this.bloques[i];
            if (bloque.fit) {
                var rec = dibujo.rect(bloque.w, bloque.h).move(bloque.fit.x, bloque.fit.y).fill({color: colorAleatorio(), opacity: .1}).stroke("#000000");
                dibujo.image(bloque.image.src).move(bloque.fit.x, bloque.fit.y).style("pointer-events", "none");
                rec.on("mouseover", mouseover);
                rec.on("mouseout", mouseout);
                dibujo.plain((i + 1).toString()).move(bloque.fit.x, bloque.fit.y).font({size: 24, family: "Georgia"}).fill("#000000");
            }
        }
    }
    private generarCss(): void {
        this.bloques.sort((a, b) => {
            var an = a.name.toLowerCase();
            var bn = b.name.toLowerCase();
            if (an > bn) {
                return 1;
            } else if (an < bn) {
                return -1;
            } else {
                return 0;
            }
        });
        var width = this.packer.root.w, height = this.packer.root.h;
        var css = "";
        var reglaBase = ".".concat(this.claseBase, " { width: 100%; height: auto; display: inline-block; background-size: 0%; background-image: url(", this.claseBase, ".png);}\n");
        css += reglaBase;
        var ajuste = "svg.".concat(this.claseBase, ".vertical, img.", this.claseBase, ".vertical{ height: 100%!important; width: auto!important; padding-top: 0!important;}\n");
        css += ajuste;
        this.bloques.forEach(bloque => {
            if (bloque.fit) {
                var posX = porcentage(bloque.fit.x, width, bloque.w);
                var posY = porcentage(bloque.fit.y, height, bloque.h);
                var sizeX = width / bloque.w * 100;
                var sizeY = height / bloque.h * 100;
                var aspectRatio = bloque.h / bloque.w * 100;
                var regla = ".".concat(this.claseBase, ".", this.prefijo, bloque.name, " { padding-top: ", aspectRatio.toString(), "%; background-position: ", posX.toString(), "% ", posY.toString(), "%; background-size: ", sizeX.toString(), "% ", sizeY.toString(), "%;}\n");
                css += regla;
            }
        });
        this.ejemplo = "&lt;span class=&quot;" + this.claseBase + " " + this.prefijo + this.bloques[0].name + "&quot;&gt;&lt;&#x2F;span&gt;";
        this.ejemploVertical = "&lt;svg viewBox=&quot;0 0 100 150&quot; class=&quot;" + this.claseBase + " " + this.prefijo + this.bloques[0].name + " vertical&quot;&gt;&lt;&#x2F;svg&gt;";
        this.cssGenerado = css;
    }
    copiarTexto(): void {
        if (this.cssGenerado === null) {
            console.log("No hay texto generado");
            return;
        }
        var t = <HTMLTextAreaElement> document.createElement("textarea");
        t.style.position = 'fixed';
        t.style.top = "0";
        t.style.left = "0";
        t.style.width = '2em';
        t.style.height = '2em';
        t.style.padding = "0";
        t.style.border = 'none';
        t.style.outline = 'none';
        t.style.boxShadow = 'none';
        t.style.background = 'transparent';
        t.value = this.cssGenerado;

        document.body.appendChild(t);
        t.select();
        try {
            document.execCommand(("Copy"));
        } catch (err) {
            console.log("Copia no permitida");
        }
        document.body.removeChild(t);
    }
    descargarSpriteSheet() {
        if (this.packer == null || this.bloques === null) {
            console.log("Packer no generado o sin imagenes");
            return;
        }
        if (this.nombreArchivo === null) {
            this.nombreArchivo = "png";
        }
        var canvas = document.createElement("canvas");
        canvas.width = this.packer.root.w;
        canvas.height = this.packer.root.h;
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < this.bloques.length; i++) {
            var bloque = this.bloques[i];
            if (bloque.fit) {
                ctx.drawImage(bloque.image, bloque.fit.x, bloque.fit.y);
            }
        }
        var a = document.createElement("a");
        a.setAttribute("href", canvas.toDataURL("image/png"));
        a.setAttribute("download", this.nombreArchivo + ".png");
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    descargarTextoCSS(): void {
        if (this.cssGenerado === null) {
            console.log("No hay texto generado");
            return;
        }
        var a = document.createElement("a");
        a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(this.cssGenerado));
        a.setAttribute("download", "sprites.css");
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
export class Bloque {
    image: HTMLImageElement;
    name: string;
    w: number;
    h: number;
    fit: Nodo;
    constructor(image: HTMLImageElement) {
        this.image = image;
        this.name = image.name.split(".")[0].replace(/\W/g, '-');
        this.w = image.width;
        this.h = image.height;
    }
}
export class Nodo {
    x: number;
    y: number;
    h: number;
    w: number;
    right: Nodo;
    down: Nodo;
    used = false;
    constructor(x: number, y: number, h: number, w: number) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
    }
}