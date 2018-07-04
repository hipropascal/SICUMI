var Clayer = function (layer) {
    layer.status = 'loading';
    var map = document.getElementById(layer.map._container.id);
    layer.dim = {'width': map.offsetWidth, 'height': map.offsetHeight};
    layer.setcanvas = setcanvas;
    layer.loadimage = loadimage;
    layer.drawimage = drawimage;
    layer.switchimage = switchimage;
    if (layer.datatype == 'uv') {
        layer.startanimate = startanimate;
        layer.stopanimate = stopanimate;
        layer.resetanim = resetanim;
    }
    layer.clearimage = clearimage;
    layer.setcanvas();
    layer.loadimage();
    layer.createlegend = createlegend;
    layer.setpalletes = setpalletes;
    var t1;
    this.map.on('moveend move', function (e) {
        clearTimeout(t1);
        layer.clearimage();
        layer.drawimage();
        if (layer.datatype == 'uv') {
            t1 = setTimeout(function () {
                layer.resetanim();
            }, 100);
        }
    });
    return layer;
};

var switchimage = function (path) {
    this.status = 'loading';
    this.impath = path;
    var canvas = document.getElementById(this.canvas);
    if (this.datatype == 'raster')
        this.ctxraster.clearRect(0, 0, canvas.width, canvas.height);
    this.loadimage(path);
};

var setpalletes = function () {
    var pal = this.pal;
    var levels = 256;
    var canvas = document.createElement('canvas');
    canvas.width = levels;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 10;
    var grad = ctx.createLinearGradient(0, 0, levels, 1);
    for (var x = 0; x < pal.colors.length; x++) {
        grad.addColorStop(pal.colorsstop[x], pal.colors[x]);
    }
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(levels, 0);
    ctx.stroke();
    this.palarr = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
};

var createlegend = function () {
    var legcanvas = document.createElement('canvas');
    var width = 350;
    var height = 40;
    legcanvas.setAttribute('width', width);
    legcanvas.setAttribute('height', height);
    legcanvas.style.position = 'absolute';
    legcanvas.style.zIndex = 4;
    var context = legcanvas.getContext('2d');
    var offset = 10;
    var legendwidth = 200;
    var pal = this.pal;
    var grad = context.createLinearGradient(0, 0, legendwidth, 0);
    for (var x = 0; x < pal.colors.length; x++) {
        grad.addColorStop(pal.colorsstop[x], pal.colors[x]);
    }
    context.fillStyle = grad;
    context.fillRect(10, 10, 300, 20);
    var min = parseFloat(this.min);
    var max = parseFloat(this.max);
    context.fillStyle = "rgba(255,255,255,1)";
    context.font = "11px Arial";
    context.textAlign = 'start';
    var point = 6;
    context.strokeStyle = 'rgb(100,100,100)';
    context.lineWidth = 2;
    for (x = 0; x <= point; x++) {
        var value = roundNumber(min + ((max - min) * x / point), 2);
        var positionx = offset + (legendwidth * x / point + 3);
        context.strokeText(value, positionx, height - 15);
        context.fillText(value, positionx, height - 15);
    }
    context.textAlign = 'end';
    this.unit = this.unit.replace('micro', '\u00B5');
    context.strokeText(this.unit, legendwidth + 100, height - 15);
    context.fillText(this.unit, legendwidth + 100, height - 15);
    var lgimg = new Image();
    lgimg.src = legcanvas.toDataURL();
    this.legend = lgimg;
    var lgncontainer = $('#legend');
    lgncontainer.html(lgimg);
};

