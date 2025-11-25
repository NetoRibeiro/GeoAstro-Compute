
import { MakeTime, SunPosition, Observer, Horizon, Illumination, Body } from 'astronomy-engine';

const date = new Date();
const observer = new Observer(52.5200, 13.4050, 0); // Berlin
const time = MakeTime(date);

const sunPos = SunPosition(time);
const sunHor = Horizon(time, observer, sunPos.ra, sunPos.dec, 'normal');

console.log(`Sun Altitude: ${sunHor.altitude.toFixed(2)}`);
console.log(`Sun Azimuth: ${sunHor.azimuth.toFixed(2)}`);

const moonIllum = Illumination(Body.Moon, time);
console.log(`Moon Phase: ${moonIllum.phase_fraction.toFixed(2)}`);
