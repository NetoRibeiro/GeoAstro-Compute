import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AstroInput, AstroAnalysis, BirthAnalysis, PerfectAlignment } from "../types";

// Initialize Gemini Client
// NOTE: API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
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
    nextSolarReturn: { type: Type.STRING, description: "Date/Time of next exact solar return (same celestial longitude). Use ISO format if possible or readable text." },
    daysUntilSolarReturn: { type: Type.NUMBER, description: "Days remaining until the next solar return" },
    realBirthdayObservation: {
      type: Type.OBJECT,
      description: "The Solar Return (Real Birthday) observation details relative to this location's timezone.",
      properties: {
        location: { type: Type.STRING, description: "Location name (City, State, Country)" },
        date: { type: Type.STRING, description: "Date (DD/MM/YYYY)" },
        time: { type: Type.STRING, description: "Time (HH:MM:SS)" },
      }
    }
  },
  required: ["trueSolarTime", "civilTimeDifference", "sunPosition", "cosmicFact", "equationOfTime"]
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
  
  const prompt = `
    Perform a Geospatial Astronomical Computation.
    
    I have two data points:
    1. Birth Event:
       Location: ${birth.city}, ${birth.state}, ${birth.country}
       Date: ${birth.date}
       Time: ${birth.time}
       
    2. Current/Observer Event:
       Location: ${current.city}, ${current.state}, ${current.country}
       Date: ${current.date}
       Time: ${current.time}

    Task:
    1. Calculate the specific astronomical data for BOTH events (True Solar Time, Equation of Time, Sun Position).
    2. For the Birth Event, calculate the 'Solar Return' (Next Real Birthday).
    3. For the Current/Observer Event, calculate the 'Real Birthday Observation'.
    4. **Perfect Alignment Calculation**: Find a location on Earth where, at the exact Universal Time (UTC) of the calculated Next Solar Return, the Sun's apparent position (Altitude and Azimuth) would match the original Birth Sun's position as closely as possible. 
       - Essentially, find a place where the Local Solar Time at the moment of the Solar Return is approximately the same as the Local Solar Time was at birth.
       - Return this as 'perfectAlignment', including the Local Date and Time at that specific location.

    Infer Lat/Lon coordinates internally.
    Return the data in a strictly structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
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

export const resolveLocationFromGeo = async (lat: number, lon: number): Promise<{ city: string; state: string; country: string }> => {
    const prompt = `Identify the nearest City, State (if applicable), and Country for coordinates: Latitude ${lat}, Longitude ${lon}. 
    IMPORTANT: 
    1. Return the full Country name in English (e.g. 'United States', 'United Kingdom', 'Germany'). 
    2. Return the full State/Province name if applicable (e.g. 'New York', 'California', 'British Columbia'), DO NOT use abbreviations (e.g. NOT 'NY', NOT 'CA').
    Return JSON.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        city: { type: Type.STRING },
                        state: { type: Type.STRING },
                        country: { type: Type.STRING }
                    }
                }
            }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            city: data.city || "Unknown",
            state: data.state || "",
            country: data.country || "Unknown"
        };
    } catch (e) {
        return { city: "Unknown Location", state: "", country: "" };
    }
}