import React from 'react';
import { Sparkles, Plane, MapPin, Calendar, Clock } from 'lucide-react';
import { PerfectAlignment } from '../types';

interface AlignmentCardProps {
  data: PerfectAlignment;
}

const AlignmentCard: React.FC<AlignmentCardProps> = ({ data }) => {
  console.log('[AlignmentCard] Rendering, data exists:', !!data);
  console.log('[AlignmentCard] Data structure:', data);

  if (!data) {
    console.log('[AlignmentCard] Returning fallback - no data');
    return (
      <div className="h-full relative overflow-hidden p-6 rounded-2xl border border-red-500/30 bg-red-900/10 backdrop-blur-md">
        <div className="text-red-400">Error: No alignment data provided</div>
      </div>
    );
  }

  try {
    console.log('[AlignmentCard] Has data, proceeding with render');

    return (
      <div className="w-full min-h-full relative overflow-hidden p-6 rounded-2xl border border-space-accent/30 bg-space-800/40 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] shadow-2xl shadow-space-accent/10 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-space-accent/20 text-space-glow">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Perfect Return
            </h2>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-space-accent/20 text-space-glow border border-space-accent/30 animate-pulse-slow">
            Recommended
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 text-gray-300 text-sm leading-relaxed">
          <p>
            To recreate the exact astronomical formation of your birth, you should be at this location during the Solar Return.
          </p>
        </div>

        {/* Location Highlight */}
        <div className="bg-gradient-to-br from-space-600 to-space-800 rounded-xl p-5 border border-space-500 mb-6 relative overflow-hidden group">
          <a
            href={`https://www.google.com/maps?q=${data.coordinates?.latitude},${data.coordinates?.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity cursor-pointer block"
            title="View on Maps"
          >
            {data.countryCode ? (
              <img
                src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${data.countryCode.toLowerCase()}/vector.svg`}
                alt={`${data.country} outline`}
                className="w-32 h-32 object-contain filter invert opacity-50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${data.countryCode ? 'hidden' : ''}`}>
              <Plane size={80} />
            </div>
          </a>

          <div className="relative z-10">
            <div className="flex items-start gap-2 mb-1">
              <MapPin className="text-space-accent mt-1" size={18} />
              <div>
                <h3 className="text-2xl font-bold text-white leading-none mb-1">{data.city}</h3>
                <p className="text-lg text-space-glow">{data.country}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 font-mono">
              <span className="bg-black/30 px-2 py-1 rounded border border-white/10">
                {typeof data.coordinates?.latitude === 'number' ? data.coordinates.latitude.toFixed(4) : (data.coordinates?.latitude || "0.0000")}° N
              </span>
              <span className="bg-black/30 px-2 py-1 rounded border border-white/10">
                {typeof data.coordinates?.longitude === 'number' ? data.coordinates.longitude.toFixed(4) : (data.coordinates?.longitude || "0.0000")}° E
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="bg-space-900/50 rounded-lg p-3 border border-space-700 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-space-800 pb-2 mb-1">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Calendar size={16} />
                <span>Alignment Date</span>
              </div>
              <div className="text-white font-mono font-bold">
                {data.localDateAtReturn}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Clock size={16} />
                <span>Local Time</span>
              </div>
              <div className="text-white font-mono font-bold">
                {data.localTimeAtReturn}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 italic border-l-2 border-space-accent pl-3">
            "{data.reasoning}"
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[AlignmentCard] Error rendering:', error);
    return (
      <div className="h-full relative overflow-hidden p-6 rounded-2xl border border-red-500/30 bg-red-900/10 backdrop-blur-md">
        <div className="text-red-400">Error rendering alignment card: {String(error)}</div>
      </div>
    );
  }
};

export default AlignmentCard;