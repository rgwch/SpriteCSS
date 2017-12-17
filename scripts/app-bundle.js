define('app',["require", "exports", "packer.growing"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = (function () {
        function App() {
        }
        App.prototype.configureRouter = function (config) {
            config.title = 'SpriteCSS';
            config.map([
                { route: "", moduleId: "sprites", name: "sprites" }
            ]);
        };
        return App;
    }());
    exports.App = App;
});



define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});



define('main',["require", "exports", "./environment"], function (require, exports, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(aurelia) {
        aurelia.use
            .standardConfiguration()
            .feature('resources');
        if (environment_1.default.debug) {
            aurelia.use.developmentLogging();
        }
        if (environment_1.default.testing) {
            aurelia.use.plugin('aurelia-testing');
        }
        aurelia.start().then(function () { return aurelia.setRoot(); });
    }
    exports.configure = configure;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('sprites',["require", "exports", "aurelia-framework", "svg.js", "packer.growing"], function (require, exports, aurelia_framework_1, SVG) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sprites = (function () {
        function Sprites(taskqeue) {
            this.claseBase = "sprite";
            this.prefijo = "sprite-";
            this.ejemplo = "";
            this.taskqeue = taskqeue;
        }
        Sprites.prototype.procesar = function () {
            var _this = this;
            if (this.archivos === undefined || this.archivos.length <= 0) {
                console.log("Imagenes requeridas");
                return;
            }
            this.cargarImagenes(this.archivos).then(function (imagenes) {
                _this.imagenes = imagenes;
                _this.packer = new GrowingPacker();
                _this.packer.fit(imagenes);
                _this.dibujarImagenes();
                _this.cssGenerado = _this.generarCss(imagenes);
                _this.ejemplo = "&lt;span class=&quot;" + _this.claseBase + " " + _this.prefijo + imagenes[0].name + "&quot;&gt;&lt;&#x2F;span&gt;";
                _this.taskqeue.queueMicroTask(function () {
                    document.getElementById("divGenerado").scrollIntoView({ behavior: "smooth", block: "start" });
                });
            });
        };
        Sprites.prototype.descargarSpriteSheet = function () {
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
        };
        Sprites.prototype.generarCss = function (imagenes) {
            var _this = this;
            imagenes.sort(function (a, b) {
                var an = a.name.toLowerCase();
                var bn = b.name.toLowerCase();
                if (an > bn) {
                    return 1;
                }
                else if (an < bn) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
            var width = this.packer.root.w, height = this.packer.root.h;
            var css = "";
            var reglaBase = ".".concat(this.claseBase, " { width: 100%; height: auto; display: inline-block; background-size: 0%; background-image: url('png.png');}\n");
            css += reglaBase;
            imagenes.forEach(function (imagen) {
                if (imagen.fit) {
                    var nombre = imagen.name;
                    var posX = _this.porcentage(imagen.fit.x, width, imagen.w);
                    var posY = _this.porcentage(imagen.fit.y, height, imagen.h);
                    var sizeX = width / imagen.w * 100;
                    var sizeY = height / imagen.h * 100;
                    var aspectRatio = imagen.height / imagen.width * 100;
                    var regla = ".".concat(_this.claseBase, ".", _this.prefijo, nombre, " { padding-top: ", aspectRatio.toString(), "%; background-position: ", posX.toString(), "% ", posY.toString(), "%; background-size: ", sizeX.toString(), "% ", sizeY.toString(), "%;}\n");
                    css += regla;
                }
            });
            return css;
        };
        Sprites.prototype.copiarTexto = function () {
            if (this.cssGenerado === null) {
                console.log("No hay texto generado");
                return;
            }
            var t = document.createElement("textarea");
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
            }
            catch (err) {
                console.log("Copia no permitida");
            }
            document.body.removeChild(t);
        };
        Sprites.prototype.descargarTexto = function () {
            if (this.cssGenerado === null) {
                console.log("No hay texto generado");
                return;
            }
            var a = document.createElement("a");
            a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(this.cssGenerado));
            a.setAttribute("download", "sprites.css");
            a.style.display = "none";
            document.body.appendChild(a);
            console.log(a);
            a.click();
            document.body.removeChild(a);
        };
        Sprites.prototype.porcentage = function (posicion, dimensionContenedor, dimensionImagen) {
            var diferencia = dimensionContenedor - dimensionImagen;
            if (diferencia === 0) {
                return 0;
            }
            return posicion / diferencia * 100;
        };
        Sprites.prototype.cargarImagenes = function (archivos) {
            var promesas = [];
            for (var i = 0; i < archivos.length; i++) {
                promesas.push(this.cargarImagen(archivos.item(i)));
            }
            return Promise.all(promesas);
        };
        Sprites.prototype.cargarImagen = function (archivo) {
            return new Promise(function (resolve, reject) {
                var imagen = new Image();
                var reader = new FileReader();
                reader.onload = function () {
                    imagen.src = reader.result;
                };
                imagen.onload = function () {
                    imagen.name = archivo.name.split(".")[0];
                    resolve(imagen);
                };
                imagen.onerror = function (error) {
                    reject("Problema al crear imagen " + archivo.name + "\n. Error es: " + JSON.stringify(error));
                };
                reader.onerror = function (error) {
                    reject("Problema al leer archivo " + archivo.name + "\n. Error es: " + JSON.stringify(error));
                };
                reader.readAsDataURL(archivo);
            });
        };
        Sprites.prototype.colorAleatorio = function (opacidad) {
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
        };
        Sprites.prototype.dibujarImagenes = function () {
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
                this.fill({ opacity: 1 });
            };
            var mouseout = function () {
                this.fill({ opacity: .1 });
            };
            for (var i = 0; i < this.imagenes.length; i++) {
                var imagen = this.imagenes[i];
                if (imagen.fit) {
                    var rec = dibujo.rect(imagen.width, imagen.height).move(imagen.fit.x, imagen.fit.y).fill({ color: this.colorAleatorio(), opacity: .1 }).stroke("#000000");
                    dibujo.image(imagen.src).move(imagen.fit.x, imagen.fit.y).style("pointer-events", "none");
                    rec.on("mouseover", mouseover);
                    rec.on("mouseout", mouseout);
                    dibujo.plain((i + 1).toString()).move(imagen.fit.x, imagen.fit.y).font({ size: 24, family: "Georgia" }).fill("#000000");
                }
            }
        };
        Sprites = __decorate([
            aurelia_framework_1.autoinject,
            __metadata("design:paramtypes", [aurelia_framework_1.TaskQueue])
        ], Sprites);
        return Sprites;
    }());
    exports.Sprites = Sprites;
});



