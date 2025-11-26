import React from 'react';
import { Flame, Mountain, Wind, Droplets, Activity, Anchor, Shuffle, Sparkles } from 'lucide-react';
import { ArroyoAnalysis } from '../types';

interface ArroyoCardProps {
    data: ArroyoAnalysis;
}

const ArroyoCard: React.FC<ArroyoCardProps> = ({ data }) => {
    if (!data) return null;

    const maxScore = Math.max(...(Object.values(data.scores) as number[]));

    const getElementIcon = (element: string) => {
        switch (element) {
            case 'Fire': return <Flame className="text-orange-500" />;
            case 'Earth': return <Mountain className="text-green-500" />;
            case 'Air': return <Wind className="text-blue-300" />;
            case 'Water': return <Droplets className="text-blue-500" />;
            default: return <Sparkles />;
        }
    };

    const getModalityIcon = (modality: string) => {
        switch (modality) {
            case 'Cardinal': return <Activity className="text-red-400" />;
            case 'Fixed': return <Anchor className="text-yellow-400" />;
            case 'Mutable': return <Shuffle className="text-purple-400" />;
            default: return <Sparkles />;
        }
    };

    const ProgressBar = ({ label, score, colorClass, icon }: { label: string, score: number, colorClass: string, icon: React.ReactNode }) => (
        <div className="mb-3">
            <div className="flex items-center justify-between mb-1 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                    {icon}
                    <span>{label}</span>
                </div>
                <span className="font-mono text-white">{score}</span>
            </div>
            <div className="h-2 bg-space-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${(score / 20) * 100}%` }} // Assuming max possible score around 20 for scaling
                />
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-full relative overflow-hidden p-6 rounded-2xl border border-space-accent/30 bg-space-800/40 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] shadow-2xl shadow-space-accent/10 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        Elemental Balance
                    </h2>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Arroyo Analysis
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Elements */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Elements</h3>
                    <ProgressBar label="Fire" score={data.scores.Fire} colorClass="bg-orange-500" icon={getElementIcon('Fire')} />
                    <ProgressBar label="Earth" score={data.scores.Earth} colorClass="bg-green-500" icon={getElementIcon('Earth')} />
                    <ProgressBar label="Air" score={data.scores.Air} colorClass="bg-blue-300" icon={getElementIcon('Air')} />
                    <ProgressBar label="Water" score={data.scores.Water} colorClass="bg-blue-500" icon={getElementIcon('Water')} />
                </div>

                {/* Modalities */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Modalities</h3>
                    <ProgressBar label="Cardinal" score={data.scores.Cardinal} colorClass="bg-red-400" icon={getModalityIcon('Cardinal')} />
                    <ProgressBar label="Fixed" score={data.scores.Fixed} colorClass="bg-yellow-400" icon={getModalityIcon('Fixed')} />
                    <ProgressBar label="Mutable" score={data.scores.Mutable} colorClass="bg-purple-400" icon={getModalityIcon('Mutable')} />
                </div>
            </div>

            {/* Interpretation */}
            <div className="mt-8 bg-space-900/50 rounded-xl p-5 border border-space-700">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-400" />
                    Psychological Insight
                </h3>
                <p className="text-gray-300 leading-relaxed italic">
                    "{data.interpretation}"
                </p>
            </div>

            {/* Dominant Traits */}
            <div className="mt-6 flex gap-4">
                <div className="flex-1 bg-space-800/50 rounded-lg p-3 border border-space-700 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Dominant Element</div>
                    <div className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        {getElementIcon(data.dominantElement)}
                        {data.dominantElement}
                    </div>
                </div>
                <div className="flex-1 bg-space-800/50 rounded-lg p-3 border border-space-700 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Dominant Modality</div>
                    <div className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        {getModalityIcon(data.dominantModality)}
                        {data.dominantModality}
                    </div>
                </div>
            </div>

            {/* Credits */}
            <div className="mt-6 pt-4 border-t border-space-700 flex justify-center">
                <a
                    href="https://en.wikipedia.org/wiki/Stephen_Arroyo"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-space-400 hover:text-space-accent transition-colors group"
                >
                    <Sparkles size={12} className="group-hover:text-yellow-400 transition-colors" />
                    <span>Based on the work of Stephen Arroyo</span>
                </a>
            </div>

        </div>
    );
};

export default ArroyoCard;
