export class Sprites {
    private claseBase: string;
    private prefijo: string;
    private imagenes: FileList;
    constructor() {
        this.claseBase = "sprite";
        this.prefijo = "sprite-";
    }
    generar(): void {
        if (this.imagenes === undefined || this.imagenes.length <= 0) {
            console.log("Imagenes requeridas");
            return;
        }
        for (var i = 0; i < this.imagenes.length; i++) {
            this.cargar(this.imagenes.item(i)).then(console.log);
        }
    }
    private cargar(archivo: File): Promise<any> {
        return new Promise(function (resolve, reject) {
            var imagen = new Image();
            var reader = new FileReader();
            reader.onload = () => {
                imagen.src = reader.result;
                resolve(imagen);
            }
            imagen.onload = () => {
                imagen.name = archivo.name.split(".")[0]; //TODO: reemplazar espacios y caracteres especiales
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
}