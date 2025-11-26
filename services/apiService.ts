
import { AstroInput, AstroAnalysis, BirthAnalysis, PerfectAlignment, ArroyoAnalysis } from "../types";
import { GoogleGenAI } from "@google/genai";

const API_URL = "http://localhost:8000";

// Keep Gemini for the "Cosmic Fact" and "Reasoning" if we want, 
// or we can move that to the backend later. For now, let's keep the structure
// but fetch the math from the backend.

export const analyzeAstroData = async (
    birth: AstroInput,
    current: AstroInput
): Promise<{ birthAnalysis: BirthAnalysis; currentAnalysis: AstroAnalysis; perfectAlignment: PerfectAlignment }> => {

    // 1. Fetch Birth Data from Python Backend
    console.log('[API] Step 1: Fetching birth data...');
    const birthRes = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birth)
    });
    if (!birthRes.ok) {
        console.error('[API] Step 1 FAILED: Birth analysis request failed', birthRes.status, birthRes.statusText);
        throw new Error("Failed to fetch birth analysis");
    }
    const birthData = await birthRes.json();
    console.log('[API] Step 1 SUCCESS: Birth data received:', birthData);

    // 2. Fetch Current Data from Python Backend
    console.log('[API] Step 2: Fetching current data...');
    const currentRes = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current)
    });
    if (!currentRes.ok) {
        console.error('[API] Step 2 FAILED: Current analysis request failed', currentRes.status, currentRes.statusText);
        throw new Error("Failed to fetch current analysis");
    }
    const currentData = await currentRes.json();
    console.log('[API] Step 2 SUCCESS: Current data received:', currentData);

    // 3. Fetch Solar Return for Birth Data
    const now = new Date();
    const birthDate = new Date(birth.date);
    let targetYear = now.getFullYear();

    // Check if birthday has passed in current year
    const currentMonth = now.getMonth();
    const birthMonth = birthDate.getMonth();
    const currentDay = now.getDate();
    const birthDay = birthDate.getDate();

    if (currentMonth > birthMonth || (currentMonth === birthMonth && currentDay > birthDay)) {
        targetYear += 1;
    }

    let nextSolarReturn = new Date().toISOString();
    let daysUntilSolarReturn = 0;

    try {
        console.log('[API] Step 3: Fetching solar return data...');
        const srRes = await fetch(`${API_URL}/solar-return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                birth_date: birth.date,
                birth_time: birth.time,
                target_year: targetYear,
                city: birth.city,
                country: birth.country,
                state: birth.state
            })
        });
        if (srRes.ok) {
            const srData = await srRes.json();
            console.log('[API] Step 3 SUCCESS: Solar return data received:', srData);
            if (srData.solar_return) {
                nextSolarReturn = srData.solar_return;
                const srDate = new Date(nextSolarReturn);
                const diffTime = srDate.getTime() - now.getTime();
                daysUntilSolarReturn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log('[API] Step 3.1: Calculated nextSolarReturn:', nextSolarReturn, 'daysUntil:', daysUntilSolarReturn);
            }
        } else {
            console.warn('[API] Step 3 WARNING: Solar return request not OK:', srRes.status);
        }
    } catch (e) {
        console.error("[API] Step 3 ERROR: Failed to fetch solar return:", e);
    }

    // 4. Construct the response objects with data normalization
    const mapToAnalysis = (data: any, input: AstroInput): AstroAnalysis => {
        // Normalize coordinates to ensure they are numbers
        const normalizeCoordinates = (coords: any) => {
            if (!coords) return { latitude: 0, longitude: 0 };
            return {
                latitude: typeof coords.latitude === 'number' ? coords.latitude : parseFloat(coords.latitude) || 0,
                longitude: typeof coords.longitude === 'number' ? coords.longitude : parseFloat(coords.longitude) || 0
            };
        };

        // Normalize sun position to ensure numeric values
        const normalizeSunPosition = (sunPos: any) => {
            if (!sunPos) return {
                azimuth: 0,
                altitude: 0,
                constellation: "Unknown",
                longitude: 0
            };
            return {
                azimuth: typeof sunPos.azimuth === 'number' ? sunPos.azimuth : parseFloat(sunPos.azimuth) || 0,
                altitude: typeof sunPos.altitude === 'number' ? sunPos.altitude : parseFloat(sunPos.altitude) || 0,
                constellation: sunPos.constellation || "Unknown",
                longitude: typeof sunPos.longitude === 'number' ? sunPos.longitude : parseFloat(sunPos.longitude) || 0
            };
        };

        // Handle temperature: prioritize user input, then API response, then fallback
        let temperatureValue = "N/A";
        if (input.temperature && input.temperature.trim() && !input.useHistoricalTemperature) {
            // User provided a temperature - format it with °C
            const tempNum = parseFloat(input.temperature);
            if (!isNaN(tempNum)) {
                temperatureValue = `${tempNum}°C`;
            } else {
                temperatureValue = input.temperature; // Use as-is if not a number
            }
        } else if (input.useHistoricalTemperature && data.temperature) {
            // Historical temperature from API
            temperatureValue = data.temperature;
        } else if (data.temperature && data.temperature !== "N/A") {
            // Use API response if available
            temperatureValue = data.temperature;
        }

        return {
            coordinates: normalizeCoordinates(data.coordinates),
            trueSolarTime: data.trueSolarTime || "00:00:00",
            civilTimeDifference: data.civilTimeDifference || "0 mins",
            sunPosition: normalizeSunPosition(data.sunPosition),
            zodiacSign: data.zodiacSign || "Unknown",
            moonPosition: data.moonPosition || undefined,
            planets: data.planets || {},
            cosmicFact: data.cosmicFact || "The stars are aligning in unique ways today.",
            equationOfTime: data.equationOfTime || "0 minutes",
            temperature: temperatureValue,
            nextSolarReturn: nextSolarReturn,
            daysUntilSolarReturn: daysUntilSolarReturn
        };
    };

    console.log('[API] Step 4: Mapping data to analysis objects...');
    const birthAnalysis = mapToAnalysis(birthData, birth) as BirthAnalysis;
    const currentAnalysis = mapToAnalysis(currentData, current);
    console.log('[API] Step 4.1: birthAnalysis mapped:', birthAnalysis);
    console.log('[API] Step 4.2: currentAnalysis mapped:', currentAnalysis);

    // Note: Perfect alignment calculation moved to Step 5 (after solar return is calculated)

    // 5. Calculate Perfect Alignment
    console.log('[API] Step 5: Calculating perfect alignment...');
    let perfectAlignment: PerfectAlignment = {
        city: "Unknown",
        country: "Unknown",
        coordinates: { latitude: 0, longitude: 0 },
        reasoning: "Calculating optimal location...",
        localDateAtReturn: nextSolarReturn.split('T')[0],
        localTimeAtReturn: "00:00:00"
    };

    try {
        const alignmentRes = await fetch(`${API_URL}/perfect-alignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                birth_date: birth.date,
                birth_time: birth.time,
                birth_city: birth.city,
                birth_country: birth.country,
                birth_state: birth.state,
                solar_return: nextSolarReturn
            })
        });

        if (alignmentRes.ok) {
            const alignmentData = await alignmentRes.json();
            console.log('[API] Step 5 SUCCESS: Perfect alignment calculated:', alignmentData);
            perfectAlignment = {
                city: alignmentData.city || "Unknown",
                country: alignmentData.country || "Unknown",
                countryCode: alignmentData.countryCode,
                coordinates: {
                    latitude: typeof alignmentData.coordinates?.latitude === 'number'
                        ? alignmentData.coordinates.latitude
                        : parseFloat(alignmentData.coordinates?.latitude) || 0,
                    longitude: typeof alignmentData.coordinates?.longitude === 'number'
                        ? alignmentData.coordinates.longitude
                        : parseFloat(alignmentData.coordinates?.longitude) || 0
                },
                reasoning: alignmentData.reasoning || "Optimal location for solar return alignment.",
                localDateAtReturn: alignmentData.localDateAtReturn || nextSolarReturn.split('T')[0],
                localTimeAtReturn: alignmentData.localTimeAtReturn || "00:00:00"
            };
        } else {
            console.warn('[API] Step 5 WARNING: Perfect alignment request not OK:', alignmentRes.status);
        }
    } catch (e) {
        console.error("[API] Step 5 ERROR: Failed to calculate perfect alignment:", e);
    }

    // 6. Fetch Arroyo Analysis
    console.log('[API] Step 6: Fetching Arroyo analysis...');
    let arroyoAnalysis: ArroyoAnalysis = {
        scores: { Fire: 0, Earth: 0, Air: 0, Water: 0, Cardinal: 0, Fixed: 0, Mutable: 0 },
        positions: {},
        dominantElement: "Unknown",
        dominantModality: "Unknown",
        interpretation: "Analysis unavailable."
    };

    try {
        const arroyoRes = await fetch(`${API_URL}/arroyo-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                birth_date: birth.date,
                birth_time: birth.time,
                city: birth.city,
                country: birth.country,
                state: birth.state
            })
        });

        if (arroyoRes.ok) {
            arroyoAnalysis = await arroyoRes.json();
            console.log('[API] Step 6 SUCCESS: Arroyo analysis received:', arroyoAnalysis);
        } else {
            console.warn('[API] Step 6 WARNING: Arroyo analysis request not OK:', arroyoRes.status);
        }
    } catch (e) {
        console.error("[API] Step 6 ERROR: Failed to fetch Arroyo analysis:", e);
    }

    const result = {
        birthAnalysis,
        currentAnalysis,
        perfectAlignment,
        arroyoAnalysis
    };
    console.log('[API] Step 7: Returning final result object:', result);
    return result;
};

export const resolveLocationFromGeo = async (lat: number, lon: number): Promise<{ city: string; state: string; country: string; temperature: string }> => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        return {
            city: data.address.city || data.address.town || data.address.village || "Unknown",
            state: data.address.state || "",
            country: data.address.country || "Unknown",
            temperature: ""
        };
    } catch (e) {
        return { city: "Unknown", state: "", country: "", temperature: "" };
    }
}
