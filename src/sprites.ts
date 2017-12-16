import "packer.growing";

declare var GrowingPacker;
export class Sprites {
    private claseBase: string;
    private prefijo: string;
    private archivos: FileList;
    private generado = false;
    constructor() {
        this.claseBase = "sprite";
        this.prefijo = "sprite-";
        this.generado = true;
    }
    generar(): void {
        if (this.archivos === undefined || this.archivos.length <= 0) {
            console.log("Imagenes requeridas");
            return;
        }
        this.cargarImagenes(this.archivos).then(imagenes => {
            var packer = new GrowingPacker();
            packer.fit(imagenes);

            var canvas = <HTMLCanvasElement> document.getElementById("atlas");
            canvas.width = packer.root.w;
            canvas.height = packer.root.h;
            this.dibujarImagenes(canvas, imagenes);
        })
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
    private dibujarImagenes(canvas: HTMLCanvasElement, imagenes) {
        //dibujar rectangulos
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.fillStyle = this.color();
                ctx.fillRect(imagen.fit.x, imagen.fit.y, imagen.width, imagen.height);
            }
        }
        //dibujar contorno
        ctx.fillStyle = "rgb(255,255,255,1)";
        ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.strokeRect(imagen.fit.x, imagen.fit.y, imagen.width, imagen.height);
            }
        }
        //dibujar imagen
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.drawImage(imagen, imagen.fit.x, imagen.fit.y);
            }
        }
        //dibujar numeracion
        ctx.font = "24px Georgia";
        ctx.textBaseline = "top";
        for (var i = 0; i < imagenes.length; i++) {
            var imagen = imagenes[i];
            if (imagen.fit) {
                ctx.fillText((i + 1) + "", imagen.fit.x, imagen.fit.y);
            }
        }
    }
    private color(): string {
        var r = Math.floor(Math.random() * 255) + 1;
        var g = Math.floor(Math.random() * 255) + 1;
        var b = Math.floor(Math.random() * 255) + 1;
        return "rgb(" + r + "," + g + "," + b + "," + ".5)";
    }
}