var setcanvas = function () {
    var layerid = 'cv' + makeid();
    var map = document.getElementById(this.map._container.id);
    var canvas = document.createElement('canvas');
    var container = document.createElement('div');
    container.setAttribute('width', this.dim.width);
    container.setAttribute('height', this.dim.height);
    container.appendChild(canvas);
    if (this.datatype == 'uv')
        container.style.zIndex = 3;
    else
        container.style.zIndex = 2;
    container.style.opacity = 1;
    container.style.position = 'absolute';
    canvas.style.position = 'absolute';
    canvas.style.opacity = 0.5;
    canvas.id = layerid;
    canvas.setAttribute('width', this.dim.width);
    canvas.setAttribute('height', this.dim.height);
    map.parentNode.appendChild(container);
    this.canvas = layerid;
    if (this.datatype == 'uv') {
        var animcanvas = document.createElement('canvas');
        var windcanvas = document.createElement('canvas');
        animcanvas.setAttribute('width', this.dim.width);
        animcanvas.setAttribute('height', this.dim.height);
        animcanvas.style.position = 'absolute';
        animcanvas.style.opacity = .5;
        windcanvas.setAttribute('width', this.dim.width);
        windcanvas.setAttribute('height', this.dim.height);
        windcanvas.style.position = 'absolute';
        windcanvas.style.opacity = 0;
        container.appendChild(animcanvas);
        container.appendChild(windcanvas);
        this.ctxanim = animcanvas.getContext('2d');
        this.ctxwind = windcanvas.getContext('2d');
    }
    if (this.datatype == 'raster') {
        var rastercanvas = document.createElement('canvas');
        rastercanvas.setAttribute('width', this.dim.width);
        rastercanvas.setAttribute('height', this.dim.height);
        rastercanvas.style.position = 'absolute';
        rastercanvas.style.opacity = 0;
        this.ctxraster = rastercanvas.getContext('2d');
    }
    var layer = this;
    window.onresize = function () {
        setTimeout(function () {
            var map = document.getElementById(layer.map._container.id);
            layer.dim = {'width': map.offsetWidth, 'height': map.offsetHeight};
            canvas.setAttribute('width', layer.dim.width);
            canvas.setAttribute('height', layer.dim.height);
            container.setAttribute('width', layer.dim.width);
            container.setAttribute('height', layer.dim.height);
            if (layer.datatype == 'uv') {
                layer.stopanimate();
                layer.resetanim();
                animcanvas.setAttribute('width', layer.dim.width);
                animcanvas.setAttribute('height', layer.dim.height);
                windcanvas.setAttribute('width', layer.dim.width);
                windcanvas.setAttribute('height', layer.dim.height);
                layer.drawimage();
                layer.startanimate();
            }
            if (layer.datatype == 'raster') {
                rastercanvas.setAttribute('width', layer.dim.width);
                rastercanvas.setAttribute('height', layer.dim.height);
                layer.drawimage();
            }
        }, 100);
    };
};

