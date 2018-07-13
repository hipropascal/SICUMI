var rasterObj = {};
var map1, map2, fps;
var route = [];
var particles = 5000;
var partArr = new Array(particles * 3).fill(0);
var socket = io('');
var hourPred = 0;
var playLoad, moveFps, shipMark;
var surabaya_balikpapan = [
[-7.19662, 112.73243],
[-7.17868, 112.70716],
[-7.15313, 112.67866],
[-7.10680, 112.67008],
[-7.03389, 112.66321],
[-6.92416, 112.67935],
[-6.82851, 112.68896],
[-6.37514, 112.89495],
[-5.66497, 113.42230],
[-4.95393, 114.20233],
[-4.52753, 115.01472],
[-4.40704, 115.92658],
[-3.78242, 117.05817],
[-2.59606, 117.28804],
[-1.97583, 117.12324],
[-1.34953, 116.82885],
[-1.28466, 116.79898],
[-1.27385, 116.80500]
];
function loadMap() {
    var mappos = (function () {
        var mapCookies = Cookies.getJSON("map");
        if (mapCookies === undefined) {
            return {zoom: 5, latlng: [-1.537901, 118.081055]};
        } else {
            return mapCookies;
        }
    })();
    map1 = L.map('map-basemap', {zoomControl: false}).setView(mappos.latlng, mappos.zoom);
    map2 = L.map('map-coastline', {zoomControl: false, transparent: true}).setView(mappos.latlng, mappos.zoom);
    map1.sync(map2);
    map2.sync(map1);
    var port1 = L.icon({
        iconUrl: 'static/image/port1.png',
        iconSize: [45, 45],
        iconAnchor: [23, 45]
    });
    var port2 = L.icon({
        iconUrl: 'static/image/port3.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });
    L.polyline(surabaya_balikpapan, {color: 'white', opacity: 0.5, className: 'route'}).addTo(map2);
    L.marker([-5.113580, 119.409920], {icon: port1}).addTo(map2); // Makasar
    L.marker([-7.197852, 112.732807], {icon: port1}).addTo(map2); // Tanjung Perak
    L.marker([-6.104451, 106.882852], {icon: port1}).addTo(map2); // Tanjung Priok
    L.marker([3.791883, 98.710768], {icon: port1}).addTo(map2); // Belawan
    L.marker([1.173261, 104.047114], {icon: port1}).addTo(map2); // Batam
    L.marker([-0.889327, 131.268368], {icon: port1}).addTo(map2); // Sorong
    L.marker([1.440847, 125.199943], {icon: port2}).addTo(map2); // Bitung
    L.marker([5.584861, 95.313504], {icon: port2}).addTo(map2); // Banda Aceh
    L.marker([1.688455, 101.458264], {icon: port2}).addTo(map2); // Dumai
    L.marker([3.361990, 99.454057], {icon: port2}).addTo(map2); // Kuala Tanjung
    L.marker([-2.086455, 106.145216], {icon: port2}).addTo(map2); // Pangkal Pinang
    L.marker([-5.469174, 105.318098], {icon: port2}).addTo(map2); // Panjang
    L.marker([-7.757270, 109.023392], {icon: port2}).addTo(map2); // Cilacap
    L.marker([-8.729688, 116.075981], {icon: port2}).addTo(map2); // Lombok
    L.marker([1.335954, 103.551771], {icon: port2}).addTo(map2); // Kupang
    L.marker([-0.012230, 109.331851], {icon: port2}).addTo(map2); // Pontianak
    L.marker([-2.204743, 113.929690], {icon: port2}).addTo(map2); // Palangkaraya
    L.marker([-3.331362, 114.554938], {icon: port2}).addTo(map2); // Banjarmasin
    L.marker([0.920182, 117.986809], {icon: port2}).addTo(map2); // Maloy
    L.marker([1.057203, 127.469752], {icon: port2}).addTo(map2); // Halmahera
    L.marker([-2.542838, 140.713431], {icon: port2}).addTo(map2); // Jayapura
    L.marker([-8.477677, 140.389937], {icon: port2}).addTo(map2); // Merauke
    L.marker([-3.693465, 128.176196], {icon: port2}).addTo(map2); // Merauke
    L.marker([-1.27385,116.80500], {icon: port2}).addTo(map2); // Balikpapan
    var myCustomStyle = {
        stroke: true,
        weight: 1,
        fill: true,
        color: '#353535',
        fillColor: '#909090',
        fillOpacity: 1
    };
    $.getJSON('static/geojson/indo.geo.json', function (data) {
        L.geoJSON(data, {
            style: myCustomStyle
        }).bindPopup(function (layer) {
            return layer.feature.properties.description;
        }).addTo(map2);
    });
    // timerActive();
    socketActive();
}

function loadMapEvent() {
    map1.on("moveend", function (ev) {
        var mappos = {};
        var center = map1.getCenter();
        mappos.latlng = [center.lat, center.lng];
        mappos.zoom = map1.getZoom();
        Cookies.set("map", mappos);
    });
}

function setParamCookies() {
    setTimeout(function () {
        var valObj = {};
        var namObj = {};
        var paramObj = {};
        $("input.param").each(function () {
            namObj = $(this).attr("name");
            valObj = $(this).attr("value");
            paramObj[namObj] = {};
            paramObj[namObj] = valObj;
        });
        $("div.param").each(function () {
            namObj = $(this).attr("id");
            valObj = $(this).attr("value");
            paramObj[namObj] = {};
            paramObj[namObj] = valObj;
        });
        Cookies.set("params", paramObj);
    }, 100);
}

function setRaster() {
    var image, imload;
    var predActive = $(".active-true.prediction");
    if (predActive.length > 0) {
        var group = predActive.attr("group");
        var id = predActive.attr("id").replace("p-", "");
        var time = hourPred;
        if (time === "true") {
            time = $("." + group + "-time").children().next().val();
        }
        if (id === "wind") {
            imload = "/raster/weather/" + group + "_" + id + "_" + time + ".png";
            image = new Image;
            image.src = imload;
            image.onload = function () {
                rasterObj = decodeImage(image, "rainbow", [0, 25]);
                killAnimate();
                playLoad = setTimeout(function () {
                    doAnimate(rasterObj, 'slim');
                }, 1); // send to async
                setTimeout(function () {
                    doRaster();
                }, 1); // send to async
            };
        } else if (id === "rain") {
            imload = "/raster/weather/" + group + "_" + id + "_" + time + ".png";
            image = new Image;
            image.src = imload;
            image.onload = function () {
                killAnimate();
                rasterObj = decodeImage(image, "rainbow", [0, 40]);
                setTimeout(function () {
                    doRaster();
                }, 1); // send to async
            };
        } else if (id === "current") {
            imload = "/raster/weather/" + group + "_" + id + "_" + time + ".png";
            image = new Image;
            image.src = imload;
            image.onload = function () {
                killAnimate();
                rasterObj = decodeImage(image, "rainbow", [0, 150]);
                playLoad = setTimeout(function () {
                    doAnimate(rasterObj, 'slim');
                }, 1); // send to async
                setTimeout(function () {
                    doRaster();
                }, 1); // send to async
            }
        } else if (id === "wave") {
            imload = "/raster/weather/" + group + "_" + id + "_" + time + ".png";
            image = new Image;
            image.src = imload;
            image.onload = function () {
                killAnimate();
                rasterObj = decodeImage(image, "rainbow", [0, 5]);
                playLoad = setTimeout(function () {
                    doAnimate(rasterObj, 'bulk');
                }, 1000); // send to async
                setTimeout(function () {
                    doRaster();
                }, 1); // send to async
            }
        }
    }
}

function setupAnimLayer() {
    var canvas = document.getElementById("cvs-data");
    var ctx = canvas.getContext("2d");
    partArr.fill(0);
    var width = canvas.width;
    var height = canvas.height;
    var curzoom = ctx.getImageData(0, 0, width, height).data;
    var mag = new Array(height * width);
    var rad = new Array(height * width);
    var r, g, a, u, v;
    for (var x = 3; x < curzoom.length; x = x + 4) {
        r = curzoom[x - 3];
        g = curzoom[x - 2];
        a = curzoom[x];
        if (a === 0) {
            mag[(x + 1) / 4] = -99;
            rad[(x + 1) / 4] = -99;
        } else {
            u = rasterObj.minU + r / 255 * (rasterObj.maxU - rasterObj.minU);
            v = rasterObj.minV + g / 255 * (rasterObj.maxV - rasterObj.minV);
            mag[(x + 1) / 4] = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
            rad[(x + 1) / 4] = Math.atan2(u, v);
        }
    }
    rasterObj.magArray = mag;
    rasterObj.radArray = rad;
}

function decodeImage(img, color, minmax) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', img.width);
    canvas.setAttribute('height', img.height);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var im = ctx.getImageData(0, 0, img.width, img.height);
    var imgData = im.data;
    var imInfo = '';
    for (var x = 0; x < imgData.length; x++) {
        if ((x + 1) % 4 == 0) {
            if (imgData[x] == 0)
                break;
            continue;
        }
        if (String.fromCharCode(imgData[x]) == 'x')
            break;
        imInfo = imInfo + String.fromCharCode(imgData[x]);
    }
    var infos = imInfo.split("|");
    var datatype = infos[0];
    var top, bottom, left, right;
    if (datatype === "UV") {
        var minU = parseFloat(infos[1]);
        var maxU = parseFloat(infos[2]);
        var minV = parseFloat(infos[3]);
        var maxV = parseFloat(infos[4]);
        top = parseFloat(infos[5]);
        bottom = parseFloat(infos[6]);
        left = parseFloat(infos[7]);
        right = parseFloat(infos[8]);
    } else {
        var min = parseFloat(infos[1]);
        var max = parseFloat(infos[2]);
        top = parseFloat(infos[3]);
        bottom = parseFloat(infos[4]);
        left = parseFloat(infos[5]);
        right = parseFloat(infos[6]);
    }
    var colorBar = getColorBar(color);
    var magArr = [];
    var radArr = [];
    var red, green, blue, alpha, U, V, magVal, magv, radVal;
    if (datatype === "UV") {
        for (x = 3; x < imgData.length; x = x + 4) {
            red = imgData[x - 3];
            green = imgData[x - 2];
            alpha = imgData[x];
            if (alpha === 0) {
                magArr[((x + 1) / 4) - 1] = -99;
                radArr[((x + 1) / 4) - 1] = -99;
            } else {
                U = minU + (red / 255 * (maxU - minU));
                V = minV + (green / 255 * (maxV - minV));
                magVal = Math.sqrt(Math.pow(U, 2) + Math.pow(V, 2));
                radVal = Math.atan2(U, V);
                magArr[((x + 1) / 4) - 1] = magVal;
                radArr[((x + 1) / 4) - 1] = radVal;
                // Image pixel color normalize
                var magratio = (magVal - minmax[0]) / (minmax[1] - minmax[0]);
                var colratio = Math.floor(256 * magratio) + 1;
                if (colratio > 256)
                    colratio = 256;
                if (colratio < 0)
                    colratio = 0;
                var magcolpos = colratio * 4;
                imgData[x - 3] = colorBar[magcolpos];
                imgData[x - 2] = colorBar[magcolpos + 1];
                imgData[x - 1] = colorBar[magcolpos + 2];
            }
        }
    } else { // RASTER
        for (x = 0; x < imgData.length; x++) {
            if ((x + 1) % 4 === 0) {
                red = byteString(imgData[x - 3]);
                green = byteString(imgData[x - 2]);
                blue = byteString(imgData[x - 1]);
                magv = parseInt(red + green + blue, 2);
                magVal = min + (magv / 16777200 * (max - min));
                magArr[((x + 1) / 4) - 1] = magVal;
                // Image pixel color normalize
                var ratio = (magVal - minmax[0]) / (minmax[1] - minmax[0]);
                var col = Math.floor(256 * ratio) + 1;
                if (col > 256)
                    col = 256;
                if (col < 0)
                    col = 0;
                var colpos = col * 4;
                imgData[x - 3] = colorBar[colpos];
                imgData[x - 2] = colorBar[colpos + 1];
                imgData[x - 1] = colorBar[colpos + 2];
            }
        }
    }
    $(".legend-value-1").html(minmax[0]);
    $(".legend-value-2").html((minmax[0] + minmax[1]) / 2);
    $(".legend-value-3").html(minmax[1]);
    ctx.putImageData(im, 0, 0);
    var strPng = canvas.toDataURL();
    var decodedImage = new Image;
    decodedImage.src = strPng;
    return {
        origin: img,
        decodedImage: decodedImage,
        type: datatype,
        magArray: [],
        radArray: [],
        min: minmax[0],
        max: minmax[1],
        minVal: min,
        maxVal: max,
        minU: minU,
        maxU: maxU,
        minV: minV,
        maxV: maxV,
        width: img.width,
        height: img.height,
        bounding: {
            top: top,
            bottom: bottom,
            left: left,
            right: right
        }
    };
}

function getColorBar(color) {
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
    var xcol = pals[color];
    var cvs = document.createElement("canvas");
    cvs.setAttribute("width", 256);
    cvs.setAttribute("height", 1);
    var ctx = cvs.getContext("2d");
    ctx.lineWidth = 10;
    var grad = ctx.createLinearGradient(0, 0, 256, 1);
    for (var x = 0; x < xcol.colors.length; x++) {
        grad.addColorStop(xcol.colorsstop[x], xcol.colors[x]);
    }
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(256, 0);
    ctx.stroke();
    var colorBar = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
    $(".legend").attr("src", cvs.toDataURL());
    return (colorBar);
}

function doRaster() {
    var rasterMap = document.getElementById("map-raster");
    var canvas = document.getElementById("cvs-raster");
    var canvasUV = document.getElementById("cvs-data");
    canvas.setAttribute("height", rasterMap.clientHeight);
    canvas.setAttribute("width", rasterMap.clientWidth);
    canvasUV.setAttribute("height", rasterMap.clientHeight);
    canvasUV.setAttribute("width", rasterMap.clientWidth);
    var ctx = canvas.getContext("2d");
    var ctxUV = canvasUV.getContext("2d");
    var xy1 = map2.latLngToContainerPoint([rasterObj.bounding.top, rasterObj.bounding.left]);
    var xy2 = map2.latLngToContainerPoint([rasterObj.bounding.bottom, rasterObj.bounding.right]);
    var mapx = xy1.x;
    var mapy = xy1.y;
    var scaledwidth = xy2.x - xy1.x;
    var originalwidth = rasterObj.width;
    var xscale = originalwidth / scaledwidth;
    var scaledheight = Math.abs(xy1.y - xy2.y);
    var originalheight = rasterObj.height;
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
    mapx = (xcrop !== 0) ? 0 : mapx;
    mapy = (ycrop !== 0) ? 0 : mapy;
    scaledwidth = scaledwidth - (scaledwidth - (widthcrop / xscale));
    scaledheight = scaledheight - (scaledheight - (heightcrop / yscale));
    ctx.drawImage(rasterObj.decodedImage, xcrop, ycrop, widthcrop, heightcrop, mapx, mapy, scaledwidth, scaledheight);
    if (rasterObj.type === "UV") {
        moveFps = setTimeout(function () {
            ctxUV.drawImage(rasterObj.origin, xcrop, ycrop, widthcrop, heightcrop, mapx, mapy, scaledwidth, scaledheight);
            setupAnimLayer();
        }, 500);
    }
}

function doAnimate(rasterObj, type) {
    var rasterMap = document.getElementById("map-animate");
    var canvas = document.getElementById("cvs-animate");
    canvas.setAttribute("height", rasterMap.clientHeight);
    canvas.setAttribute("width", rasterMap.clientWidth);
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.fillStyle = "rgba(150,150,150,1)";
    ctx.fillRect(0, 0, rasterMap.clientWidth, rasterMap.clientHeight);
    ctx.lineWidth = 2;
    startAnimate(ctx, canvas, type);
}

function protate(xaxis, yaxis, rad, xrotate, yrotate) {
    var x = xaxis - xrotate;
    var y = yaxis - yrotate;
    var xnew = (x * Math.cos(rad)) + (-y * Math.sin(rad)) + xrotate;
    var ynew = (x * Math.sin(rad)) + (y * Math.cos(rad)) + yrotate;
    return {'x': xnew, 'y': ynew}
}

function startAnimate(ctx, canvas, type) {
    try {
        clearTimeout(fps)
    } catch (e) {
    }
    ctx.fillStyle = "rgba(70,70,70,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (type === "bulk") {
        ctx.lineWidth = 10;
    } else {
        ctx.lineWidth = 2;
    }
    for (var i = 0; i < partArr.length; i = i + 3) {
        if (partArr[i + 2] === 0) {
            partArr[i] = Math.floor(Math.random() * (canvas.width));
            partArr[i + 1] = Math.floor(Math.random() * (canvas.height));
            partArr[i + 2] = Math.floor(Math.random() * (100)) + 100;
            if (type === "bulk")
                partArr[i + 2] = 10;
        }
        var curx = partArr[i];
        var cury = partArr[i + 1];
        var pos = Math.floor(canvas.width * Math.floor(cury)) + Math.floor(curx);
        var lastrad = rasterObj.radArray[pos];
        if (lastrad === -99) {
            partArr[i + 2] = 0;
            continue;
        }
        var lastmag = rasterObj.magArray[pos];
        var magscale = 0.1 + (((lastmag - rasterObj.min) / (rasterObj.max - rasterObj.min)));
        if (type === "bulk") {
            magscale = 0.6;
        }
        var newpos = protate(curx, cury - magscale, lastrad, curx, cury);
        ctx.beginPath();
        ctx.moveTo(curx, cury);
        ctx.lineTo(newpos.x, newpos.y);
        ctx.stroke();
        partArr[i] = newpos.x;
        partArr[i + 1] = newpos.y;
        partArr[i + 2] = partArr[i + 2] - 1;
    }
    if (type === "bulk") {
        fps = setTimeout(function () {
            startAnimate(ctx, canvas, type)
        }, 100)
    } else {
        fps = setTimeout(function () {
            startAnimate(ctx, canvas, type)
        }, 10)
    }

}

