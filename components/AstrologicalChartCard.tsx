
import React from 'react';
import { AstroAnalysis } from '../types';

interface AstrologicalChartCardProps {
    data: AstroAnalysis;
}

const symbols: Record<string, string> = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
};

interface PlanetData {
    longitude: number;
    zodiacSign: string;
    degree: number;
}

const PlanetRow: React.FC<{ name: string, data: PlanetData }> = ({ name, data }) => {
    if (!data) return null;

    return (
        <div className="flex items-center justify-between p-3 bg-space-800/30 rounded-lg border border-space-700">
            <div className="flex items-center gap-3">
                <span className="text-xl text-space-accent w-6 text-center">{symbols[name] || '?'}</span>
                <span className="text-sm font-medium text-gray-200">{name}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{data.zodiacSign || 'Unknown'}</span>
                <span className="text-sm font-mono font-bold text-white">
                    {typeof data.degree === 'number' ? data.degree.toFixed(2) : '0.00'}°
                </span>
            </div>
        </div>
    );
};

const AstrologicalChartCard: React.FC<AstrologicalChartCardProps> = ({ data }) => {
    if (!data || !data.planets) {
        return (
            <div className="h-full p-6 rounded-2xl border border-purple-500/30 bg-purple-900/10 backdrop-blur-md flex items-center justify-center">
                <span className="text-gray-400">Planetary data not available</span>
            </div>
        );
    }

    const sunData: PlanetData | null = data.sunPosition ? {
        longitude: data.sunPosition.longitude,
        zodiacSign: data.zodiacSign,
        degree: data.sunPosition.longitude % 30
    } : null;

    return (
        <div className="w-full h-full relative overflow-hidden p-6 rounded-2xl border border-purple-500/30 bg-purple-900/10 backdrop-blur-md transition-all duration-500 hover:scale-[1.01]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <span className="text-xl">🌌</span>
                </div>
                <h2 className="text-2xl font-bold text-purple-100">
                    Astrological Chart
                </h2>
            </div>

            {/* Planets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {sunData && <PlanetRow name="Sun" data={sunData} />}
                {Object.entries(data.planets).map(([name, planetData]) => (
                    <PlanetRow key={name} name={name} data={planetData as PlanetData} />
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-space-700/50 text-center">
                <p className="text-xs text-gray-500">
                    Tropical Zodiac • Geocentric Positions
                </p>
            </div>
        </div>
    );
};

export default AstrologicalChartCard;