var loadimage = function () {
    var img = new Image();
    img.src = this.impath;
    this.imgobj = img;
    var layer = this;
    img.onload = function () {
        var tmpcanvas = document.createElement('canvas');
        var tmpctx = tmpcanvas.getContext('2d');
        tmpcanvas.setAttribute('width', img.width);
        tmpcanvas.setAttribute('height', img.height);
        tmpctx.drawImage(img, 0, 0, img.width, img.height);
        var im = tmpctx.getImageData(0, 0, img.width, img.height);
        var imgData = im.data;
        var imInfo = '';
        for (var x = 0; x < imgData.length; x++) {
            if ((x + 1) % 4 == 0) {
                if (imgData[x] == 0)
                    break;
                continue;
            }
            if (String.fromCharCode(imgData[x]) == '*')
                break;
            imInfo = imInfo + String.fromCharCode(imgData[x]);
        }
        var infoArr = imInfo.split('|');
        var infoRange = infoArr[1].split('_');
        var infoBound = infoArr[0].split('_');
        var north = parseFloat(infoBound[0]);
        var west = parseFloat(infoBound[1]);
        var south = parseFloat(infoBound[2]);
        var east = parseFloat(infoBound[3]);
        layer.bound = {'north': north, 'west': west, 'south': south, 'east': east};
        if (layer.datatype == 'uv') {
            var minU = parseFloat(infoRange[0]);
            var maxU = parseFloat(infoRange[1]);
            var minV = parseFloat(infoRange[2]);
            var maxV = parseFloat(infoRange[3]);
            layer.uvr = {'minU': minU, 'maxU': maxU, 'minV': minV, 'maxV': maxV};
        }
        if (layer.datatype == 'raster') {
            var minVal = parseFloat(infoRange[0]);
            var maxVal = parseFloat(infoRange[1]);
            layer.minmaxVal = {'min': minVal, 'max': maxVal};
        }
        layer.setpalletes();
        layer.createlegend();
        layer.imres = {'width': img.width, 'height': img.height};
        var magval, red, green, blue, u, v, radval, alpha;
        var magarr = new Array(layer.imres.width * layer.imres.height);
        var radvarr = new Array(layer.imres.width * layer.imres.height);
        if (layer.datatype == "uv") {
            for (x = 3; x < imgData.length; x = x + 4) {
                red = imgData[x - 3];
                green = imgData[x - 2];
                blue = imgData[x - 1];
                alpha = imgData[x];
                if (alpha == 0) {
                    magval = -99;
                    radval = -99;
                    magarr[((x + 1) / 4) - 1] = magval;
                    radvarr[((x + 1) / 4) - 1] = radval;
                    imgData[x - 3] = 0;
                    imgData[x - 2] = 0;
                    imgData[x - 1] = 0;
                    imgData[x] = 0;
                } else {
                    u = layer.uvr.minU + red / 255 * (layer.uvr.maxU - layer.uvr.minU);
                    v = layer.uvr.minV + green / 255 * (layer.uvr.maxV - layer.uvr.minV);
                    magval = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
                    radval = Math.atan2(u, v);
                    magarr[((x + 1) / 4) - 1] = magval;
                    radvarr[((x + 1) / 4) - 1] = radval;
                    var magratio = (magval - layer.min) / (layer.max - layer.min);
                    var colratio = Math.floor(256 * magratio) + 1;
                    if (colratio > 256)
                        colratio = 256;
                    if (colratio < 0)
                        colratio = 0;
                    var magcolpos = colratio * 4;
                    imgData[x - 3] = layer.palarr[magcolpos];
                    imgData[x - 2] = layer.palarr[magcolpos + 1];
                    imgData[x - 1] = layer.palarr[magcolpos + 2];
                }
            }
            tmpctx.putImageData(im, 0, 0);
            var magimg = new Image();
            magimg.src = tmpcanvas.toDataURL();
            layer.magimg = magimg;
            layer.magnitudes = magarr;
            layer.directions = radvarr;
        }

        if (layer.datatype == "raster") {
            for (x = 0; x < imgData.length; x++) {
                if ((x + 1) % 4 == 0) {
                    red = byteString(imgData[x - 3]);
                    green = byteString(imgData[x - 2]);
                    blue = byteString(imgData[x - 1]);
                    var magv = parseInt(red + green + blue, 2);
                    magval = layer.minmaxVal.min + (magv / 16777200 *
                        (layer.minmaxVal.max - layer.minmaxVal.min));
                    magarr[((x + 1) / 4) - 1] = magval;
                    var ratio = (magval - layer.min) / (layer.max - layer.min);
                    var col = Math.floor(256 * ratio) + 1;
                    if (col > 256)
                        col = 256;
                    if (col < 0)
                        col = 0;
                    var colpos = col * 4;
                    imgData[x - 3] = layer.palarr[colpos];
                    imgData[x - 2] = layer.palarr[colpos + 1];
                    imgData[x - 1] = layer.palarr[colpos + 2];
                }
            }
            tmpctx.putImageData(im, 0, 0);
            var magimgr = new Image();
            magimgr.src = tmpcanvas.toDataURL();
            layer.magimg = magimgr;
            layer.magnitudes = magarr;
        }
        layer.status = 'loaded';
        tmpcanvas.remove();
        setTimeout(function () {
            layer.drawimage();
            if (typeof layer.isPlay == 'undefined' && layer.isPlay == null && layer.datatype == "uv") {
                setTimeout(function () {
                    layer.startanimate();
                });
            } else if (layer.datatype == "uv") {
                layer.resetanim();
            }
        }, 500);
    };
};
var benchmark = '';
var drawimage = function () {
    var layer = this;
    var canvas = document.getElementById(this.canvas);
    if (this.datatype == 'raster')
        this.ctxraster.clearRect(0, 0, canvas.width, canvas.height);
    var ctx = canvas.getContext('2d');
    var xy1 = this.map.latLngToContainerPoint([this.bound.north, this.bound.west]);
    var xy2 = this.map.latLngToContainerPoint([this.bound.south, this.bound.east]);
    var mapx = xy1.x;
    var mapy = xy1.y;
    var scaledwidth = xy2.x - xy1.x;
    var originalwidth = this.imres.width;
    var xscale = originalwidth / scaledwidth;
    var scaledheight = Math.abs(xy1.y - xy2.y);
    var originalheight = this.imres.height;
    var yscale = originalheight / scaledheight;
    var xcrop = (function () {
        if (xy1.x > 0) {
            return 0;
        } else {
            return Math.abs(mapx * xscale);
        }
    })();
    var ycrop = (function () {
        if (xy1.y > 0) {
            return 0;
        } else {
            return Math.abs(mapy * yscale);
        }
    })();
    var widthcrop = (function () {
        if (xy2.x < canvas.width) {
            return originalwidth;
        } else {
            return (scaledwidth - (xy2.x - canvas.width)) * xscale;
        }
    })();
    var heightcrop = (function () {
        if (xy2.y < canvas.height) {
            return originalheight;
        } else {
            return (scaledheight - (xy2.y - canvas.height)) * yscale;
        }
    })();
    mapx = (xcrop != 0) ? 0 : mapx;
    mapy = (ycrop != 0) ? 0 : mapy;
    scaledwidth = scaledwidth - (scaledwidth - (widthcrop / xscale));
    scaledheight = scaledheight - (scaledheight - (heightcrop / yscale));
    ctx.drawImage(this.magimg, xcrop, ycrop, widthcrop, heightcrop, mapx, mapy, scaledwidth, scaledheight);
    if (this.datatype == 'uv') {
        this.ctxwind.drawImage(this.imgobj, xcrop, ycrop, widthcrop, heightcrop, mapx, mapy, scaledwidth, scaledheight);
    }
    if (this.datatype == 'raster') {
        this.ctxraster.drawImage(this.magimg, xcrop, ycrop, widthcrop, heightcrop, mapx, mapy, scaledwidth, scaledheight);
    }
};