function killAnimate() {
    var rasterMap = document.getElementById("map-animate");
    var canvas = document.getElementById("cvs-animate");
    canvas.setAttribute("height", rasterMap.clientHeight);
    canvas.setAttribute("width", rasterMap.clientWidth);
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.fillStyle = "rgba(150,150,150,1)";
    ctx.fillRect(0, 0, rasterMap.clientWidth, rasterMap.clientHeight);
    try {
        clearTimeout(playLoad);
        partArr.fill(0);
    } catch (e) {
    }
}

function setParamUI() {
    var paramObj = Cookies.getJSON("params");
    if (paramObj === undefined) {
        setParamCookies();
        setTimeout(function () {
            setParamUI();
        }, 200);
        return true;
    }
    for (var id in paramObj) {
        var val = paramObj[id];
        var element = $("#" + id);
        if (element[0].tagName === "DIV") {
            if (val === "true") {
                if (element.hasClass("prediction")) {
                    element.attr("group");
                    $(".pred-add-hour").hide();
                    $("." + element.attr("group") + "-time").show();
                } else if (element.hasClass("raster")) {
                    $(".pred-add-hour").hide();
                }
                element.attr("value", "true");
                element.switchClass("active-false", "active-true", 100);
            } else {
                element.attr("value", "false");
                element.switchClass("active-true", "active-false", 100);
            }
        }
        if (element[0].tagName === "INPUT") {
            if (element[0].type === "checkbox") {
                if (val === "true") {
                    element.prop("checked", true);
                    element.attr("value", "true");
                } else {
                    element.prop("checked", false);
                    element.attr("value", "false");
                }
            }
        }
    }
    setTimeout(function () {
        setLegend();
        setRaster();
    }, 300);
    loadTimeRaster()
}

