let times = SunCalc.getTimes(new Date(), 49.2, -123.1); // Vancouver
let now = new Date();
const root = document.querySelector(':root');
const container = document.querySelector('.container');

let background = '';
let colorTheme = '';
let removeTheme = '';

// const testBeforeSunrise = new Date('Nov 18, 2021 03:24:00');
// const testSunrise = new Date('Nov 18, 2021 06:24:00');
// const testDay = new Date('Nov 18, 2021 09:24:00');
// const testSunset = new Date('Nov 18, 2021 17:24:00');
// const testNight = new Date('Nov 18, 2021 22:24:00');

console.log("In Vancouver...");

// Before Sunrise
if (now.getTime() <= times.nauticalDawn.getTime()) {
    console.log("It's night");
    background = 'url("./img/Valley-night.svg")';
    colorTheme = '';
} else {
    console.log("It's not yet night");
}

// Nautical dawn (image is same a sunset)
if (now.getTime() >= times.nauticalDawn.getTime()) {
    console.log("It's later than nautical Dawn");
    background = 'url("./img/Valley-sunset.svg")';
    colorTheme = '';
} else {
    console.log("It's not yet nautical Dawn");
}

// Daytime (after sunrise)
if (now.getTime() >= times.sunriseEnd.getTime()) {
    console.log("It's later than sunrise");
    background = 'url("./img/Valley-day.svg")';
    colorTheme = 'day';
} else {
    console.log("It's not yet sunrise");
}

// Sunset
if (now.getTime() >= times.sunsetStart.getTime()) {
    console.log("It's later than sunset");
    background = 'url("./img/Valley-sunset.svg")';
    colorTheme = '';
    removeTheme = 'day';
} else {
    console.log("It's not yet sunset");
}

// Night
if (now.getTime() >= times.night.getTime()) {
    console.log("It's night");
    background = 'url("./img/Valley-night.svg")';
    colorTheme = '';
} else {
    console.log("It's not yet night");
}

container.style.backgroundImage = background;
if (colorTheme) root.classList.add(colorTheme);
if (removeTheme) root.classList.remove(removeTheme);
