export const getZodiacSign = (dateStr) => {
  // Expects YYYY-MM-DD or DD/MM/YYYY. We try to parse it safely.
  const date = new Date(dateStr);
  
  // Fallback for manual entry if new Date() fails (e.g. DD/MM/YYYY format in JS often requires YYYY-MM-DD)
  let day, month;
  
  if (isNaN(date.getTime())) {
     // Try parsing manual DD/MM/YYYY
     const parts = dateStr.split(/[-/]/);
     if (parts.length === 3) {
        // Assumption: if strictly numeric and using slash, might be DD/MM/YYYY
        // If using dash, standard ISO is YYYY-MM-DD. 
        // Let's try to handle standard cases.
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            month = parseInt(parts[1]);
            day = parseInt(parts[2]);
        } else {
            // DD/MM/YYYY
            day = parseInt(parts[0]);
            month = parseInt(parts[1]);
        }
     } else {
         return "Unknown";
     }
  } else {
      day = date.getUTCDate();
      month = date.getUTCMonth() + 1; // 0-indexed
  }

  if (!day || !month) return "Unknown";

  // Source: https://www.horoscope.com/horoscope-dates/
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";

  return "Unknown";
};