function loadTimeRaster() {
    $.getJSON('/raster/weather/hour', function (times) {
        var dattime, now, diff;
        times.wrf.forEach(function (val, i) {
                dattime = new Date(val);
                now = new Date();
                diff = (dattime - now) / 36e5;
                $(".wrf-time").append('<option class="wrf-option" value="' + i + '">' + dateIndonesia(dattime) + '</option>')
            }
        );
    })
}


function loadUIEvent() {
    $(".param").on("click", function () {
        setParamCookies();
    });
    $(".ship").on('click', function () {
        if ($(this).attr("value") === "false") {
            $(this).attr("value", "true");
        } else {
            $(this).attr("value", "false");
        }
    });
    $(".raster").on('click', function () {
        $(".raster").not(this).each(function () {
                if ($(this).hasClass("active-true")) {
                    $(this).switchClass("active-true", "active-false", 100);
                    $(this).attr("value", "false");
                }
            }
        );
        if ($(this).hasClass("active-false")) {
            $(this).switchClass("active-false", "active-true", 100);
            $(this).attr("value", "true");
            setTimeout(function () {
                setRaster();
                setLegend();
            }, 300);
        }
        if ($(this).hasClass("prediction")) {
            $(".pred-add-hour").hide();
            $("." + $(this).attr("group") + "-time").show();
        } else {
            $(".pred-add-hour").hide();
        }
    });
    $(".aws").on('click', function () {
        $(".aws").not(this).each(function () {
                if ($(this).hasClass("active-true")) {
                    $(this).switchClass("active-true", "active-false", 100);
                    $(this).attr("value", "false");
                }
            }
        );
        if ($(this).hasClass("active-false")) {
            $(this).switchClass("active-false", "active-true", 100);
            $(this).attr("value", "true");
        }
    });
    $("#marker-legend").draggable({handle: '.drag'});
    $("#marker-legend2").draggable({handle: '.drag'});
    $("#marker-legend3").draggable({handle: '.drag'});
    $("#info-legend").draggable({handle: '.drag'});
    map2.on('moveend move', function (e) {
        try {
            clearTimeout(moveFps)
        } catch (e) {
        }
        doRaster();
    });
    $(".pred-add-hour").change(function () {
            setTimeout(function () {
                setRaster();
            }, 100)
        }
    );
}

