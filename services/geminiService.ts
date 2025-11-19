import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AstroInput, AstroAnalysis, BirthAnalysis, PerfectAlignment } from "../types";

// Initialize Gemini Client
// NOTE: API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coordinates: {
      type: Type.OBJECT,
      description: "The inferred Latitude and Longitude used for this calculation.",
      properties: {
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER }
      },
      required: ["latitude", "longitude"]
    },
    trueSolarTime: { type: Type.STRING, description: "The calculated True Solar Time (HH:MM:SS)" },
    civilTimeDifference: { type: Type.STRING, description: "Difference between Civil and Solar time (e.g., '+14 mins')" },
    sunPosition: {
      type: Type.OBJECT,
      properties: {
        azimuth: { type: Type.NUMBER, description: "Sun Azimuth in degrees" },
        altitude: { type: Type.NUMBER, description: "Sun Altitude in degrees" },
        constellation: { type: Type.STRING, description: "Zodiac constellation the sun is in" },
        longitude: { type: Type.NUMBER, description: "Celestial longitude of the sun (0-360)" },
      },
      required: ["azimuth", "altitude", "constellation", "longitude"]
    },
    moonPosition: {
      type: Type.OBJECT,
      properties: {
        phase: { type: Type.STRING, description: "Current moon phase" },
        constellation: { type: Type.STRING, description: "Constellation the moon is in" },
      },
      required: ["phase", "constellation"]
    },
    cosmicFact: { type: Type.STRING, description: "A brief, interesting fact about this specific alignment" },
    equationOfTime: { type: Type.STRING, description: "Value of Equation of Time (e.g., '-3.5 minutes')" },
    temperature: { type: Type.STRING, description: "The temperature used for the context. If historical was requested, this must be the estimated historical average for that date/location." },
    nextSolarReturn: { type: Type.STRING, description: "Date/Time of next exact solar return (same celestial longitude). Use ISO format if possible or readable text." },
    daysUntilSolarReturn: { type: Type.NUMBER, description: "Days remaining until the next solar return" },
    realBirthdayObservation: {
      type: Type.OBJECT,
      description: "The specific Local Date and Time when the Perfect Solar Alignment (Solar Return) occurs at the Current/Observer location.",
      properties: {
        location: { type: Type.STRING, description: "Location name (City, State, Country)" },
        date: { type: Type.STRING, description: "Date (DD/MM/YYYY)" },
        time: { type: Type.STRING, description: "Time (HH:MM:SS)" },
      }
    }
  },
  required: ["coordinates", "trueSolarTime", "civilTimeDifference", "sunPosition", "cosmicFact", "equationOfTime", "temperature"]
};

const perfectAlignmentSchema: Schema = {
  type: Type.OBJECT,
  description: "A location on Earth where the solar geometry at the moment of Solar Return matches the birth geometry.",
  properties: {
    city: { type: Type.STRING },
    country: { type: Type.STRING },
    coordinates: {
        type: Type.OBJECT,
        properties: {
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER }
        }
    },
    reasoning: { type: Type.STRING, description: "Why this location matches the birth sky (e.g. 'At this longitude, it will be local noon, matching your birth time')." },
    localDateAtReturn: { type: Type.STRING, description: "The local date at this recommended location when the solar return happens (e.g. DD/MM/YYYY)." },
    localTimeAtReturn: { type: Type.STRING, description: "The local time at this recommended location when the solar return happens (HH:MM:SS)." }
  },
  required: ["city", "country", "coordinates", "reasoning", "localDateAtReturn", "localTimeAtReturn"]
};