define('resources/index',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(config) {
    }
    exports.configure = configure;
});



/******************************************************************************
 
 This is a binary tree based bin packing algorithm that is more complex than
 the simple Packer (packer.js). Instead of starting off with a fixed width and
 height, it starts with the width and height of the first block passed and then
 grows as necessary to accomodate each subsequent block. As it grows it attempts
 to maintain a roughly square ratio by making 'smart' choices about whether to
 grow right or down.
 
 When growing, the algorithm can only grow to the right OR down. Therefore, if
 the new block is BOTH wider and taller than the current target then it will be
 rejected. This makes it very important to initialize with a sensible starting
 width and height. If you are providing sorted input (largest first) then this
 will not be an issue.
 
 A potential way to solve this limitation would be to allow growth in BOTH
 directions at once, but this requires maintaining a more complex tree
 with 3 children (down, right and center) and that complexity can be avoided
 by simply chosing a sensible starting block.
 
 Best results occur when the input blocks are sorted by height, or even better
 when sorted by max(width,height).
 
 Inputs:
 ------
 
 blocks: array of any objects that have .w and .h attributes
 
 Outputs:
 -------
 
 marks each block that fits with a .fit attribute pointing to a
 node with .x and .y coordinates
 
 Example:
 -------
 
 var blocks = [
 { w: 100, h: 100 },
 { w: 100, h: 100 },
 { w:  80, h:  80 },
 { w:  80, h:  80 },
 etc
 etc
 ];
 
 var packer = new GrowingPacker();
 packer.fit(blocks);
 
 for(var n = 0 ; n < blocks.length ; n++) {
 var block = blocks[n];
 if (block.fit) {
 Draw(block.fit.x, block.fit.y, block.w, block.h);
 }
 }
 
 
 ******************************************************************************/

GrowingPacker = function () { };

