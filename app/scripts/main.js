var latitude, longitude, accuracy, appid = '83d1fe91528b3e86e6d74be49baef889',
    api_url, elem = document.getElementById('weather-info'),
    context = elem.getContext('2d'),
    step, steps = 0,
    delay = 25,
    text,
    connection;

function success_handler(position) {
    /* Get the location data */
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    accuracy = position.coords.accuracy;
    api_url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&units=metric&APPID=' + appid;
    // console.log('posLat: ', latitude);
    // console.log('posLon: ', longitude);
    // console.log('posAccuracy: ', accuracy);
    writeCanvas(null, null, null, 'Loading...');
    useRequest(latitude, longitude, accuracy)
}

function error_handler() {
    //
    alert('Geolocation is not enabled. Please enable to use this feature');
}

function useRequest(latitude, longitude, accuracy) {
    $.ajax({
        url: api_url,
        method: 'GET',
        statusCode: {
            404: function() {
                console.log('Page not found');
            },
            401: function() {
                console.log('Unauthorized');
            },
            202: function() {
                console.log('Accepted');
            }
        },
        success: function(data) {
            console.log(data.main);
            var tempr = data.main.temp;
            var location = data.name;
            var desc = data.weather.description;
            console.log(tempr + '°' + location);
            var high_temp = data.main.temp_max;
            var low_temp = data.main.temp_min;
            writeCanvas(location, high_temp, low_temp);
            WebSocketConnect(high_temp);

        }
    });
}

function searchRequest() {
    var city = $('#city_names').val();
    $.ajax({
        url: 'http://api.openweathermap.org/data/2.5/find',
        jsonp: 'callback',
        dataType: 'jsonp',
        data: {
            q: city,
            units: 'metric',
            appid: appid,
            mode: 'json'
        },
        success: function(data) {
            var tempr = data.list[0].main.temp;
            var location = data.list[0].name;
            //var desc = data.weather.description;
            console.log(tempr + '°' + location);
            var high_temp = data.list[0].main.temp_max;
            var low_temp = data.list[0].main.temp_min;
            text = location + ' has high of ' + high_temp + '°C and low of ' + low_temp + '°C';
            clearCanvas();
            writeCanvas(null, null, null, text);
            WebSocketConnect(high_temp);
        }
    });
}

function writeCanvas(location, high_temp, low_temp, resetText) {
    // Get the canvas element.
    if (!elem || !elem.getContext) {
        return;
    }
    // Get the canvas 2d context.
    if (!context) {
        return;
    }
    context.fillStyle = '#00f';
    //elem.width = window.innerWidth;
    context.font = 'bold 30px sans-serif';
    context.textBaseline = 'top';

    if (context.fillText && resetText == null) {
        step = 0;
        steps = elem.width - 50;
        text = location + ' has high of ' + high_temp + '°C and low of ' + low_temp + '°C';
        RunTextRightToLeft();
    }
    if (context.fillText && resetText != null) {
        step = 0;
        steps = elem.width - 50;
        text = resetText;
        RunTextRightToLeft();
    }
}

function RunTextRightToLeft() {
    step--;
    context.clearRect(0, 0, elem.width, elem.height);
    context.save();
    context.translate(step, elem.height / 2);
    //context.fillText(location + ' has high of ' + high_temp + '° and low of ' + low_temp + '°', 0, 0);
    context.fillText(text, 0, 0);
    context.restore();
    if (step < steps) {
        var t = setTimeout('RunTextRightToLeft()', delay);
    }
    if (step < -elem.width * 2) {
        step = 0;
    }
    //console.log(step);
}

function clearCanvas() {
    context.clearRect(0, 0, elem.width, elem.height);
}

function initScripts() {
    //might add typeahead features to search and autocomplete
    // wip
    // $('#city_names').typeahead({
    //     minLength: 3,
    //     highlight: true
    // }, {
    //     name: 'states',
    //     source: 'http://api.openweathermap.org/data/2.5/weather?&appid=' + appid
    // });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success_handler,
            error_handler, { enableHighAccuracy: true });
    } else {
        //
        console.log('Geolocation is not supported by this device');
    }
}

function WebSocketConnect(temp_max) {
    connection = new WebSocket('ws://demos.kaazing.com/echo');
    // When the connection is open, send some data to the server
    connection.onopen = function() {
        connection.send(temp_max); // Send the message 'Ping' to the server
    };

    // Log errors
    connection.onerror = function(error) {
        console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    connection.onmessage = function(e) {
        console.log('Server: ' + e.data);
        console.log('Server time?: ' + e.timeStamp);
        var seconds = parseInt((e.timeStamp / 1000) % 60);
        $('#websocket-info').fadeIn('fast');
        $('#timestamp').text(seconds);
    };
}
window.addEventListener('load', function() {
    initScripts();
    $('#city_names').focus(function() {
        writeCanvas(null, null, null, '...');
        $('#websocket-info').fadeOut('fast');
        console.log('focus?');
    });
    $('#search').click(function() {
        searchRequest();
    });
}, false);