export const analyzeAstroData = async (
  birth: AstroInput,
  current: AstroInput
): Promise<{ birthAnalysis: BirthAnalysis; currentAnalysis: AstroAnalysis; perfectAlignment: PerfectAlignment }> => {
  
  const birthTempContext = birth.useHistoricalTemperature 
    ? "Estimate and use the historical average temperature for this specific date, time, and location based on climate data." 
    : `User Provided Temperature: ${birth.temperature || "Not Specified (assume standard)"}`;

  const currentTempContext = current.useHistoricalTemperature
    ? "Estimate and use the historical average temperature for this specific date, time, and location."
    : `User Provided Temperature: ${current.temperature || "Not Specified (assume standard)"}`;

  const prompt = `
    Perform a precise Geospatial Astronomical Computation.
    
    I have two data points:
    1. Birth Event:
       Location: ${birth.city}, ${birth.state}, ${birth.country}
       Date: ${birth.date}
       Time: ${birth.time}
       Temperature Context: ${birthTempContext}
       
    2. Current/Observer Event:
       Location: ${current.city}, ${current.state}, ${current.country}
       Date: ${current.date}
       Time: ${current.time}
       Temperature Context: ${currentTempContext}

    Task:
    1. Calculate the specific astronomical data for BOTH events (True Solar Time, Equation of Time, Sun Position).
       - Include the "temperature" field in the output. If historical average was requested, derive it. If user provided, echo it.
       - **Crucial**: Explicitly return the 'coordinates' (lat/lon) you used for the calculation for both locations.
    2. For the Birth Event, calculate the 'Solar Return' (Next Real Birthday).
    3. For the Current/Observer Event, calculate the 'Real Birthday Observation'. 
       - This represents the **Perfect Solar Alignment** observed from the current location.
       - Provide the exact Local Date and Time at the ${current.city} location when the Sun reaches the exact same celestial longitude as birth.
    4. **Perfect Alignment Calculation (Optimal Location)**: Find a location on Earth where, at the exact Universal Time (UTC) of the calculated Next Solar Return, the Sun's apparent position (Altitude and Azimuth) would match the original Birth Sun's position as closely as possible. 
       - Essentially, find a place where the Local Solar Time at the moment of the Solar Return is approximately the same as the Local Solar Time was at birth.
       - Return this as 'perfectAlignment', including the Local Date and Time at that specific location.

    Infer Lat/Lon coordinates internally based on the city/country names.
    Return the data in a strictly structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0, // Enforce determinism
        thinkingConfig: { thinkingBudget: 1024 }, // Allocate budget for calculation reasoning
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                birthAnalysis: analysisSchema,
                currentAnalysis: analysisSchema,
                perfectAlignment: perfectAlignmentSchema
            },
            required: ["birthAnalysis", "currentAnalysis", "perfectAlignment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    
    return JSON.parse(text) as { birthAnalysis: BirthAnalysis; currentAnalysis: AstroAnalysis; perfectAlignment: PerfectAlignment };
  } catch (error) {
    console.error("Gemini Astro Analysis Failed:", error);
    throw error;
  }
};

export const resolveLocationFromGeo = async (lat: number, lon: number): Promise<{ city: string; state: string; country: string; temperature: string }> => {
    const prompt = `
      Using Google Search, find the nearest City, State (Full Name, e.g. New York), Country and the CURRENT REAL-TIME temperature in Celsius for coordinates: ${lat}, ${lon}.
      
      Return the result as a valid JSON object with keys:
      - city
      - state
      - country
      - temperature (number only)
      
      Example output: {"city": "Paris", "state": "Ile-de-France", "country": "France", "temperature": "12"}
      Do NOT wrap in markdown.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
                // Note: responseSchema is not supported when using googleSearch tool
            }
        });
        
        const text = response.text || "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
        const data = JSON.parse(jsonStr);
        
        return {
            city: data.city || "Unknown",
            state: data.state || "",
            country: data.country || "Unknown",
            // Clean temperature string to be just numbers/decimals/minuses
            temperature: data.temperature ? String(data.temperature).replace(/[^0-9.-]/g, '') : ""
        };
    } catch (e) {
        console.error("Location/Weather resolution failed", e);
        return { city: "Unknown Location", state: "", country: "", temperature: "" };
    }
}