function setLegend() {
    var el = $(".raster.active-true");
    var title = el.attr("title");
    var unit = el.attr("unit");
    $('.raster-title').html(title);
    $('.raster-unit').html(unit);
    $('.cur-time').html(currentDateID(new Date()));
}

function timerActive() {
    $.getJSON('/timeserver', function (data) {
        var hour = data.hour;
        var min = data.minute;
        var sec = data.second;
        timerStart(hour, min, sec);
    })

}

function timerStart(hour, min, sec) {
    setTimeout(function () {
        sec++;
        if (sec === 60) {
            sec = 0;
            min++;
            if (min === 60) {
                min = 0;
                hour++;
                if (hour === 24) {
                    hour = 0;
                }
            }
        }
        $('#timer_utc').html(twoDig(hour) + ':' + twoDig(min) + ':' + twoDig(sec) + ' UTC');
        var wib = ((hour + 7) >= 24 ? hour + 7 - 24 : hour + 7);
        var wita = ((hour + 9) >= 24 ? hour + 7 - 24 : hour + 8);
        var wit = ((hour + 8) >= 24 ? hour + 7 - 24 : hour + 9);
        $('#timer_wib').html(twoDig(wib) + ':' + twoDig(min) + ':' + twoDig(sec) + ' WIB');
        $('#timer_wita').html(twoDig(wita) + ':' + twoDig(min) + ':' + twoDig(sec) + ' WITA');
        $('#timer_wit').html(twoDig(wit) + ':' + twoDig(min) + ':' + twoDig(sec) + ' WIT');
        timerStart(hour, min, sec);
    }, 10);
}

