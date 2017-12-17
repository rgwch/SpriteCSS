import {autoinject, TaskQueue} from 'aurelia-framework';
import "packer.growing";

declare var GrowingPacker;

import * as SVG from "svg.js";

@autoinject
export class Sprites {
    private claseBase: string;
    private prefijo: string;
    private archivos: FileList;
    private cssGenerado: string;
    private ejemplo: string;
    private taskqeue: TaskQueue;
    private packer;
    private imagenes: any[];
    constructor(taskqeue: TaskQueue) {
        this.taskqeue = taskqeue;
        this.claseBase = "sprite";
        this.prefijo = "sprite-";
        this.cssGenerado = "algo";
    }
    generar(): void {
        if (this.archivos === undefined || this.archivos.length <= 0) {
            console.log("Imagenes requeridas");
            return;
        }
        this.cargarImagenes(this.archivos).then(imagenes => {
            this.imagenes = imagenes;
            this.packer = new GrowingPacker();
            this.packer.fit(imagenes);
            this.dibujarImagenes();
            this.cssGenerado = this.generarCss(imagenes);
            this.ejemplo = "&lt;span class=&quot;" + this.claseBase + " " + this.prefijo + imagenes[0].name + "&quot;&gt;&lt;&#x2F;span&gt;";
            this.taskqeue.queueMicroTask(() => {
                document.getElementById("divGenerado").scrollIntoView({behavior: "smooth", block: "start"});
            });
        })
    }
    generarCss(imagenes): string {
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
        var reglaBase = ".".concat(this.claseBase, " { width: 100%; height: auto; display: inline-block; background-size: 0%; background-image: url('png.png');}\n");
        css += reglaBase;
        imagenes.forEach(imagen => {
            if (imagen.fit) {
                var nombre = imagen.name;
                var posX = this.porcentage(imagen.fit.x, width, imagen.w);
                var posY = this.porcentage(imagen.fit.y, height, imagen.h);
                var sizeX = width / imagen.w * 100;
                var sizeY = height / imagen.h * 100;
                var aspectRatio = imagen.height / imagen.width * 100;
                var regla = ".".concat(this.claseBase, ".", this.prefijo, nombre, " { padding-top: ", aspectRatio.toString(), "%; background-position: ", posX.toString(), "% ", posY.toString(), "%; background-size: ", sizeX.toString(), "% ", sizeY.toString(), "%;}\n");
                css += regla;
            }
        });
        return css;
    }
    porcentage(posicion: number, dimensionContenedor: number, dimensionImagen: number): number {
        var diferencia = dimensionContenedor - dimensionImagen;
        if (diferencia === 0) {
            return 0;
        }
        return posicion / diferencia * 100;
    }
    private cargarImagenes(archivos: FileList): Promise<HTMLImageElement[]> {
        var promesas = [];
        for (var i = 0; i < archivos.length; i++) {
            promesas.push(this.cargarImagen(archivos.item(i)));
        }
        return Promise.all(promesas);
    }
    private cargarImagen(archivo: File): Promise<HTMLImageElement> {
        return new Promise(function (resolve, reject) {
            var imagen = new Image();
            var reader = new FileReader();
            reader.onload = () => {
                imagen.src = reader.result;
            }
            imagen.onload = () => {
                imagen.name = archivo.name.split(".")[0]; //TODO: reemplazar espacios y caracteres especiales
                resolve(imagen);
            }
            imagen.onerror = error => {
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
                var rec = dibujo.rect(imagen.width, imagen.height).move(imagen.fit.x, imagen.fit.y).fill({color: this.colorAleatorio(), opacity: .1}).stroke("#000000");
                dibujo.image(imagen.src).move(imagen.fit.x, imagen.fit.y).style("pointer-events", "none");
                rec.on("mouseover", mouseover);
                rec.on("mouseout", mouseout);
                dibujo.plain((i + 1).toString()).move(imagen.fit.x, imagen.fit.y).font({size: 24, family: "Georgia"}).fill("#000000");
            }
        }
    }
    private descargar() {
        if (this.packer == null || this.imagenes === null) {
            console.log("Packer no generado o sin imagenes");
            return;
        }
        var canvas = document.createElement("canvas");
        canvas.width = this.packer.root.w;
        canvas.height = this.packer.root.h;
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < this.imagenes.length; i++) {
            var imagen = this.imagenes[i];
            if (imagen.fit) {
                ctx.drawImage(imagen, imagen.fit.x, imagen.fit.y);
            }
        }
        window.open(canvas.toDataURL("image/png"));
    }
}