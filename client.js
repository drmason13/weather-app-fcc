// declarations
var API_KEY = '97956c72f0a6235f1803733a17cd1957';

$('document').ready(function() {
  'use strict';
  // finding user location:
  // userLocation object definition (stores response from geolocation api)
  var userLocation = {
    lat: 0,
    lon: 0,
    url: 'http://api.openweathermap.org/data/2.5/weather',
    target: $('.locationStatus')
  };
  // callbacks for geolocation
  userLocation.locateSuccess = function(position) {
    window.console.log("locateSuccess:");
    this.lat = Math.round(position.coords.latitude);
    this.lon = Math.round(position.coords.longitude);
    this.target.html(`
      <p>Located at (Latitude: <span id='lat'>${userLocation.lat}</span>, Longitude: <span id="lon">${userLocation.lon}</span>)</p>
    `);
    weather.requestWeather();
  }
  userLocation.locateError = function() {
    'use strict';
    this.target.text('Sorry, there was an error using geolocation.');
  }

  // weather object definition (stores response from open weather api)
  var weather = {
    celsius: true
  };

  weather.changeTempUnit = function() {
    'use strict';
    if (this.celsius) {
    //convert to faranheit
      this.temp = Math.round(this.temp * 1.8 + 32);
      $('#toggle-temp').text('F').html();
    } else {
      //convert to celsius
      this.temp = Math.round((this.temp - 32) / 1.8);
      $('#toggle-temp').text('C').html();

    }
    this.celsius = !this.celsius;
    $('#temp').text(this.temp);
  };

  weather.updateWeather = function() {
    'use strict';
    $('body').addClass(this.timeOfDay);
    $('#weather-graphic').attr("src", this.icon);
    $('#weather-description').text(this.description);
    $('#temp').text(this.temp);
  };

  weather.setTimeOfDay = function(set, rise, now, leeway){
    if (now < rise || now > set) {
      weather.timeOfDay = "night";
    }
    if (now > rise && now < set) {
      weather.timeOfDay = "day";
    }
    if (Math.abs(set - now) < leeway) {
      console.log("sunset");
      weather.timeOfDay = "sunset";
    }
    if (Math.abs(rise - now) < leeway) {
      weather.timeOfDay = "sunrise";
    }
  }

  weather.chooseIcon = function(responseWeather) {
    switch (responseWeather.main) {
      case 'thunderstorm': { weather.icon = 'assets/storm.png'; break; }
      case 'drizzle':
      case 'rain': {
        if (response.weather.description.indexOf('light')) {
          weather.icon = 'assets/sun-rain.png';
        } else {
          weather.icon = 'assets/heavy-rain.png';
        } break; }
      case 'snow': { weather.icon = 'assets/storm.png'; break; }
      case 'atmosphere': { weather.icon = 'assets/fog.png'; break; }
      case 'clear': { weather.icon = 'assets/sun.png'; break; }
      case 'clouds': { if (responseWeather.description.indexOf('few')) {
        weather.icon = 'assets/sunny-cloud.png'
        } else { weather.icon = 'assets/cloudy.png' }; break; }
      case 'extreme': {
        if (responseWeather.description.match(/wind|storm|hurricane|tornado/i)) {
          weather.icon = 'assets/windy.png';
        } else if (responseWeather.description.indexOf('hail')) {
          weather.icon = 'assets/snow.png';
        } break; }
      case 'additional': { if (responseWeather.description.indexOf('clear')) {
        weather.icon = 'assets/sun.png'
        } else { weather.icon = 'assets/windy.png' }; break; }
      default: { weather.icon = 'assets/fog.png'; }
    }
    if (weather.timeOfDay = 'night') {
      if (weather.icon.match(/sun/i)) weather.icon = 'assets/moon.png';
      if (weather.icon.match(/cloud/i)) weather.icon = 'assets/cloud.png';
      if (weather.icon.match(/rain/i)) weather.icon = 'assets/heavy-rain.png';
    }
  }

  weather.requestWeather = function() {
    window.console.log('requesting:', userLocation);
    $.ajax('https://cors-anywhere.herokuapp.com/' + userLocation.url, {
      data: {
        'lat': userLocation.lat,
        'lon': userLocation.lon,
        'units': 'metric',
        'APPID': API_KEY
      },
      success: function(response) {
        // set weather properties
        weather.setTimeOfDay(response.sys.sunset, response.sys.sunrise, Date.now(), 3600);
        weather.chooseIcon(response.weather[0]);
        weather.description = response.weather[0].description;
        weather.temp = Math.round(response.main.temp);
        weather.updateWeather();
      }
    });
  }

  // attempt to activate geolocation to find userLocation
    if (!navigator.geolocation){
      window.console.alert("Sorry, Geolocation is not supported by your browser.\nWe can't show you weather for your current location :(\n\nDid you try taking a look out the window?\nAnd remember: red in the morning, shepherd's warning\npink sky at night, shepherd's delight");
    } else {
      navigator.geolocation.getCurrentPosition(userLocation.locateSuccess.bind(userLocation), userLocation.locateError.bind(userLocation));
    }
  function clickHandler() {
    weather.changeTempUnit();
  }

  $('#toggle-temp').on('click', clickHandler);
});