function currentDateID(date) {
    var timezoneOffset = date.getTimezoneOffset();
    var hour = date.getHours();
    var minute = date.getMinutes();
    // return hour + ":00 Zona Waktu : GMT+" + Math.abs(timezoneOffset / 60);
    return ''
}


function ship() {
    var marker
}

function shipMarker(lat, lon, dir) {
    var shipM = L.divIcon({
        html: '<div id="main-ship" style="margin-top:-10px;margin-left:-10px;width: 40px; height: 40px;-ms-transform: rotate(' + dir + 'deg)'
        + ';-webkit-transform: rotate(' + dir + 'deg)'
        + ';transform: rotate(' + dir + 'deg);"><img src="static/image/ship/other.svg" alt="" width="40">' +
        '<div class="ship-dir"></div>' +
        '</div>'
    });
    try {
        shipMark.remove();
        shipMark = L.marker([lat, lon], {icon: shipM}).addTo(map2);
        return true
    } catch (e) {
        shipMark = L.marker([lat, lon], {icon: shipM}).addTo(map2);
    }
}

function socketActive() {
    focusing2ship();
    socket.on('test', function (data) {
        console.log(data);
        var pos = data.position;
        var dir = data.direction;
        shipMarker(pos[0], pos[1], dir);
        shipInfos(data);
        shipTimes(data.timestamp);
        shipWeather(data);
    });
}

