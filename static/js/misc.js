function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBearing(lat1, lng1, lat2, lng2) {
    var dLon = toRad(lng2 - lng1);
    var y = Math.sin(dLon) * Math.cos(toRad(lat2));
    var x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    var brng = toDeg(Math.atan2(y, x));
    return ((brng + 360) % 360);
}

function getDistance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a));
}

function toRad(deg) {
    return deg * Math.PI / 180;
}

function toDeg(rad) {
    return rad * 180 / Math.PI;
}

function dateIndonesia(date) {
    var hour = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours());
    var minute = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
    var day = date.getDay();
    console.log(date.getTimezoneOffset());
    var hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return hour + ":" + minute;
}

function dayIndonesia(date) {
    var day = date.getDay();
    var hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return hari[day];
}

function byteString(n) {
    if (n < 0 || n > 255 || n % 1 !== 0) {
        throw new Error(n + " does not fit in a byte");
    }
    return ("000000000" + n.toString(2)).substr(-8)
}

function twoDig(val){
    if(parseInt(val) < 10){
        return '0'+val;
    }else {
        return val;
    }
}

function threeDig(val){
    if(parseInt(val) < 100){
        return '00'+val;
    }else {
        return val;
    }
}

function addHour(hour,add) {
    var hourn;
    var houradd = hour+add;
    if(houradd >= 24){
        hourn = houradd-24
    }
    return
}