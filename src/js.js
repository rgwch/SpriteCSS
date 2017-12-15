$(document).ready(function () {
                if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                    alert('The File APIs are not fully supported in this browser.');
                }
            });
            $("#botonGenerar").on("click", function () {
                var archivos = $("#inputImagenes").prop("files");
                if (archivos.length <= 0) {
                    return;
                }
                var claseBase = $("#inputClaseBase").val();
                var prefijo = $("#inputPrefijo").val();
                Promise.map(archivos, cargarImagen).then(function (imagenes) {
                    //ordenar imagenes por dimensiones
                    imagenes.sort(function (a, b) {
                        return b.w + b.w > a.w + a.h;
                    });
                    //bin packer algoritmo
                    var packer = new GrowingPacker();
                    packer.fit(imagenes);
                    //dibujar imagenes
                    var canvas = document.getElementById("atlas");
                    canvas.width = packer.root.w;
                    canvas.height = packer.root.h;
                    dibujarImagenes(canvas, imagenes);
                    //generar css
                    var css = generarCss(claseBase, prefijo, packer.root.w, packer.root.h, imagenes);
                    $("#textareaCss").val(css);
                    //asignar texto ejemplo de uso
                    $("#areaEjemplo").html("&lt;span class=&quot;" + claseBase + " " + prefijo + imagenes[0].name + "&quot;&gt;&lt;&#x2F;span&gt;");
                    //mostrar contenedor de elementos generados
                    $("#divCssGenerado").removeClass("hidden");
                    var divCssGenerado = document.getElementById("divCssGenerado");
                    divCssGenerado.scrollIntoView({block: "start", behavior: "smooth"});
                });
            });

/* global Promise */

function generarCss(claseBase, prefijo, width, height, imagenes) {
    var css = "";
    var reglaBase = ".".concat(claseBase, " { width: 100%; height: 100%; display: inline-block; background-size: 0%; background-image: url('png.png');}\n");
    css += reglaBase;
    imagenes.forEach(function (imagen) {
        if (imagen.fit) {
            var nombre = imagen.name;
            var posX = porcentage(imagen.fit.x, width, imagen.w);
            var posY = porcentage(imagen.fit.y, height, imagen.h);
            var sizeX = width / imagen.w * 100;
            var sizeY = height / imagen.h * 100;
            var aspectRatio = imagen.height / imagen.width * 100;
            var regla = ".".concat(claseBase, ".", prefijo, nombre, " { padding-top: ", aspectRatio, "%; background-position: ", posX, "% ", posY, "%; background-size: ", sizeX, "% ", sizeY, "%;}\n");
            css += regla;
        }
    });
    return css;
}
function dibujarImagenes(canvas, imagenes) {
    var ctx = canvas.getContext("2d");
    imagenes.forEach(function (imagen) {
        if (imagen.fit) {
            ctx.drawImage(imagen, imagen.fit.x, imagen.fit.y);
        }
    });
}
function porcentage(posicion, dimensionContenedor, dimensionImagen) {
    var diferencia = dimensionContenedor - dimensionImagen;
    if (diferencia === 0) {
        return 0;
    }
    return posicion / diferencia * 100;
}
function cargarImagen(archivo) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (evento) {
            var imagen = new Image();
            imagen.src = evento.target.result;
            imagen.onload = function () {
                imagen.name = archivo.name.split(".")[0]; //TODO: reemplazar espacios y caracteres especiales
                imagen.w = imagen.width;
                imagen.h = imagen.height;
                resolve(imagen);
            };
            imagen.onerror = function (error) {
                reject("Problema al crear imagen " + archivo.name + "\n. Error es: " + JSON.stringify(error));
            };
        };
        reader.onerror = function (error) {
            reject("Problema al leer archivo " + archivo.name + "\n. Error es: " + JSON.stringify(error));
        };
        reader.readAsDataURL(archivo);
    });
}
$("[data-descargar-canvas").on("click", function () {
    var selector = $(this).data("descargar-canvas");
    var dataURL = document.getElementById(selector).toDataURL('image/png');
    this.href = dataURL;
});
$("[data-copiar]").on("click", function () {
    var selector = $(this).data("copiar");
    var texto = $(selector);
    if (texto && texto.select()) {
        texto.select();
        try {
            document.execCommand('copy');
            texto.blur();
        } catch (err) {
            console.log("Copia automática no soportada");
        }
    }
});