function shipTimes(time) {
    var hour = time[0];
    var min = time[1];
    var sec = time[2];
    $('#timer_utc').html(twoDig(hour) + ':' + twoDig(min) + ':' + twoDig(sec) + ' UTC');
    var wib = ((hour + 7) >= 24 ? hour + 7 - 24 : hour + 7);
    var wita = ((hour + 9) >= 24 ? hour + 7 - 24 : hour + 8);
    var wit = ((hour + 8) >= 24 ? hour + 7 - 24 : hour + 9);
    $('#timer_wib').html(twoDig(wib) + ':' + twoDig(min) + ':' + twoDig(sec) + ' WIB');
    $('#timer_wita').html(twoDig(wita) + ':' + twoDig(min) + ':' + twoDig(sec) + ' WITA');
    $('#timer_wit').html(twoDig(wit) + ':' + twoDig(min) + ':' + twoDig(sec) + ' WIT');
    if (hour !== hourPred) {
        setRaster();
        hourPred = hour;
    }
}

function shipInfos(data) {
    var lat = data.position[0];
    var lng = data.position[1];
    var dms = convertDMS(lat, lng);
    $('.ship-info-dms').html(dms[0]+' '+dms[1]);
    $('.ship-info-dms-lat').html(dms[0]);
    $('.ship-info-dms-lng').html(dms[1]);
    $('#ship-info-dec').html(lat + ',' + lng);
    $('#ship-info-speeddir').html(Math.round(data.speed) + ' Knot  ' + Math.round(data.direction) + '°');
    $('.ship-info-speed-deg').html(Math.round(data.speed) + ' Knot  ' + Math.round(data.direction) + '°');
}