var clearimage = function () {
    var canvas = document.getElementById(this.canvas);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.datatype ==='uv') {
        this.ctxwind.clearRect(0, 0, canvas.width, canvas.height);
    }

};

var startanimate = function () {
    var layer = this;
    var width = this.dim.width;
    var height = this.dim.height;
    var min = this.min;
    var max = this.max;
    var ctxanim = this.ctxanim;
    this.partArr = new Array(this.animdensity * 3).fill(0);
    var partArr = this.partArr;
    ctxanim.strokeStyle = "rgba(255,255,255,0.5)";
    ctxanim.fillStyle = "rgba(150,150,150,1)";
    ctxanim.fillRect(0, 0, width, height);
    ctxanim.lineWidth = 2.3;
    layer.resetanim();
    function protate(xaxis, yaxis, rad, xrotate, yrotate) {
        var x = xaxis - xrotate;
        var y = yaxis - yrotate;
        var xnew = (x * Math.cos(rad)) + (-y * Math.sin(rad)) + xrotate;
        var ynew = (x * Math.sin(rad)) + (y * Math.cos(rad)) + yrotate;
        return {'x': xnew, 'y': ynew}
    }

    function doanimate() {
        ctxanim.fillStyle = "rgba(70,70,70,0.005)";
        ctxanim.fillRect(0, 0, width, height);
        for (var i = 0; i < partArr.length; i = i + 3) {
            if (partArr[i + 2] == 0) {
                partArr[i] = Math.floor(Math.random() * (width));
                partArr[i + 1] = Math.floor(Math.random() * (height));
                partArr[i + 2] = Math.floor(Math.random() * (100)) + 100;
            }
            var curx = partArr[i];
            var cury = partArr[i + 1];
            var pos = Math.floor(width * Math.floor(cury)) + Math.floor(curx);
            var lastrad = layer.rad[pos];
            if (lastrad == -99) {
                partArr[i + 2] = 0;
                continue;
            }
            var lastmag = layer.mag[pos];
            var magscale = 0.1 + (((lastmag - min) / (max - min)));
            var newpos = protate(curx, cury - magscale, lastrad, curx, cury);
            ctxanim.beginPath();
            ctxanim.moveTo(curx, cury);
            ctxanim.lineTo(newpos.x, newpos.y);
            ctxanim.stroke();
            partArr[i] = newpos.x;
            partArr[i + 1] = newpos.y;
            partArr[i + 2] = partArr[i + 2] - 1;
        }
        layer.isPlay = setTimeout(function () {
            doanimate();
        }, 10)
    }

    doanimate();
};

var stopanimate = function () {
    clearTimeout(this.isPlay);
};

var resetanim = function () {
    this.partArr.fill(0);
    var width = this.dim.width;
    var height = this.dim.height;
    var curzoom = this.ctxwind.getImageData(0, 0, width, height).data;
    var mag = new Array(height * width);
    var rad = new Array(height * width);
    var layer = this;
    var r, g, a, u, v;
    for (var x = 3; x < curzoom.length; x = x + 4) {
        r = curzoom[x - 3];
        g = curzoom[x - 2];
        a = curzoom[x];
        if (a == 0) {
            mag[(x + 1) / 4] = -99;
            rad[(x + 1) / 4] = -99;
        } else {
            u = layer.uvr.minU + r / 255 * (layer.uvr.maxU - layer.uvr.minU);
            v = layer.uvr.minV + g / 255 * (layer.uvr.maxV - layer.uvr.minV);
            mag[(x + 1) / 4] = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
            rad[(x + 1) / 4] = Math.atan2(u, v);
        }
    }
    this.mag = mag;
    this.rad = rad;
};

var convolute = function (pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    var w = sw;
    var h = sh;
    var output = Filters.createImageData(w, h);
    var dst = output.data;
    var alphaFac = opaque ? 1 : 0;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var sy = y;
            var sx = x;
            var dstOff = (y * w + x) * 4;
            var r = 0, g = 0, b = 0, a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = sy + cy - halfSide;
                    var scx = sx + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        var srcOff = (scy * sw + scx) * 4;
                        var wt = weights[cy * side + cx];
                        r += src[srcOff] * wt;
                        g += src[srcOff + 1] * wt;
                        b += src[srcOff + 2] * wt;
                        a += src[srcOff + 3] * wt;
                    }
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    return output;
};