console.log('\'Allo \'Allo!');
var latitude, longitude, accuracy;
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success_handler,
        error_handler, { enableHighAccuracy: true });
} else {
    //
    console.log('Geolocation is not supported by this device');
}

function success_handler(position) {
    /* Get the location data */
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    accuracy = position.coords.accuracy;
    console.log('posLat:', latitude);
    console.log("posLon", longitude);
    console.log("posAccuracy", accuracy);
    // $.cookie("posLat", latitude);
    // $.cookie("posLon", longitude);
    // $.cookie("posAccuracy", accuracy);
}

function error_handler() {
    //
    console.log('Geolocation is not enabled. Please enable to use this feature');
}