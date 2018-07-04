function Clayer(map,option) {
    var layer = this;
    layer.map = map;
    layer.container = $('#'+map._container.id);
    layer.imageSrc = option.src;
    layer.max = option.max;
    layer.min = option.min;
    layer.decodedImg = '';
    layer.imInfo = {};
    layer.palette = option.palette;
    layer.paletteGrad = [];
    if (option.type)
        layer.type = option.type;
    if (layer.type === 'R') {
        layer.arrayMag = [];
    } else if (layer.type === 'UV') {
        layer.arrayMag = [];
        layer.arrayRad = [];
    } else if (layer.type === 'DIR') {
        layer.arrayMag = [];
        layer.arrayRad = [];
    }
}

Clayer.prototype = {
    addLayer: function () {
        var layer = this;
        this._decode(function () {
            var c = document.createElement("canvas");
            c.width = layer.container.width;
            c.height = layer.container.height;
            layer.container.appendChild(c);
            var cx = c.getContext("2d");
            cx.drawImage(layer.decodedImg, 0, 0, this.width, this.height);
            layer.map.on("move moveend",function () {
                layer._reposition();
            });
            layer.map.on("click",function () {
                console.log("poin value");
            });
        })
    },


    removeLayer: function () {

    },


    playAnimate: function () {

    },


    pauseAnimate: function () {

    },


    stopAnimate: function () {

    },

    _reposition: function () {

    },

    _decode: function (callBack) {
        var layer = this;
        var im = new Image;
        var c = document.createElement('canvas');
        im.src = this.imageSrc;
        im.onload = function () {
            layer.width = this.width;
            layer.height = this.height;
            c.setAttribute('width', layer.width);
            c.setAttribute('height', layer.height);
            var cx = c.getContext("2d");
            cx.drawImage(this, 0, 0, this.width, this.height);
            var i = cx.getImageData(0, 0, this.width, this.height);
            var imData = i.data;
            layer.imInfo = layer._getProp(imData);
            layer.paletteGrad = this._getPalette(this.palette);
            layer.arrayMag = new Array(this.width * this.height);
            layer.arrayRad = new Array(this.width * this.height);
            if (layer.type === "R")
                imData = this._decodeR(imData);
            if (layer.type === "UV")
                imData = this._decodeUV(imData);
            if (layer.type === "DIR")
                imData = this._decodeDIR(imData);
            layer.decodedImg = c.toDataURL();
            if (callBack) callBack();
        }
    },

    _decodeR: function (imData) {
        var red, green, blue, magVal, magv, ratio, colpos, col;
        for (var x = 0; x < imData.length; x++) {
            if ((x + 1) % 4 === 0) {
                red = byteString(imData[x - 3]);
                green = byteString(imData[x - 2]);
                blue = byteString(imData[x - 1]);
                magv = parseInt(red + green + blue, 2);
                magVal = min + (magv / 16777200 * (max - min));
                this.arrayMag[((x + 1) / 4) - 1] = magVal;
                // Image pixel color normalize
                ratio = (magVal - this.min) / (this.max - this.min);
                col = Math.floor(256 * ratio) + 1;
                if (col > 256)
                    col = 256;
                if (col < 0)
                    col = 0;
                colpos = col * 4;
                imData[x - 3] = this.paletteGrad[colpos];
                imData[x - 2] = this.paletteGrad[colpos + 1];
                imData[x - 1] = this.paletteGrad[colpos + 2];
            }
        }
        return imData;
    },

    _decodeUV: function (imData) {
        var red, green, alpha, U, V, magVal, radVal, magratio, colratio, magcolpos;
        for (var x = 3; x < imData.length; x = x + 4) {
            red = imData[x - 3];
            green = imData[x - 2];
            alpha = imData[x];
            if (alpha === 0) {
                this.arrayMag[((x + 1) / 4) - 1] = -99;
                this.arrayRad[((x + 1) / 4) - 1] = -99;
            } else {
                U = this.imInfo.minU + (red / 255 * (this.imInfo.maxU - this.imInfo.minU));
                V = this.imInfo.minV + (green / 255 * (this.imInfo.maxV - this.imInfo.minV));
                magVal = Math.sqrt(Math.pow(U, 2) + Math.pow(V, 2));
                radVal = Math.atan2(U, V);
                this.arrayMag[((x + 1) / 4) - 1] = magVal;
                this.arrayRad[((x + 1) / 4) - 1] = radVal;
                magratio = (magVal - this.min) / (this.max - this.min);
                colratio = Math.floor(256 * magratio) + 1;
                if (colratio > 256)
                    colratio = 256;
                if (colratio < 0)
                    colratio = 0;
                magcolpos = colratio * 4;
                imData[x - 3] = this.paletteGrad[magcolpos];
                imData[x - 2] = this.paletteGrad[magcolpos + 1];
                imData[x - 1] = this.paletteGrad[magcolpos + 2];
            }
        }
        return imData
    },

    // TODO : next feature for wave data from wavewatch3
    _decodeDIR: function (imData) {
        return imData;
    },

    _getProp: function (imData) {
        var properties = {};
        var imInfo = '';
        for (var x = 0; x < imData.length; x++) {
            if ((x + 1) % 4 === 0) {
                if (imData[x] === 0)
                    break;
                continue;
            }
            if (String.fromCharCode(imData[x]) === 'x')
                break;
            imInfo = imInfo + String.fromCharCode(imData[x]);
        }
        var infos = imInfo.split("|");
        if (this.type)
            this.type = infos[0];
        if (this.type === "UV") {
            properties = {
                minU: parseFloat(infos[1]),
                maxU: parseFloat(infos[2]),
                minV: parseFloat(infos[3]),
                maxV: parseFloat(infos[4]),
                top: parseFloat(infos[5]),
                bottom: parseFloat(infos[6]),
                left: parseFloat(infos[7]),
                right: parseFloat(infos[8])
            };
        } else if (this.type === "R") {
            properties = {
                minR: parseFloat(infos[1]),
                maxR: parseFloat(infos[2]),
                top: parseFloat(infos[3]),
                bottom: parseFloat(infos[4]),
                left: parseFloat(infos[5]),
                right: parseFloat(infos[6])
            }
        }
        return properties
    },


    _getPalette: function (pal) {
        var pals = {
            "gas": {
                "colors": ["#052A2B", "#FBF9D8", "#E68D70", "#9B0080", "#190A54", "#150778"],
                "colorsstop": [0, 0.2, 0.4, 0.6, 0.8, 1]
            },
            "temp": {
                "colors": ["#512728", "#BC2A97", "#44D2D5", "#F6FA3A", "#DD4428", "#5B1C42", "#0a0d70"],
                "colorsstop": [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1]
            },
            "rainbow": {
                "colors": ["#0000D4", "#04d0d3", "#01ba04", "#cece00", "#DD0000", "#4B0086", "#260193"],
                "colorsstop": [0, 0.2, 0.25, 0.35, 0.8, 0.9, 1]
            },
            "cloud": {
                "colors": ["#ff5800", "#ff5800", "#222", "#fff"],
                "colorsstop": [0, 0.35, 0.35, 1]
            }
        };
        var col = pals[pal];
        var c = document.createElement("canvas");
        c.setAttribute("width", 256);
        c.setAttribute("height", 1);
        var cx = c.getContext("2d");
        cx.lineWidth = 10;
        var grad = cx.createLinearGradient(0, 0, 256, 1);
        for (var x = 0; x < col.colors.length; x++) {
            grad.addColorStop(col.colorsstop[x], col.colors[x]);
        }
        cx.strokeStyle = grad;
        cx.beginPath();
        cx.moveTo(0, 0);
        cx.lineTo(256, 0);
        cx.stroke();
        return cx.getImageData(0, 0, c.width, c.height).data;
    }


};
