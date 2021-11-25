let times = SunCalc.getTimes(new Date(), 49.2, -123.1); // Vancouver
let now = new Date();
const root = document.querySelector(':root');
const container = document.querySelector('.container');

let background = '';
let colorTheme = '';
let removeTheme = '';


// Before Sunrise
if (now.getTime() <= times.nauticalDawn.getTime()) {
    background = 'url("./img/Valley-night.svg")';
    colorTheme = '';
}

// Nautical dawn (image is same a sunset)
if (now.getTime() >= times.nauticalDawn.getTime()) {
    background = 'url("./img/Valley-sunset.svg")';
    colorTheme = '';
}

// Daytime (after sunrise)
if (now.getTime() >= times.sunriseEnd.getTime()) {
    background = 'url("./img/Valley-day.svg")';
    colorTheme = 'day';
}

// Sunset
if (now.getTime() >= times.sunsetStart.getTime()) {
    background = 'url("./img/Valley-sunset.svg")';
    colorTheme = '';
    removeTheme = 'day';
}

// Night
if (now.getTime() >= times.night.getTime()) {
    background = 'url("./img/Valley-night.svg")';
    colorTheme = '';
}

container.style.backgroundImage = background;
if (colorTheme) root.classList.add(colorTheme);
if (removeTheme) root.classList.remove(removeTheme);
