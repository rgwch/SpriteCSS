import {autoinject, TaskQueue} from 'aurelia-framework';
import {ValidationRules, ValidationController, validateTrigger, validationMessages} from "aurelia-validation";
import {BootstrapFormRenderer} from "./BootstrapFormRenderer";
import {GrowingPacker} from "./packerGrowing";

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

    private imagenes: Imagen[];
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
        this.cargarImagenes(this.archivos).then(imagenes => {
            this.imagenes = imagenes;
            this.packer = new GrowingPacker();
            this.packer.fit(imagenes);
            this.dibujarImagenes();
            this.cssGenerado = this.generarCss(imagenes);
            this.ejemplo = "&lt;span class=&quot;" + this.claseBase + " " + this.prefijo + imagenes[0].name + "&quot;&gt;&lt;&#x2F;span&gt;";
            this.ejemploVertical = "&lt;svg viewBox=&quot;0 0 100 150&quot; class=&quot;" + this.claseBase + " " + this.prefijo + imagenes[0].name + " vertical&quot;&gt;&lt;&#x2F;svg&gt;";
            this.taskqeue.queueMicroTask(() => {
                document.getElementById("divGenerado").scrollIntoView({behavior: "smooth", block: "start"});
            });
        })
    }
    generarCss(imagenes: Imagen[]): string {
        imagenes.sort((a, b) => {
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
        imagenes.forEach(imagen => {
            if (imagen.fit) {
                var nombre = imagen.name;
                var posX = this.porcentage(imagen.fit.x, width, imagen.w);
                var posY = this.porcentage(imagen.fit.y, height, imagen.h);
                var sizeX = width / imagen.w * 100;
                var sizeY = height / imagen.h * 100;
                var aspectRatio = imagen.h / imagen.w * 100;
                var regla = ".".concat(this.claseBase, ".", this.prefijo, nombre, " { padding-top: ", aspectRatio.toString(), "%; background-position: ", posX.toString(), "% ", posY.toString(), "%; background-size: ", sizeX.toString(), "% ", sizeY.toString(), "%;}\n");
                css += regla;
            }
        });
        return css;
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
        if (this.packer == null || this.imagenes === null) {
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
        for (var i = 0; i < this.imagenes.length; i++) {
            var imagen = this.imagenes[i];
            if (imagen.fit) {
                ctx.drawImage(imagen.image, imagen.fit.x, imagen.fit.y);
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
    descargarTexto(): void {
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
    private porcentage(posicion: number, dimensionContenedor: number, dimensionImagen: number): number {
        var diferencia = dimensionContenedor - dimensionImagen;
        if (diferencia === 0) {
            return 0;
        }
        return posicion / diferencia * 100;
    }
    private cargarImagenes(archivos: FileList): Promise<Imagen[]> {
        var promesas = [];
        for (var i = 0; i < archivos.length; i++) {
            promesas.push(this.cargarImagen(archivos.item(i)));
        }
        return Promise.all(promesas);
    }
    private cargarImagen(archivo: File): Promise<Imagen> {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            var reader = new FileReader();
            reader.onload = () => {
                image.src = reader.result;
            }
            image.onload = () => {
                console.log(image);
                var name = archivo.name.split(".")[0].replace(/\W/g, '-');
                resolve(new Imagen(image, name));
            }
            image.onerror = error => {
                reject("Problema al crear imagen " + archivo.name + "\n. Error es: " + JSON.stringify(error));
            };
            reader.onerror = error => {
                reject("Problema al leer archivo " + archivo.name + "\n. Error es: " + JSON.stringify(error));
            };
            reader.readAsDataURL(archivo);
        });
    }
    private colorAleatorio(opacidad?: number): string {
        var opacidadHex = "ff";
        if (opacidad && opacidad <= 1 && opacidad >= 0) {
            opacidadHex = Math.floor(opacidad * 256).toString(16);
            if (opacidadHex.length < 2) {
                opacidadHex = "00".substr(0, 2 - opacidadHex.length) + opacidadHex;
            }
        }
        var colorHex = Math.floor(Math.random() * 16777215).toString(16);
        if (colorHex.length < 6) {
            colorHex = "000000".substr(0, 6 - colorHex.length) + colorHex;
        }
        return "#".concat(colorHex).concat(opacidadHex);
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
        for (var i = 0; i < this.imagenes.length; i++) {
            var imagen = this.imagenes[i];
            if (imagen.fit) {
                var rec = dibujo.rect(imagen.w, imagen.h).move(imagen.fit.x, imagen.fit.y).fill({color: this.colorAleatorio(), opacity: .1}).stroke("#000000");
                dibujo.image(imagen.image.src).move(imagen.fit.x, imagen.fit.y).style("pointer-events", "none");
                rec.on("mouseover", mouseover);
                rec.on("mouseout", mouseout);
                dibujo.plain((i + 1).toString()).move(imagen.fit.x, imagen.fit.y).font({size: 24, family: "Georgia"}).fill("#000000");
            }
        }
    }
}
export class Imagen {
    image: HTMLImageElement;
    name: string;
    w: number;
    h: number;
    fit: Nodo;
    constructor(image: HTMLImageElement, name: string) {
        this.image = image;
        this.image.name = name;
        this.name = name.split(".")[0].replace(/\W/g, '-');
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