var latitude, longitude, accuracy, appid = '83d1fe91528b3e86e6d74be49baef889',
    api_url;
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
    api_url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&units=metric&APPID=' + appid;
    // console.log('posLat: ', latitude);
    // console.log('posLon: ', longitude);
    // console.log('posAccuracy: ', accuracy);
    $.ajax({
        url: api_url,
        method: 'GET',
        statusCode: {
            404: function() {
                console.log('Page not found');
            },
            401: function() {
                console.log('Unauthorized')
            }
        },
        success: function(data) {
            console.log(data.main.temp);
            var tempr = data.main.temp;
            var location = data.name;
            var desc = data.weather.description;
            console.log(tempr + '°' + location);
        }
    });
}

function error_handler() {
    //
    console.log('Geolocation is not enabled. Please enable to use this feature');
}