import {autoinject, TaskQueue} from 'aurelia-framework';
import "packer.growing";

declare var GrowingPacker;

@autoinject
export class Sprites {
    private claseBase: string;
    private prefijo: string;
    private archivos: FileList;
    private cssGenerado: string;
    private ejemplo: string;
    private taskqeue: TaskQueue;
    private canvas: HTMLCanvasElement;
    constructor(taskqeue: TaskQueue) {
        this.taskqeue = taskqeue;
        this.claseBase = "sprite";
        this.prefijo = "sprite-";
    }
    attached(): void {
        this.canvas = <HTMLCanvasElement> document.getElementById("canvasDemo");
    }
    generar(): void {
        if (this.archivos === undefined || this.archivos.length <= 0) {
            console.log("Imagenes requeridas");
            return;
        }
        this.cargarImagenes(this.archivos).then(imagenes => {
            var packer = new GrowingPacker();
            packer.fit(imagenes);

            this.canvas.width = packer.root.w;
            this.canvas.height = packer.root.h;
            this.dibujarImagenes(imagenes);
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
        var width = this.canvas.width, height = this.canvas.height;
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
    private dibujarImagenes(imagenes) {
        var ctx = this.canvas.getContext("2d");
        this.dibujarRectangulos(ctx, imagenes);
        ctx.fillStyle = "rgb(255,255,255,1)";
        this.dibujarContorno(ctx, imagenes);
        this.dibujarImagenesEnContext(ctx, imagenes);
        ctx.font = "24px Georgia";
        ctx.textBaseline = "top";
        this.dibujarNumeracion(ctx, imagenes);
    }
    private dibujarRectangulos(ctx: CanvasRenderingContext2D, imagenes): void {
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.fillStyle = this.color();
                ctx.fillRect(imagen.fit.x, imagen.fit.y, imagen.width, imagen.height);
            }
        }
    }
    private color(): string {
        var r = Math.floor(Math.random() * 255) + 1;
        var g = Math.floor(Math.random() * 255) + 1;
        var b = Math.floor(Math.random() * 255) + 1;
        return "rgb(" + r + "," + g + "," + b + "," + ".5)";
    }
    private dibujarContorno(ctx: CanvasRenderingContext2D, imagenes): void {
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.strokeRect(imagen.fit.x, imagen.fit.y, imagen.width, imagen.height);
            }
        }
    }
    private dibujarImagenesEnContext(ctx: CanvasRenderingContext2D, imagenes): void {
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.drawImage(imagen, imagen.fit.x, imagen.fit.y);
            }
        }
    }
    private dibujarNumeracion(ctx: CanvasRenderingContext2D, imagenes): void {
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.fillText((i + 1) + "", imagen.fit.x, imagen.fit.y);
            }
        }
    }
}