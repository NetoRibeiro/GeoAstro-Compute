import React from 'react';
import { Sun, Moon, Globe, Clock, Compass, Info, MapPin, Calendar, Thermometer } from 'lucide-react';
import { AstroAnalysis, BirthAnalysis } from '../types';

interface AstroCardProps {
  type: 'birth' | 'current';
  data: AstroAnalysis | BirthAnalysis;
}

const ZodiacIcon = ({ name }: { name: string }) => {
  const n = (name || "").toLowerCase();
  const className = "w-6 h-6 text-space-accent";

  // Simplified paths for zodiac signs
  if (n.includes('aries')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5a5 5 0 1 0-4 7 4 4 0 0 1-4 4" /><path d="M12 5a5 5 0 1 1 4 7 4 4 0 0 0 4 4" /><line x1="12" y1="5" x2="12" y2="21" /></svg>;
  if (n.includes('taurus')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3a6 6 0 0 0 12 0" /><circle cx="12" cy="14" r="6" /></svg>;
  if (n.includes('gemini')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4h12" /><path d="M6 20h12" /><path d="M9 4v16" /><path d="M15 4v16" /></svg>;
  if (n.includes('cancer')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 12a6 6 0 1 1 6-6" /><path d="M18 12a6 6 0 1 1-6 6" /></svg>;
  if (n.includes('leo')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="12" r="3" /><path d="M9 12c0 5 5 8 10 4" /><path d="M19 16a3 3 0 1 0 0-6" /></svg>;
  if (n.includes('virgo')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v16" /><path d="M4 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4v8" /><path d="M12 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4v8c0 3-3 3-3 3" /></svg>;
  if (n.includes('libra')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="20" x2="20" y2="20" /><path d="M4 15h16" /><path d="M6 15a6 6 0 0 1 12 0" /></svg>;
  if (n.includes('scorpio')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v16" /><path d="M4 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4v8" /><path d="M12 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4v6l3 2 3-2" /></svg>;
  if (n.includes('sagittarius')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="20" x2="20" y2="4" /><path d="M12 4h8v8" /><line x1="8" y1="16" x2="16" y2="8" /></svg>;
  if (n.includes('capricorn')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l3 10" /><path d="M7 14a4 4 0 1 0 8 0v-4" /><path d="M15 10a4 4 0 1 1 0 8c-3 0-3-3-3-3" /></svg>;
  if (n.includes('aquarius')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10l3-3 3 3 3-3 3 3 3-3" /><path d="M4 16l3-3 3 3 3-3 3 3 3-3" /></svg>;
  if (n.includes('pisces')) return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4c0 8 0 8 0 16" /><path d="M19 4c0 8 0 8 0 16" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

  // Fallback Star
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
};

const MoonPhaseIcon = ({ phase }: { phase: string }) => {
  const p = (phase || "").toLowerCase().trim();
  const size = 42;
  const r = 18;
  const cx = 21;
  const cy = 21;

  const fillMoon = "#e2e8f0"; // Light gray/white
  const fillShadow = "#1e293b"; // Dark slate (matches bg somewhat)
  const fillFull = "#fcd34d"; // Yellow-ish for full moon

  // New Moon: All shadow
  if (p.includes('new')) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill={fillShadow} stroke="#475569" strokeWidth="1" />
      </svg>
    );
  }

  // Full Moon
  if (p.includes('full')) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-[0_0_10px_rgba(252,211,77,0.5)]">
        <circle cx={cx} cy={cy} r={r} fill={fillFull} />
      </svg>
    );
  }

  // First Quarter (Right half light)
  if (p.includes('first') || (p.includes('waxing') && p.includes('quarter'))) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill={fillShadow} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`} fill={fillMoon} />
      </svg>
    );
  }

  // Last Quarter (Left half light)
  if (p.includes('last') || (p.includes('third') && p.includes('quarter')) || (p.includes('waning') && p.includes('quarter'))) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill={fillShadow} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`} fill={fillMoon} />
      </svg>
    );
  }

  // Waxing Crescent (Right sliver)
  if (p.includes('waxing') && p.includes('crescent')) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill={fillShadow} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Q ${cx + 10} ${cy} ${cx} ${cy - r} Z`} fill={fillMoon} />
      </svg>
    );
  }

  // Waning Crescent (Left sliver)
  if (p.includes('waning') && p.includes('crescent')) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill={fillShadow} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Q ${cx - 10} ${cy} ${cx} ${cy - r} Z`} fill={fillMoon} />
      </svg>
    );
  }

  // Waxing Gibbous (Left bulge + Right half = Mostly light)
  if (p.includes('waxing') && p.includes('gibbous')) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill={fillShadow} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`} fill={fillMoon} />
        <path d={`M ${cx} ${cy + r} Q ${cx - 10} ${cy} ${cx} ${cy - r} Z`} fill={fillMoon} />
      </svg>
    );
  }

  // Waning Gibbous (Right bulge + Left half = Mostly light)
  if (p.includes('waning') && p.includes('gibbous')) {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill={fillShadow} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`} fill={fillMoon} />
        <path d={`M ${cx} ${cy + r} Q ${cx + 10} ${cy} ${cx} ${cy - r} Z`} fill={fillMoon} />
      </svg>
    );
  }

  // Fallback
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" className="drop-shadow-md">
      <circle cx={cx} cy={cy} r={r} fill={fillShadow} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
}

