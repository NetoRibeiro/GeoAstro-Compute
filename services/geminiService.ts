import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AstroInput, AstroAnalysis, BirthAnalysis, PerfectAlignment } from "../types";
import { getZodiacSign } from "../utils/zodiac";

// Initialize Gemini Client
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
        constellation: { type: Type.STRING, description: "Astronomical Constellation name" },
        longitude: { type: Type.NUMBER, description: "Celestial longitude of the sun (0-360)" },
      },
      required: ["azimuth", "altitude", "constellation", "longitude"]
    },
    zodiacSign: { type: Type.STRING, description: "The astrological zodiac sign" },
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
    temperature: { type: Type.STRING, description: "The temperature used for the context." },
    nextSolarReturn: { type: Type.STRING, description: "Date/Time of next exact solar return. Use ISO format." },
    daysUntilSolarReturn: { type: Type.NUMBER, description: "Days remaining until the next solar return" },
    realBirthdayObservation: {
      type: Type.OBJECT,
      description: "The specific Local Date and Time when the Perfect Solar Alignment (Solar Return) occurs at the Current/Observer location.",
      properties: {
        location: { type: Type.STRING },
        date: { type: Type.STRING },
        time: { type: Type.STRING },
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
    reasoning: { type: Type.STRING },
    localDateAtReturn: { type: Type.STRING },
    localTimeAtReturn: { type: Type.STRING }
  },
  required: ["city", "country", "coordinates", "reasoning", "localDateAtReturn", "localTimeAtReturn"]
};

// Helper to parse flexible dates (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
const parseDateInput = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    // Handle slashes DD/MM/YYYY
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
             // Assume DD/MM/YYYY
             return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }
    // Handle dashes
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            // If first part is 4 digits, assume YYYY-MM-DD (ISO)
            if (parts[0].length === 4) {
                return new Date(dateStr);
            }
            // Assume DD-MM-YYYY
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }
    return new Date(dateStr);
}

export const analyzeAstroData = async (
  birth: AstroInput,
  current: AstroInput
): Promise<{ birthAnalysis: BirthAnalysis; currentAnalysis: AstroAnalysis; perfectAlignment: PerfectAlignment }> => {
  
  // 1. Determine Target Year for Solar Return
  const birthDateObj = parseDateInput(birth.date);
  const currentDateObj = parseDateInput(current.date);
  
  let targetReturnYear = currentDateObj.getFullYear();
  
  // Compare month and day to see if birthday has passed in current year
  const birthMonth = birthDateObj.getMonth();
  const birthDay = birthDateObj.getDate();
  const currentMonth = currentDateObj.getMonth();
  const currentDay = currentDateObj.getDate();

  // Ensure valid dates before comparing
  if (!isNaN(birthMonth) && !isNaN(currentMonth)) {
      if (currentMonth > birthMonth || (currentMonth === birthMonth && currentDay > birthDay)) {
          // Birthday has passed, calculate for next year
          targetReturnYear += 1;
      }
  }

  // 2. Prepare context strings
  const birthTempContext = birth.useHistoricalTemperature 
    ? "Estimate historical average temperature." 
    : `User Provided Temperature: ${birth.temperature || "Standard"}`;

  const currentTempContext = current.useHistoricalTemperature
    ? "Estimate historical average temperature."
    : `User Provided Temperature: ${current.temperature || "Standard"}`;

  const prompt = `
    Perform a precise Geospatial Astronomical Computation.
    
    Data Point 1 (Birth):
    Location: ${birth.city}, ${birth.state}, ${birth.country}
    Date: ${birth.date} (Format might be YYYY-MM-DD, DD/MM/YYYY or DD-MM-YYYY)
    Time: ${birth.time}
    Temp Context: ${birthTempContext}
       
    Data Point 2 (Current):
    Location: ${current.city}, ${current.state}, ${current.country}
    Date: ${current.date}
    Time: ${current.time}
    Temp Context: ${currentTempContext}

    Task:
    1. Calculate astronomical data (True Solar Time, Eq of Time, Sun Position, Days Until Solar Return).
       - **CRITICAL: Use algorithms and data consistent with the DE421 Ephemeris (NASA JPL) for high-precision solar positioning calculations.**
       - Explicitly return 'coordinates' (lat/lon) used.
    2. **Solar Return Calculation**:
       - Calculate the 'Next Solar Return' (Real Birthday) strictly for the year **${targetReturnYear}**.
       - Verify if ${targetReturnYear} is correct based on current date vs birth date (if birth date passed, use next year).
    3. **Real Birthday Observation**:
       - Provide the Local Date/Time of the Solar Return observed from the Current Location.
       - Include 'daysUntilSolarReturn' for both analyses.
    4. **Perfect Alignment**:
       - Find the optimal location on Earth for the Solar Return in ${targetReturnYear} to match birth solar geometry (DE421 standard).

    Infer Lat/Lon coordinates. Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0, 
        thinkingConfig: { thinkingBudget: 1024 },
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
    
    const data = JSON.parse(text) as { birthAnalysis: BirthAnalysis; currentAnalysis: AstroAnalysis; perfectAlignment: PerfectAlignment };

    // QA OVERRIDE: Ensure Zodiac Signs match the deterministic reality (Tropical Zodiac)
    // Gemini sometimes calculates Sidereal or constellation based, but users want Astrological (Tropical)
    data.birthAnalysis.zodiacSign = getZodiacSign(birth.date);
    data.currentAnalysis.zodiacSign = getZodiacSign(current.date);
    
    // Also update the sunPosition.constellation to reflect this for consistency in UI if preferred, 
    // though we have a dedicated field now. Let's keep them consistent.
    data.birthAnalysis.sunPosition.constellation = data.birthAnalysis.zodiacSign;
    data.currentAnalysis.sunPosition.constellation = data.currentAnalysis.zodiacSign;

    return data;
  } catch (error) {
    console.error("Gemini Astro Analysis Failed:", error);
    throw error;
  }
};

export const resolveLocationFromGeo = async (lat: number, lon: number): Promise<{ city: string; state: string; country: string; temperature: string }> => {
    const prompt = `
      Using Google Search, find the nearest City, State (Full Name), Country and CURRENT REAL-TIME temperature (Celsius) for: ${lat}, ${lon}.
      IMPORTANT: For the State/Province, use the official local spelling including accents (e.g. use 'São Paulo' instead of 'Sao Paulo', 'Yucatán' instead of 'Yucatan') to match standard database lists.
      Return JSON: {"city": "...", "state": "...", "country": "...", "temperature": "..."}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        
        const text = response.text || "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
        const data = JSON.parse(jsonStr);
        
        return {
            city: data.city || "Unknown",
            state: data.state || "",
            country: data.country || "Unknown",
            temperature: data.temperature ? String(data.temperature).replace(/[^0-9.-]/g, '') : ""
        };
    } catch (e) {
        return { city: "Unknown Location", state: "", country: "", temperature: "" };
    }
}