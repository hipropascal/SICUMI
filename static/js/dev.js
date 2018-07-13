var imList = [];
var img2;

function f() {
    
}
function load7Days(day) {
    img2 = new Image();
    img2.src = '/raster/weather/inawave_wind_' + i + '.png';
    img2.code = 'inawave_wind_' + i + '.png';
    img2.onload = function () {
        var str64 = getBase64Image(img2);
        localStorage.setItem(img2.code, str64);
        console.log(img2.code);
        console.log(str64);
        var dataImage = localStorage.getItem('imgData');
        load7Days(2);
    }
}

load7Days(1);