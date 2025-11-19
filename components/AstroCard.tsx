import React from 'react';
import { Sun, Moon, Globe, Clock, Compass, Info, MapPin } from 'lucide-react';
import { AstroAnalysis, BirthAnalysis } from '../types';

interface AstroCardProps {
  type: 'birth' | 'current';
  data: AstroAnalysis | BirthAnalysis;
}

const AstroCard: React.FC<AstroCardProps> = ({ type, data }) => {
  const isBirth = type === 'birth';
  const birthData = isBirth ? (data as BirthAnalysis) : null;

  return (
    <div className={`h-full relative overflow-hidden p-6 rounded-2xl border ${isBirth ? 'border-amber-500/30 bg-amber-900/10' : 'border-cyan-500/30 bg-cyan-900/10'} backdrop-blur-md transition-all duration-500 hover:scale-[1.01]`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isBirth ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {isBirth ? <Sun size={24} /> : <Globe size={24} />}
          </div>
          <h2 className={`text-2xl font-bold ${isBirth ? 'text-amber-100' : 'text-cyan-100'}`}>
            {isBirth ? 'Birth Computation' : 'Current Observer'}
          </h2>
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
          <div className="grid grid-cols-2 gap-2">
            <div>
                <span className="text-xs text-gray-500 block">Azimuth</span>
                <span className="text-lg font-bold text-white">{data.sunPosition.azimuth.toFixed(2)}°</span>
            </div>
            <div>
                <span className="text-xs text-gray-500 block">Altitude</span>
                <span className="text-lg font-bold text-white">{data.sunPosition.altitude.toFixed(2)}°</span>
            </div>
            <div className="col-span-2 border-t border-space-600 pt-2 mt-1">
                <span className="text-xs text-gray-500 block">Celestial Longitude</span>
                <div className="flex justify-between items-end">
                    <span className="text-xl font-bold text-white">{data.sunPosition.longitude.toFixed(2)}°</span>
                    <span className="text-sm text-space-accent font-medium">{data.sunPosition.constellation}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moon & Facts */}
      <div className="space-y-4">
         {data.moonPosition && (
             <div className="flex items-center gap-4 p-3 bg-space-800/30 rounded-lg border border-space-700">
                <Moon className="text-indigo-300" size={20} />
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Moon Phase</span>
                    <span className="text-sm text-indigo-100">{data.moonPosition.phase} in {data.moonPosition.constellation}</span>
                </div>
             </div>
         )}

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
      {birthData && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-purple-900/40 border border-amber-500/20">
            <h3 className="text-amber-200 font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">🎂</span> True Solar Birthday
            </h3>
            <p className="text-sm text-gray-300 mb-3">
                This is the exact moment the Sun returns to its birth longitude of <span className="font-mono text-amber-400">{birthData.sunPosition.longitude.toFixed(3)}°</span>.
            </p>
            <div className="flex justify-between items-end">
                <div className="text-2xl font-bold text-white">
                    {birthData.nextSolarReturn.includes('T') ? birthData.nextSolarReturn.split('T')[0] : birthData.nextSolarReturn}
                </div>
                <div className="text-right">
                     <span className="block text-3xl font-bold text-amber-400">{Math.ceil(birthData.daysUntilSolarReturn)}</span>
                     <span className="text-xs text-amber-200 uppercase tracking-wider">Days Away</span>
                </div>
            </div>
        </div>
      )}

      {/* Current Special: Real Birthday Observation */}
      {!isBirth && data.realBirthdayObservation && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/20">
            <h3 className="text-cyan-200 font-semibold mb-2 flex items-center gap-2">
                <MapPin size={20} /> Real Birthday Observation
            </h3>
            <p className="text-sm text-gray-300 mb-3">
                Observed from your current location, the Solar Return occurs at:
            </p>
            <div className="space-y-2">
                <div className="text-sm text-gray-400 border-b border-cyan-500/20 pb-1 mb-2">
                    {data.realBirthdayObservation.location}
                </div>
                <div className="flex justify-between items-center">
                     <div className="text-lg font-mono font-bold text-cyan-100">
                        {data.realBirthdayObservation.date}
                     </div>
                     <div className="text-lg font-mono font-bold text-cyan-400">
                        {data.realBirthdayObservation.time}
                     </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AstroCard;