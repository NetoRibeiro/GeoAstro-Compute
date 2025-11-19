import React, { useState } from 'react';
import { AstroInput, BirthAnalysis, AstroAnalysis, PerfectAlignment, AnalysisStatus } from './types';
import { analyzeAstroData, resolveLocationFromGeo } from './services/geminiService';
import StarBackground from './components/StarBackground';
import InputForm from './components/InputForm';
import AstroCard from './components/AstroCard';
import AlignmentCard from './components/AlignmentCard';
import { Rocket, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [birthData, setBirthData] = useState<AstroInput>({
    city: '', state: '', country: '', date: '', time: '', temperature: '', useHistoricalTemperature: false
  });
  
  const [currentData, setCurrentData] = useState<AstroInput>({
    city: '', state: '', country: '', date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit'}),
    temperature: '', useHistoricalTemperature: false
  });

  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [results, setResults] = useState<{ birthAnalysis: BirthAnalysis; currentAnalysis: AstroAnalysis; perfectAlignment: PerfectAlignment } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

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
            time: now.toLocaleTimeString('en-GB', {hour12: false}),
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
    // Validation: Ensure Location, Country, Date, and Time are present
    if (!birthData.city || !birthData.country || !birthData.date || !birthData.time || 
        !currentData.city || !currentData.country) {
        setErrorMsg("Please fill in all required fields (Location, Country, Date, Time) for both sections.");
        return;
    }

    setStatus(AnalysisStatus.LOADING);
    setErrorMsg(null);
    setResults(null);

    try {
        const data = await analyzeAstroData(birthData, currentData);
        setResults(data);
        setStatus(AnalysisStatus.SUCCESS);
        
        // Scroll to results
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (e) {
        console.error(e);
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
        <div className="flex flex-col items-center justify-center mb-16">
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
        </div>

        {/* Results Section */}
        {results && (
            <div id="results-section" className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <AstroCard type="birth" data={results.birthAnalysis} />
                    <AstroCard type="current" data={results.currentAnalysis} />
                    <AlignmentCard data={results.perfectAlignment} />
                </div>
                
                <div className="mt-12 bg-space-800/30 border border-space-700 rounded-xl p-8 text-center">
                     <h3 className="text-xl font-semibold text-white mb-4">Analysis Summary</h3>
                     <p className="text-gray-300 max-w-3xl mx-auto">
                        At your birth in <span className="text-amber-400">{birthData.city}</span>, the True Solar Time differed from Civil Time by <span className="text-amber-400">{results.birthAnalysis.equationOfTime}</span>. 
                        Your next exact Solar Return occurs on {results.birthAnalysis.nextSolarReturn.includes('T') ? results.birthAnalysis.nextSolarReturn.split('T')[0] : results.birthAnalysis.nextSolarReturn}.
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
                Generated with Gemini 2.5 Flash API
            </p>
         </div>
      </footer>
    </div>
  );
};

export default App;