function convertDMS(lat, lng) {
    var latitude = toDegreesMinutesAndSeconds(lat);
    var latitudeCardinal = Math.sign(lat) >= 0 ? "N" : "S";
    var longitude = toDegreesMinutesAndSeconds(lng);
    var longitudeCardinal = Math.sign(lng) >= 0 ? "E" : "W";
    return [latitude + " " + latitudeCardinal, longitude + " " + longitudeCardinal];
}

function toDegreesMinutesAndSeconds(coordinate) {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    return threeDig(degrees) + "° " + twoDig(minutes) + "' " + twoDig(seconds) + '"';
}

function focusing2ship() {
    try {
        var pos = map2.latLngToContainerPoint(shipMark.getLatLng());
        var x = pos.x;
        var y = pos.y;
        $("#xpos").css({
            "left": x + "px"
        });
        $("#ypos").css({
            "top": y + "px"
        });
        $(".ship-info-speed-deg").css({
            "left": x + "px"
        })
    } catch (e) {

    }
    setTimeout(function () {
        focusing2ship()
    }, 100);

}

function shipWeather(data) {
    var hour = data.timestamp[0];
    var lat = data.position[0];
    var lng = data.position[1];
    $.getJSON("raster/weather/point_" + hour + "_" + lat + "_" + lng, function (data) {
        var rain = parseFloat(data.rain);
        var waveDir = parseFloat(data.wave.dir);
        var waveHeight = parseFloat(data.wave.height);
        var windDir = parseFloat(data.wind.dir);
        var windMag = parseFloat(data.wind.mag);
        var currentDir = parseFloat(data.current.dir);
        var currentMag = parseFloat(data.current.mag);
        $(".ship-weather-rain").html(Math.round(rain * 100) / 100 + " mm/jam");
        $(".ship-weather-wave").html(Math.round(waveHeight * 100) / 100 + " m");
        $(".ship-weather-wind").html(Math.round(windMag * 100) / 100 + " m/s");
        $(".ship-weather-current").html(Math.round(currentMag * 100) / 100 + " cm/s");
        $(".ship-weather-wave-dir").css({'transform': 'rotate(' + waveDir + 'deg)'});
        $(".ship-weather-wind-dir").css({'transform': 'rotate(' + windDir + 'deg)'});
        $(".ship-weather-current-dir").css({'transform': 'rotate(' + currentDir + 'deg)'});
    })
}