const AstroCard: React.FC<AstroCardProps> = ({ type, data }) => {
  console.log(`[AstroCard] Rendering ${type} card, data exists:`, !!data);
  console.log(`[AstroCard] ${type} card data structure:`, data);

  if (!data) {
    console.log(`[AstroCard] ${type} card returning fallback - no data`);
    return (
      <div className="h-full relative overflow-hidden p-6 rounded-2xl border border-red-500/30 bg-red-900/10 backdrop-blur-md">
        <div className="text-red-400">Error: No data provided for {type} card</div>
      </div>
    );
  }

  try {
    console.log(`[AstroCard] ${type} card has data, proceeding with render`);
    const isBirth = type === 'birth';
    const birthData = isBirth ? (data as BirthAnalysis) : null;

    // Use the pre-calculated zodiac sign from data, fallback to constellation if missing
    const displayZodiac = data.zodiacSign || data.sunPosition?.constellation || "Unknown";

    return (
      <div className={`w-full min-h-full relative overflow-hidden p-6 rounded-2xl border ${isBirth ? 'border-amber-500/30 bg-amber-900/10' : 'border-cyan-500/30 bg-cyan-900/10'} backdrop-blur-md transition-all duration-500 hover:scale-[1.01] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isBirth ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                {isBirth ? <Sun size={24} /> : <Globe size={24} />}
              </div>
              <h2 className={`text-2xl font-bold ${isBirth ? 'text-amber-100' : 'text-cyan-100'}`}>
                {isBirth ? 'Birth Computation' : 'Current Observer'}
              </h2>
            </div>
            {/* Inferred Coordinates Display */}
            {data.coordinates && (
              <div className="flex items-center gap-2 pl-14 text-[10px] text-gray-500 font-mono">
                <span>{typeof data.coordinates.latitude === 'number' ? data.coordinates.latitude.toFixed(4) : (data.coordinates.latitude || "0.0000")}° N</span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span>{typeof data.coordinates.longitude === 'number' ? data.coordinates.longitude.toFixed(4) : (data.coordinates.longitude || "0.0000")}° E</span>
              </div>
            )}
          </div>

          {isBirth && (
            <div className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Origin Point
            </div>
          )}
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Solar Time Block */}
          <div className="bg-space-800/50 rounded-xl p-4 border border-space-600">
            <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
              <Clock size={16} />
              <span>True Solar Time</span>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tighter text-white">
              {data.trueSolarTime}
            </div>
            <div className="text-xs text-space-glow mt-1">
              Offset: {data.civilTimeDifference}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Eq. of Time: {data.equationOfTime}
            </div>
          </div>

          {/* Sun Position Block */}
          <div className="bg-space-800/50 rounded-xl p-4 border border-space-600">
            <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
              <Compass size={16} />
              <span>Sun Position</span>
            </div>
            {data.sunPosition ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500 block">Azimuth</span>
                  <span className="text-lg font-bold text-white">{typeof data.sunPosition.azimuth === 'number' ? data.sunPosition.azimuth.toFixed(2) : (data.sunPosition.azimuth || "0.00")}°</span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Altitude</span>
                  <span className="text-lg font-bold text-white">{typeof data.sunPosition.altitude === 'number' ? data.sunPosition.altitude.toFixed(2) : (data.sunPosition.altitude || "0.00")}°</span>
                </div>
                <div className="col-span-2 border-t border-space-600 pt-2 mt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 block">Zodiac Sign</span>
                    <div className="flex items-center gap-1">
                      <ZodiacIcon name={displayZodiac} />
                      <span className="text-sm text-space-accent font-medium">{displayZodiac}</span>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-white">{typeof data.sunPosition.longitude === 'number' ? data.sunPosition.longitude.toFixed(2) : (data.sunPosition.longitude || "0.00")}°</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Sun position data unavailable</div>
            )}
          </div>
        </div>

        {/* Moon & Temperature & Facts */}
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Moon Phase */}
            {data.moonPosition && (
              <div className="flex-1 flex items-center gap-3 p-3 bg-space-800/30 rounded-lg border border-space-700">
                <div className="shrink-0">
                  <MoonPhaseIcon phase={data.moonPosition.phase || "New Moon"} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Moon Phase</span>
                  <span className="text-xs font-medium text-indigo-100">{data.moonPosition.phase || "Unknown"}</span>
                  <span className="text-xs text-gray-400">{data.moonPosition.constellation || ""}</span>
                </div>
              </div>
            )}

            {/* Temperature */}
            {data.temperature && (
              <div className="flex-1 flex items-center gap-3 p-3 bg-space-800/30 rounded-lg border border-space-700">
                <div className={`p-1.5 rounded-full shrink-0 ${data.temperature && (data.temperature.includes('Estimate') || data.temperature.includes('Avg')) ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                  <Thermometer className={`${data.temperature && (data.temperature.includes('Estimate') || data.temperature.includes('Avg')) ? 'text-orange-400' : 'text-blue-400'}`} size={24} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Temp</span>
                  <span className="text-xs font-medium text-gray-200 truncate" title={data.temperature}>{data.temperature}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-space-900/40 rounded-lg border border-space-700">
            <div className="flex items-center gap-2 mb-2 text-space-accent text-sm">
              <Info size={16} />
              <span className="font-semibold">Cosmic Fact</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed italic">
              "{data.cosmicFact}"
            </p>
          </div>
        </div>

        {/* Birth Special: Real Solar Birthday */}
        {isBirth && birthData && birthData.nextSolarReturn && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-purple-900/40 border border-amber-500/20">
            <h3 className="text-amber-200 font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🎂</span> True Solar Birthday
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              This is the exact moment the Sun returns to its birth longitude of <span className="font-mono text-amber-400">{typeof birthData.sunPosition?.longitude === 'number' ? birthData.sunPosition.longitude.toFixed(3) : (birthData.sunPosition?.longitude || "0.000")}°</span>.
            </p>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold text-white">
                {String(birthData.nextSolarReturn).includes('T') ? birthData.nextSolarReturn.split('T')[0] : birthData.nextSolarReturn}
              </div>
              <div className="text-right">
                <span className="block text-3xl font-bold text-amber-400">{Math.ceil(birthData.daysUntilSolarReturn || 0)}</span>
                <span className="text-xs text-amber-200 uppercase tracking-wider">Days Away</span>
              </div>
            </div>
          </div>
        )}

        {/* Current Special: True Solar Birthday (Local) */}
        {!isBirth && data.realBirthdayObservation && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/20">
            <h3 className="text-cyan-200 font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🎂</span> True Solar Birthday (Local)
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              At your current location ({data.realBirthdayObservation.location}), the exact solar return occurs on:
            </p>
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold text-white">
                  {data.realBirthdayObservation.date}
                </div>
                <div className="text-lg font-mono font-bold text-cyan-400">
                  {data.realBirthdayObservation.time}
                </div>
              </div>
              {data.daysUntilSolarReturn !== undefined && (
                <div className="text-right">
                  <span className="block text-3xl font-bold text-cyan-400">{Math.ceil(data.daysUntilSolarReturn)}</span>
                  <span className="text-xs text-cyan-200 uppercase tracking-wider">Days Away</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error(`[AstroCard] Error rendering ${type} card:`, error);
    return (
      <div className="h-full relative overflow-hidden p-6 rounded-2xl border border-red-500/30 bg-red-900/10 backdrop-blur-md">
        <div className="text-red-400">Error rendering {type} card: {String(error)}</div>
      </div>
    );
  }
};

export default AstroCard;