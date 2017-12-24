define("BootstrapFormRenderer",["require","exports"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(){}return e.prototype.render=function(e){for(var t=0,o=e.unrender;t<o.length;t++)for(var a=o[t],r=a.result,n=0,s=a.elements;n<s.length;n++){var i=s[n];this.remove(i,r)}for(var l=0,c=e.render;l<c.length;l++)for(var d=c[l],p=(r=d.result,0),u=d.elements;p<u.length;p++){i=u[p];this.add(i,r)}},e.prototype.add=function(e,t){if(!t.valid){var o=e.closest(".form-group");if(o){o.classList.add("has-error");var a=document.createElement("span");a.className="help-block validation-message",a.textContent=t.message,a.id="validation-message-"+t.id,o.appendChild(a)}}},e.prototype.remove=function(e,t){if(!t.valid){var o=e.closest(".form-group");if(o){o.classList.add("has-success");var a=o.querySelector("#validation-message-"+t.id);a&&(o.removeChild(a),0===o.querySelectorAll(".help-block.validation-message").length&&o.classList.remove("has-error"))}}},e}();t.BootstrapFormRenderer=o}),define("app",["require","exports","packer.growing"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(){}return e.prototype.configureRouter=function(e){e.title="SpriteCSS",e.map([{route:"",moduleId:"sprites",name:"sprites"}])},e}();t.App=o}),define("environment",["require","exports"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={debug:!1,testing:!1}}),define("main",["require","exports","./environment"],function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.configure=function(e){e.use.standardConfiguration().feature("resources"),o.default.debug&&e.use.developmentLogging(),o.default.testing&&e.use.plugin("aurelia-testing").plugin("aurelia-validation"),e.start().then(function(){return e.setRoot()})}});var __decorate=this&&this.__decorate||function(e,t,o,a){var r,n=arguments.length,s=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,a);else for(var i=e.length-1;i>=0;i--)(r=e[i])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s},__metadata=this&&this.__metadata||function(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)};define("sprites",["require","exports","aurelia-framework","aurelia-validation","./BootstrapFormRenderer","svg.js","packer.growing"],function(e,t,o,a,r,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){this.claseBase="sprite",this.prefijo="sprite-",this.ejemplo="",this.ejemploVertical="",this.taskqeue=e,this.validationController=t,this.validationController.addRenderer(new r.BootstrapFormRenderer),this.validationController.validateTrigger=a.validateTrigger.changeOrBlur}return e.prototype.attached=function(){a.ValidationRules.ensure(function(e){return e.claseBase}).required().withMessage("Clase base requerida").matches(/^[a-zA-Z_].*$/).withMessage("Debe de empezar con alguna letra o guión bajo").matches(/^(?!__).*$/).withMessage("No puede empezar con dos guiones bajos").matches(/^[a-zA-Z0-9_-]*$/).withMessage("Sólo puede contener letras, numeros o guiones").ensure(function(e){return e.prefijo}).required().withMessage("Prefijo requerido").matches(/^[a-zA-Z_].*$/).withMessage("Debe de empezar con alguna letra o guión bajo").matches(/^(?!__).*$/).withMessage("No puede empezar con dos guiones bajos").matches(/^[a-zA-Z0-9_-]*$/).withMessage("Sólo puede contener letras, numeros o guiones").ensure(function(e){return e.archivos}).required().withMessage("Selecciona imágenes").on(this)},e.prototype.procesar=function(){var e=this;this.validationController.validate().then(function(t){t.valid&&e.generar()})},e.prototype.generar=function(){var e=this;this.nombreArchivo=this.claseBase,this.cargarImagenes(this.archivos).then(function(t){e.imagenes=t,e.packer=new GrowingPacker,e.packer.fit(t),e.dibujarImagenes(),e.cssGenerado=e.generarCss(t),e.ejemplo="&lt;span class=&quot;"+e.claseBase+" "+e.prefijo+t[0].name+"&quot;&gt;&lt;&#x2F;span&gt;",e.ejemploVertical="&lt;svg viewBox=&quot;0 0 100 150&quot; class=&quot;"+e.claseBase+" "+e.prefijo+t[0].name+" vertical&quot;&gt;&lt;&#x2F;svg&gt;",e.taskqeue.queueMicroTask(function(){document.getElementById("divGenerado").scrollIntoView({behavior:"smooth",block:"start"})})})},e.prototype.generarCss=function(e){var t=this;e.sort(function(e,t){var o=e.name.toLowerCase(),a=t.name.toLowerCase();return o>a?1:o<a?-1:0});var o=this.packer.root.w,a=this.packer.root.h,r="",n=".".concat(this.claseBase," { width: 100%; height: auto; display: inline-block; background-size: 0%; background-image: url(",this.claseBase,".png);}\n");r+=n;var s="svg.".concat(this.claseBase,".vertical, img.",this.claseBase,".vertical{ height: 100%!important; width: auto!important; padding-top: 0!important;}\n");return r+=s,e.forEach(function(e){if(e.fit){var n=e.name,s=t.porcentage(e.fit.x,o,e.w),i=t.porcentage(e.fit.y,a,e.h),l=o/e.w*100,c=a/e.h*100,d=e.height/e.width*100,p=".".concat(t.claseBase,".",t.prefijo,n," { padding-top: ",d.toString(),"%; background-position: ",s.toString(),"% ",i.toString(),"%; background-size: ",l.toString(),"% ",c.toString(),"%;}\n");r+=p}}),r},e.prototype.copiarTexto=function(){if(null!==this.cssGenerado){var e=document.createElement("textarea");e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="2em",e.style.height="2em",e.style.padding="0",e.style.border="none",e.style.outline="none",e.style.boxShadow="none",e.style.background="transparent",e.value=this.cssGenerado,document.body.appendChild(e),e.select();try{document.execCommand("Copy")}catch(e){console.log("Copia no permitida")}document.body.removeChild(e)}else console.log("No hay texto generado")},e.prototype.descargarSpriteSheet=function(){if(null!=this.packer&&null!==this.imagenes){null===this.nombreArchivo&&(this.nombreArchivo="png");var e=document.createElement("canvas");e.width=this.packer.root.w,e.height=this.packer.root.h;for(var t=e.getContext("2d"),o=0;o<this.imagenes.length;o++){var a=this.imagenes[o];a.fit&&t.drawImage(a,a.fit.x,a.fit.y)}var r=document.createElement("a");r.setAttribute("href",e.toDataURL("image/png")),r.setAttribute("download",this.nombreArchivo+".png"),r.style.display="none",document.body.appendChild(r),r.click(),document.body.removeChild(r)}else console.log("Packer no generado o sin imagenes")},e.prototype.descargarTexto=function(){if(null!==this.cssGenerado){var e=document.createElement("a");e.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(this.cssGenerado)),e.setAttribute("download","sprites.css"),e.style.display="none",document.body.appendChild(e),e.click(),document.body.removeChild(e)}else console.log("No hay texto generado")},e.prototype.porcentage=function(e,t,o){var a=t-o;return 0===a?0:e/a*100},e.prototype.cargarImagenes=function(e){for(var t=[],o=0;o<e.length;o++)t.push(this.cargarImagen(e.item(o)));return Promise.all(t)},e.prototype.cargarImagen=function(e){return new Promise(function(t,o){var a=new Image,r=new FileReader;r.onload=function(){a.src=r.result},a.onload=function(){a.name=e.name.split(".")[0].replace(/\W/g,"-"),t(a)},a.onerror=function(t){o("Problema al crear imagen "+e.name+"\n. Error es: "+JSON.stringify(t))},r.onerror=function(t){o("Problema al leer archivo "+e.name+"\n. Error es: "+JSON.stringify(t))},r.readAsDataURL(e)})},e.prototype.colorAleatorio=function(e){var t="ff";e&&e<=1&&e>=0&&(t=Math.floor(256*e).toString(16)).length<2&&(t="00".substr(0,2-t.length)+t);var o=Math.floor(16777215*Math.random()).toString(16);return o.length<6&&(o="000000".substr(0,6-o.length)+o),"#".concat(o).concat(t)},e.prototype.dibujarImagenes=function(){if(void 0===this.archivos||this.archivos.length<=0)console.log("Imagenes requeridas");else{var e=document.getElementById("dibujo");e.innerText="";var t=n(e).size(this.packer.root.w,this.packer.root.h);t.viewbox(0,0,this.packer.root.w,this.packer.root.h),t.addClass("img-responsive"),t.addClass("center-block");for(var o=function(){this.fill({opacity:1})},a=function(){this.fill({opacity:.1})},r=0;r<this.imagenes.length;r++){var s=this.imagenes[r];if(s.fit){var i=t.rect(s.width,s.height).move(s.fit.x,s.fit.y).fill({color:this.colorAleatorio(),opacity:.1}).stroke("#000000");t.image(s.src).move(s.fit.x,s.fit.y).style("pointer-events","none"),i.on("mouseover",o),i.on("mouseout",a),t.plain((r+1).toString()).move(s.fit.x,s.fit.y).font({size:24,family:"Georgia"}).fill("#000000")}}}},e=__decorate([o.autoinject,__metadata("design:paramtypes",[o.TaskQueue,a.ValidationController])],e)}();t.Sprites=s}),define("resources/index",["require","exports"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.configure=function(e){}}),GrowingPacker=function(){},GrowingPacker.prototype={fit:function(e){for(var t=0;t<e.length;t++)e[t].w=e[t].width,e[t].h=e[t].height;e.sort(function(e,t){return t.w+t.h>e.w+e.h});var o=e.length,a=o>0?e[0].w:0,r=o>0?e[0].h:0;this.root={x:0,y:0,w:a,h:r};for(t=0;t<e.length;t++){var n=e[t],s=this.findNode(this.root,n.w,n.h);n.fit=s?this.splitNode(s,n.w,n.h):this.growNode(n.w,n.h)}},findNode:function(e,t,o){return e.used?this.findNode(e.right,t,o)||this.findNode(e.down,t,o):t<=e.w&&o<=e.h?e:null},splitNode:function(e,t,o){return e.used=!0,e.down={x:e.x,y:e.y+o,w:e.w,h:e.h-o},e.right={x:e.x+t,y:e.y,w:e.w-t,h:o},e},growNode:function(e,t){var o=e<=this.root.w,a=t<=this.root.h,r=a&&this.root.h>=this.root.w+e,n=o&&this.root.w>=this.root.h+t;return r?this.growRight(e,t):n?this.growDown(e,t):a?this.growRight(e,t):o?this.growDown(e,t):null},growRight:function(e,t){this.root={used:!0,x:0,y:0,w:this.root.w+e,h:this.root.h,down:this.root,right:{x:this.root.w,y:0,w:e,h:this.root.h}};var o=this.findNode(this.root,e,t);return o?this.splitNode(o,e,t):null},growDown:function(e,t){this.root={used:!0,x:0,y:0,w:this.root.w,h:this.root.h+t,down:{x:0,y:this.root.h,w:this.root.w,h:t},right:this.root};var o=this.findNode(this.root,e,t);return o?this.splitNode(o,e,t):null}},define("packer.growing",[],function(){}),define("text!app.html",["module"],function(e){e.exports='<template><require from=bootstrap/css/bootstrap.css></require><nav class="navbar navbar-inverse"><div class=container-fluid><div class=navbar-header><button type=button class="navbar-toggle collapsed" data-toggle=collapse data-target=#bs-example-navbar-collapse-2><span class=sr-only>Toggle navigation</span><span class=icon-bar></span><span class=icon-bar></span><span class=icon-bar></span></button><a class=navbar-brand href=#>SpriteCSS</a></div><div class="collapse navbar-collapse" id=bs-example-navbar-collapse-2><ul class="nav navbar-nav"></ul><ul class="nav navbar-nav navbar-right"></ul></div></div></nav><router-view></router-view></template>'}),define("text!sprites.html",["module"],function(e){e.exports='<template><div class=container><h1>SpriteCSS</h1><p>Genera reglas CSS para sprites autoajustables, usando imágenes locales</p><form><div class=form-group><label for=inputClaseBase>Clase Base</label><input type=text class=form-control placeholder="Clase base para todos los elementos" value=sprite id=inputClaseBase value.bind="claseBase & validate"></div><div class=form-group><label for=inputPrefijo>Prefijo</label><input type=text class=form-control placeholder="Prefijo a cada elemento" value=sprite- id=inputPrefijo value.bind="prefijo & validate"></div><div class=form-group><label for=inputArchivos>Imagenes</label><input type=file multiple accept=image/* id=inputArchivos files.bind="archivos & validate"></div><button type=button class="btn btn-default" click.delegate=procesar()>Generar</button></form></div><div class=container id=divGenerado show.bind=cssGenerado><h2>Resultado</h2><div class=clearfix></div><div class=form-group><label for=cssGenerado>CSS</label><span class=pull-right><a href=# click.delegate=copiarTexto()>Copiar&nbsp;<span class="glyphicon glyphicon-copy"></span></a>&nbsp;&nbsp;<a href=# click.delegate=descargarTexto()>Descargar&nbsp;<span class="glyphicon glyphicon-download-alt"></span></a></span><textarea class=form-control value.bind=cssGenerado rows=4 id=cssGenerado style=resize:none readonly></textarea></div><div class=form-group><label>Ejemplo de uso</label><a href=# class=pull-right click.delegate="verAjusteVertical = !verAjusteVertical" onclick=return!1>Ajuste vertical&nbsp;<span class="glyphicon glyphicon-question-sign"></span></a><pre innerhtml.bind=ejemplo>\r\n            </pre></div><div class="form-group text-justify" show.bind=verAjusteVertical><label>Ajuste vertical</label><p>Para autoajustar elementos (como imagenes) en una página web, se requiere una&nbsp;<a href=https://developer.mozilla.org/en-US/docs/Web/CSS/@media/aspect-ratio rel=nofollow target=_blank>relacion de aspecto</a>, así el navegador ajusta la imagen cuando el ancho de su contenedor cambia. No es posible autoajustar el ancho del elemento cuando la altura de su contenedor cambia.</p><p>Es poco común usar elementos autoajustables a la altura del contenedor. Pero en caso que desees, necesitas un&nbsp;<a href=https://developer.mozilla.org/en-US/docs/Web/CSS/Replaced_element rel=nofollow target=_blank>elemento reemplazado</a>. Una técnica popular es usar elementos &nbsp;<code>&lt;img&gt;</code>&nbsp;, cuyo atributo&nbsp;<code>src</code>&nbsp;hace referencia a una&nbsp;<a href=https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding rel=nofollow target=_blank>imagen base 64</a>&nbsp;transparente con las proporciones deseadas. Tambien es posible utilizar un elemento&nbsp;<code>&lt;svg&gt;</code>&nbsp;, definiendo proporciones en su atributo&nbsp;<code>viewBox</code>&nbsp;. En ambos casos es indispensable declarar las dimensiones de la imagen al definir el elemento.</p><p>Para lograr tal efecto con esta herramienta, dentro de un contenedor de altura definida, agrega la imagen siguiendo el ejemplo (cambia los valores&nbsp;<var>100</var>&nbsp;y&nbsp;<var>150</var>&nbsp;por las dimensiones de tu imagen):</p><pre innerhtml.bind=ejemploVertical>\r\n            </pre></div><div class=form-group><label>Hoja de sprites</label><div class="col-xs-12 text-right"><a href=# download=png.png click.delegate=descargarSpriteSheet()>Descargar imagen&nbsp;<span class="glyphicon glyphicon-download-alt"></span></a><br><small><strong>Sugerencia:</strong>&nbsp;Usa un compresor como&nbsp;<a href=http://compresspng.com/ rel=nofollow target=_blank>compresspng.com</a>&nbsp;para optimizar la imagen</small></div><div class=col-xs-12 id=dibujo></div></div></div></template>'});