function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

threshold = function (pixels, threshold) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2];
        var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels;
};

function hslToRgb(h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function readCookie()
{
    var allcookies = document.cookie;
    var cookiearray  = allcookies.split(';');
    for(var i=0; i<cookiearray.length; i++){
        var name = cookiearray[i].split('=')[0];
        var value = cookiearray[i].split('=')[1];
        alert("Key is : " + name + " and Value is : " + value);
    }
}

function byteString(n) {
  if (n < 0 || n > 255 || n % 1 !== 0) {
      throw new Error(n + " does not fit in a byte");
  }
  return ("000000000" + n.toString(2)).substr(-8)
}

function roundNumber(num, scale) {
  var number = Math.round(num * Math.pow(10, scale)) / Math.pow(10, scale);
  if(num - number > 0) {
    return (number + Math.floor(2 * Math.round((num - number) * Math.pow(10, (scale + 1))) / 10) / Math.pow(10, scale)).toFixed(scale);
  } else {
    return number;
  }
}