GrowingPacker.prototype = {

    fit: function (blocks) {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].w = blocks[i].width;
            blocks[i].h = blocks[i].height;
        }
        blocks.sort(function (a, b) {
            return b.w + b.h > a.w + a.h;
        });
        var len = blocks.length;
        var w = len > 0 ? blocks[0].w : 0;
        var h = len > 0 ? blocks[0].h : 0;
        this.root = {x: 0, y: 0, w: w, h: h};
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var node = this.findNode(this.root, block.w, block.h);
            if (node)
                block.fit = this.splitNode(node, block.w, block.h);
            else
                block.fit = this.growNode(block.w, block.h);
        }
    },

    findNode: function (root, w, h) {
        if (root.used)
            return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
        else if ((w <= root.w) && (h <= root.h))
            return root;
        else
            return null;
    },

    splitNode: function (node, w, h) {
        node.used = true;
        node.down = {x: node.x, y: node.y + h, w: node.w, h: node.h - h};
        node.right = {x: node.x + w, y: node.y, w: node.w - w, h: h};
        return node;
    },

    growNode: function (w, h) {
        var canGrowDown = (w <= this.root.w);
        var canGrowRight = (h <= this.root.h);

        var shouldGrowRight = canGrowRight && (this.root.h >= (this.root.w + w)); // attempt to keep square-ish by growing right when height is much greater than width
        var shouldGrowDown = canGrowDown && (this.root.w >= (this.root.h + h)); // attempt to keep square-ish by growing down  when width  is much greater than height

        if (shouldGrowRight)
            return this.growRight(w, h);
        else if (shouldGrowDown)
            return this.growDown(w, h);
        else if (canGrowRight)
            return this.growRight(w, h);
        else if (canGrowDown)
            return this.growDown(w, h);
        else
            return null; // need to ensure sensible root starting size to avoid this happening
    },

    growRight: function (w, h) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w + w,
            h: this.root.h,
            down: this.root,
            right: {x: this.root.w, y: 0, w: w, h: this.root.h}
        };
        var node = this.findNode(this.root, w, h);
        if (node)
            return this.splitNode(node, w, h);
        else
            return null;
    },

    growDown: function (w, h) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w,
            h: this.root.h + h,
            down: {x: 0, y: this.root.h, w: this.root.w, h: h},
            right: this.root
        };
        var node = this.findNode(this.root, w, h);
        if (node)
            return this.splitNode(node, w, h);
        else
            return null;
    }

};



define("packer.growing", [],function(){});

define('text!app.html', ['module'], function(module) { module.exports = "<template><require from=bootstrap/css/bootstrap.css></require><nav class=\"navbar navbar-inverse\"><div class=container-fluid><div class=navbar-header><button type=button class=\"navbar-toggle collapsed\" data-toggle=collapse data-target=#bs-example-navbar-collapse-2><span class=sr-only>Toggle navigation</span><span class=icon-bar></span><span class=icon-bar></span><span class=icon-bar></span></button><a class=navbar-brand href=#>SpriteCSS</a></div><div class=\"collapse navbar-collapse\" id=bs-example-navbar-collapse-2><ul class=\"nav navbar-nav\"></ul><ul class=\"nav navbar-nav navbar-right\"></ul></div></div></nav><router-view></router-view></template>"; });
define('text!sprites.html', ['module'], function(module) { module.exports = "<template><div class=container><h1>CSS Sprite Responsive</h1><p>Genera reglas CSS para sprites auto ajustables, usando imágenes locales</p><form><div class=form-group><label for=inputClaseBase>Clase Base</label><input type=text class=form-control placeholder=\"Clase base para todos los elementos\" value=sprite id=inputClaseBase value.bind=claseBase></div><div class=form-group><label for=inputPrefijo>Prefijo</label><input type=text class=form-control placeholder=\"Prefijo a cada elemento\" value=sprite- id=inputPrefijo value.bind=prefijo></div><div class=form-group><label for=inputArchivos>Imagenes</label><input type=file multiple accept=image/* id=inputArchivos files.bind=archivos></div><button type=button class=\"btn btn-default\" click.delegate=procesar()>Generar</button></form></div><div class=container id=divGenerado show.bind=cssGenerado><h2>Resultado</h2><div class=clearfix></div><div class=form-group><label for=cssGenerado>CSS</label><span class=pull-right><a href=# click.delegate=copiarTexto()>Copiar&nbsp;<span class=\"glyphicon glyphicon-copy\"></span></a>&nbsp;&nbsp;<a href=# click.delegate=descargarTexto()>Descargar&nbsp;<span class=\"glyphicon glyphicon-download-alt\"></span></a></span><textarea class=form-control value.bind=cssGenerado rows=1 id=cssGenerado style=resize:none></textarea></div><div class=form-group><label>Ejemplo de uso</label><pre id=areaEjemplo innerhtml.bind=ejemplo>\r\n            </pre></div><div class=row><div class=\"col-xs-12 form-group\"><a href=# class=pull-right download=png.png click.delegate=descargarSpriteSheet()>Descargar spritesheet&nbsp;<span class=\"glyphicon glyphicon-download-alt\"></span></a></div><div class=col-xs-12 id=dibujo></div></div></div></template>"; });
//# sourceMappingURL=app-bundle.js.map