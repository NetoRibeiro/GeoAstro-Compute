
import React, { useState, useEffect } from 'react';
import { AstroInput, BirthAnalysis, AstroAnalysis, PerfectAlignment, AnalysisStatus, ArroyoAnalysis } from './types';
import { analyzeAstroData, resolveLocationFromGeo } from './services/apiService';
import StarBackground from './components/StarBackground';
import InputForm from './components/InputForm';
import AstroCard from './components/AstroCard';
import AlignmentCard from './components/AlignmentCard';
import ArroyoCard from './components/ArroyoCard';
import AstrologicalChartCard from './components/AstrologicalChartCard';
import { Rocket, ChevronDown, Github } from 'lucide-react';

const APP_VERSION = '1.1.012';

const App: React.FC = () => {
    const [birthData, setBirthData] = useState<AstroInput>({
        city: '', state: '', country: '', date: '', time: '', temperature: '', useHistoricalTemperature: false
    });

    const [currentData, setCurrentData] = useState<AstroInput>({
        city: '', state: '', country: '', date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: '', useHistoricalTemperature: false
    });

    const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
    const [results, setResults] = useState<{ birthAnalysis: BirthAnalysis; currentAnalysis: AstroAnalysis; perfectAlignment: PerfectAlignment; arroyoAnalysis: ArroyoAnalysis } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoadingLoc, setIsLoadingLoc] = useState(false);
    const [showChart, setShowChart] = useState(true);

    // Log when results change
    useEffect(() => {
        if (results) {
            console.log('[RENDER] Results section should render');
            console.log('[RENDER.1] results exists:', !!results);
            console.log('[RENDER.2] showChart:', showChart);
            console.log('[RENDER.3] birthAnalysis:', !!results.birthAnalysis);
            console.log('[RENDER.4] currentAnalysis:', !!results.currentAnalysis);
            console.log('[RENDER.5] perfectAlignment:', !!results.perfectAlignment);
            console.log('[RENDER.6] arroyoAnalysis:', !!results.arroyoAnalysis);
        }
    }, [results, showChart]);

    const handleBirthChange = (field: keyof AstroInput, value: any) => {
        setBirthData(prev => ({ ...prev, [field]: value }));
    };

    const handleCurrentChange = (field: keyof AstroInput, value: any) => {
        setCurrentData(prev => ({ ...prev, [field]: value }));
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setIsLoadingLoc(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const location = await resolveLocationFromGeo(latitude, longitude);
                const now = new Date();

                setCurrentData(prev => ({
                    ...prev,
                    city: location.city,
                    state: location.state,
                    country: location.country,
                    date: now.toISOString().split('T')[0],
                    time: now.toLocaleTimeString('en-GB', { hour12: false }),
                    temperature: location.temperature,
                    useHistoricalTemperature: false
                }));
            } catch (e) {
                console.error(e);
                alert("Failed to resolve location.");
            } finally {
                setIsLoadingLoc(false);
            }
        }, (err) => {
            console.error(err);
            alert("Unable to retrieve location.");
            setIsLoadingLoc(false);
        });
    };

    const handleCompute = async () => {
        console.log('[STEP 1] handleCompute called');
        console.log('[STEP 1.1] showChart state:', showChart);
        console.log('[STEP 1.2] birthData:', birthData);
        console.log('[STEP 1.3] currentData:', currentData);

        // Validation: Ensure Location, Country, Date, and Time are present
        if (!birthData.city || !birthData.country || !birthData.date || !birthData.time ||
            !currentData.city || !currentData.country || !currentData.date || !currentData.time) {
            console.log('[STEP 2] Validation FAILED - missing required fields');
            setErrorMsg("Please fill in all required fields (Location, Country, Date, Time) for both sections.");
            return;
        }

        console.log('[STEP 2] Validation PASSED');
        console.log('[STEP 3] Setting status to LOADING, clearing error and results');
        setStatus(AnalysisStatus.LOADING);
        setErrorMsg(null);
        setResults(null);

        try {
            console.log('[STEP 4] Calling analyzeAstroData API...');
            const data = await analyzeAstroData(birthData, currentData);
            console.log('[STEP 5] API call completed successfully');
            console.log('[STEP 5.1] Received data:', data);
            console.log('[STEP 5.2] birthAnalysis:', data?.birthAnalysis);
            console.log('[STEP 5.3] currentAnalysis:', data?.currentAnalysis);
            console.log('[STEP 5.4] perfectAlignment:', data?.perfectAlignment);

            console.log('[STEP 6] Setting results state...');
            setResults(data);
            console.log('[STEP 7] Setting status to SUCCESS');
            setStatus(AnalysisStatus.SUCCESS);
            console.log('[STEP 8] Results state updated, component should re-render');

            // Scroll to results
            setTimeout(() => {
                console.log('[STEP 9] Attempting to scroll to results section');
                const resultsElement = document.getElementById('results-section');
                console.log('[STEP 9.1] Results element found:', !!resultsElement);
                resultsElement?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (e) {
            console.error('[ERROR] Exception caught in handleCompute:', e);
            setStatus(AnalysisStatus.ERROR);
            setErrorMsg("Failed to compute astronomical data. Please try again.");
        }
    };

    return (
        <div className="min-h-screen text-gray-100 font-sans selection:bg-space-accent selection:text-white relative">
            <StarBackground />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-space-900/80 backdrop-blur-lg border-b border-space-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-tr from-space-accent to-blue-500 p-2 rounded-lg">
                            <Rocket size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            GeoAstro Compute
                        </span>
                    </div>
                    <div className="hidden md:block text-xs text-gray-400">
                        Powered by Gemini 2.5 Flash
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Hero Section */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Know Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-space-glow to-space-accent">Real Birthday</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Civil time is a construct. Discover your true place in the cosmos by calculating astronomical solar time, planetary alignment, and your exact solar return using geospatial temporal analytics.
                    </p>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
                    <div className="space-y-2">
                        <InputForm
                            title="Birth Origin"
                            data={birthData}
                            onChange={handleBirthChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <InputForm
                            title="Current Observer"
                            data={currentData}
                            onChange={handleCurrentChange}
                            onGetCurrentLocation={handleGetCurrentLocation}
                            isLoadingLocation={isLoadingLoc}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-center justify-center mb-16 gap-6">
                    {errorMsg && (
                        <div className="mb-4 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm animate-bounce">
                            {errorMsg}
                        </div>
                    )}

                    <button
                        onClick={handleCompute}
                        disabled={status === AnalysisStatus.LOADING}
                        className={`
                    group relative px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-space-accent/20 
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    ${status === AnalysisStatus.LOADING
                                ? 'bg-space-700 text-gray-400 cursor-wait'
                                : 'bg-gradient-to-r from-space-accent to-blue-600 text-white hover:shadow-space-accent/40'}
                `}
                    >
                        {status === AnalysisStatus.LOADING ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Computing Trajectory...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Initialize Computation
                                <ChevronDown className="group-hover:translate-y-1 transition-transform" size={20} />
                            </span>
                        )}
                    </button>
                    <div className="text-xs text-gray-500 font-mono text-center mt-2">
                        v{APP_VERSION}
                    </div>

                    {/* Chart Toggle */}
                    <div className="flex items-center gap-3 bg-space-800/50 px-4 py-2 rounded-full border border-space-700">
                        <span className="text-sm text-gray-300">Show Astrological Chart</span>
                        <button
                            onClick={() => setShowChart(!showChart)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${showChart ? 'bg-space-accent' : 'bg-space-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${showChart ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                {results && (
                    <div id="results-section" className="opacity-100 relative z-20">
                        {console.log('[RENDER.6] Results section JSX rendering')}
                        {/* First Row: Three Cards (Birth, Current, Perfect Return) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {console.log('[RENDER.7] Grid container rendering - First row')}
                            {/* Birth Card */}
                            <div className="md:col-span-1 lg:col-span-1 flex">
                                {console.log('[RENDER.8] Birth Card container rendering')}
                                {(() => {
                                    try {
                                        return <AstroCard type="birth" data={results.birthAnalysis} />;
                                    } catch (error) {
                                        console.error('[RENDER] Error rendering Birth Card:', error);
                                        return (
                                            <div className="w-full h-full p-6 rounded-2xl border border-red-500/30 bg-red-900/10">
                                                <div className="text-red-400">Error rendering Birth Card: {String(error)}</div>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>

                            {/* Current Card */}
                            <div className="md:col-span-1 lg:col-span-1 flex">
                                {console.log('[RENDER.9] Current Card container rendering')}
                                {(() => {
                                    try {
                                        return <AstroCard type="current" data={results.currentAnalysis} />;
                                    } catch (error) {
                                        console.error('[RENDER] Error rendering Current Card:', error);
                                        return (
                                            <div className="w-full h-full p-6 rounded-2xl border border-red-500/30 bg-red-900/10">
                                                <div className="text-red-400">Error rendering Current Card: {String(error)}</div>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>

                            {/* Perfect Return Card */}
                            <div className="md:col-span-2 lg:col-span-1 flex">
                                {console.log('[RENDER.10] Perfect Return Card rendering')}
                                {(() => {
                                    try {
                                        return <AlignmentCard data={results.perfectAlignment} />;
                                    } catch (error) {
                                        console.error('[RENDER] Error rendering Alignment Card:', error);
                                        return (
                                            <div className="w-full h-full p-6 rounded-2xl border border-red-500/30 bg-red-900/10">
                                                <div className="text-red-400">Error rendering Alignment Card: {String(error)}</div>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>

                        {/* Second Row: Arroyo Analysis and Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Arroyo Card */}
                            <div className="lg:col-span-1 flex">
                                {(() => {
                                    try {
                                        return <ArroyoCard data={results.arroyoAnalysis} />;
                                    } catch (error) {
                                        console.error('[RENDER] Error rendering Arroyo Card:', error);
                                        return (
                                            <div className="w-full h-full p-6 rounded-2xl border border-red-500/30 bg-red-900/10">
                                                <div className="text-red-400">Error rendering Arroyo Card: {String(error)}</div>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>

                            {/* Astrological Chart (Spans 2 columns) */}
                            {showChart && (
                                <div className="lg:col-span-2 flex">
                                    {console.log('[RENDER.11] Astrological Chart rendering - Second row')}
                                    {(() => {
                                        try {
                                            return <AstrologicalChartCard data={results.birthAnalysis} />;
                                        } catch (error) {
                                            console.error('[RENDER] Error rendering Chart Card:', error);
                                            return (
                                                <div className="w-full h-full p-6 rounded-2xl border border-red-500/30 bg-red-900/10">
                                                    <div className="text-red-400">Error rendering Chart Card: {String(error)}</div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className="mt-12 bg-space-800/30 border border-space-700 rounded-xl p-8 text-center">
                            <h3 className="text-xl font-semibold text-white mb-4">Analysis Summary</h3>
                            <p className="text-gray-300 max-w-3xl mx-auto">
                                At your birth in <span className="text-amber-400">{birthData.city}</span>, the True Solar Time differed from Civil Time by <span className="text-amber-400">{results.birthAnalysis.equationOfTime}</span>.
                                Your next exact Solar Return occurs on {String(results.birthAnalysis.nextSolarReturn || "").includes('T') ? results.birthAnalysis.nextSolarReturn!.split('T')[0] : results.birthAnalysis.nextSolarReturn}.
                                To experience the sky exactly as it was when you were born, consider traveling to <span className="text-space-glow font-bold">{results.perfectAlignment.city}, {results.perfectAlignment.country}</span>.
                            </p>
                        </div>
                    </div>
                )}

            </main>

            {/* Footer / Credits */}
            <footer className="border-t border-space-800 bg-space-900/80 py-8 mt-12">
                <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
                    <p className="text-gray-500 text-sm">
                        Based on "Know Your Real Birthday: Astronomical Computation and Geospatial-Temporal Analytics"
                    </p>
                    <p className="text-gray-600 text-xs">
                        Credits to <a href="https://towardsdatascience.com/author/kcpub21/" target="_blank" rel="noreferrer" className="text-space-accent hover:underline">kcpub21</a> on Towards Data Science.
                    </p>
                    <p className="text-gray-600 text-xs pt-4">
                        Generated with Gemini 2.5 Flash API • Precision Standard: DE421 Ephemeris
                    </p>

                    <div className="pt-6 border-t border-space-800/50 mt-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <span>Created by</span>
                            <a href="https://github.com/NetoRibeiro/" target="_blank" rel="noreferrer" className="text-space-accent hover:text-white hover:underline transition-colors">
                                NetoRibeiro
                            </a>
                        </div>
                        <span className="hidden md:inline text-space-700">•</span>
                        <a href="https://github.com/NetoRibeiro/GeoAstro-Compute" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors group">
                            <Github size={14} className="group-hover:text-space-accent transition-colors" />
                            <span className="group-hover:underline">View Repository</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;