var latitude, longitude, accuracy, appid = '83d1fe91528b3e86e6d74be49baef889',
    api_url, elem = document.getElementById('weather-info'),
    context = elem.getContext('2d'),
    step, steps = 0,
    delay = 25,
    text,
    connection, stop = false,
    seconds;

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
    stop = true;
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
            console.log('show data: ' + JSON.stringify(data));
            if (data.count == 0) {
                alert('citi not found');
                return;
            }
            var tempr = data.list[0].main.temp;
            var location = data.list[0].name;
            //var desc = data.weather.description;
            console.log(tempr + '°' + location);
            var high_temp = data.list[0].main.temp_max;
            var low_temp = data.list[0].main.temp_min;
            text = location + ' has high of ' + high_temp + '°C and low of ' + low_temp + '°C';
            stop = false;
            writeCanvas(null, null, null, text);
            WebSocketConnect(high_temp);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    }).done(function() {
        return;
        //console.log('ajax done?')
    });
}

function writeCanvas(location, high_temp, low_temp, resetText) {
    // Get the canvas element.
    //console.log('count?');
    if (!elem || !elem.getContext) {
        return;
    }
    // Get the canvas 2d context.
    if (!context) {
        return;
    }
    context.fillStyle = '#FFF';
    //elem.width = window.innerWidth;
    context.font = 'bold 20px sans-serif';
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
        // for (var i = 0; step < steps; i--) {
        //     step = i;
        // }
    }
    if (step < -elem.width * 2) {
        step = 0;
        steps = 0;
    }
    if (stop == true) {
        step = 0;
        steps = 0;
        return;
    }
    //console.log('steps: ' + step);
}

function stopThis() {
    setTimeout(RunTextRightToLeft(), 100);
}

function clearCanvas() {
    stop = true;
    //setTimeout('RunTextRightToLeft()', 0);
    step = 0;
    steps = 0;
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
        alert('Geolocation is not supported by this device');
    }
}

function WebSocketConnect(temp_max) {
    var t0 = performance.now();
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

        //seconds = 0;
        connection.close();
    };
    connection.onclose = function(e) {
        //alert("Connection closed.");
        console.log(JSON.stringify(e.timeStamp));
        var t1 = performance.now();
        var ms = t1 - t0;
        seconds = parseInt((ms / 1000) % 60);
        $('#websocket-info').fadeIn('fast');
        $('#timestamp').text(seconds);
        $('#timestamp_ms').text(ms);

        console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    }
}
window.addEventListener('load', function() {
    initScripts();
    $('#city_names').focus(function() {
        clearCanvas();
        //seconds = 0;
        writeCanvas(null, null, null, '...');
        $('#websocket-info').fadeOut('fast');
        console.log('focus?');
    });
    $('#search').click(function() {
        searchRequest();
    });
}, false);