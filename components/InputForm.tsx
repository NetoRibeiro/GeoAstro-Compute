import React from 'react';
import { MapPin, Calendar, Clock, Locate, Globe, Map, Thermometer } from 'lucide-react';
import { AstroInput } from '../types';
import { COUNTRIES, STATES_BY_COUNTRY } from '../data/locations';

interface InputFormProps {
  title: string;
  data: AstroInput;
  onChange: (field: keyof AstroInput, value: any) => void;
  onGetCurrentLocation?: () => void;
  isLoadingLocation?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ title, data, onChange, onGetCurrentLocation, isLoadingLocation }) => {
  
  const availableStates = STATES_BY_COUNTRY[data.country] || [];
  const hasDefinedStates = availableStates.length > 0;

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange('country', e.target.value);
    // Reset state when country changes
    onChange('state', '');
  };

  return (
    <div className="bg-space-700/50 backdrop-blur-md border border-space-600 p-6 rounded-2xl shadow-xl hover:border-space-accent/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-space-600 pb-3">
        <h3 className="text-xl font-semibold text-space-glow tracking-wide uppercase">{title}</h3>
        {onGetCurrentLocation && (
          <button
            onClick={onGetCurrentLocation}
            disabled={isLoadingLocation}
            className="flex items-center gap-2 text-xs bg-space-600 hover:bg-space-accent text-white px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            <Locate size={14} />
            {isLoadingLocation ? 'Locating...' : 'Use Current'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Location: City & Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="relative group">
            <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Country</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 text-space-accent/50" size={18} />
              <select
                value={data.country}
                onChange={handleCountryChange}
                className="w-full bg-space-800 border border-space-600 text-white pl-10 pr-8 py-2.5 rounded-lg focus:ring-2 focus:ring-space-accent focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-500">Select Country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-space-accent" size={18} />
              <input
                type="text"
                value={data.city}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="e.g. New York"
                className="w-full bg-space-800 border border-space-600 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-space-accent focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* State / Province */}
         <div className="relative group">
            <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">State / Province</label>
            <div className="relative">
              <Map className="absolute left-3 top-3 text-space-accent/50" size={18} />
              {hasDefinedStates ? (
                 <>
                  <select
                    value={data.state}
                    onChange={(e) => onChange('state', e.target.value)}
                    className="w-full bg-space-800 border border-space-600 text-white pl-10 pr-8 py-2.5 rounded-lg focus:ring-2 focus:ring-space-accent focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="text-gray-500">Select State / Region</option>
                    {availableStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                 </>
              ) : (
                <input
                  type="text"
                  value={data.state}
                  onChange={(e) => onChange('state', e.target.value)}
                  placeholder={data.country ? "Enter State / Province manually" : "Select Country first"}
                  className="w-full bg-space-800 border border-space-600 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-space-accent focus:border-transparent outline-none transition-all"
                />
              )}
            </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="relative">
            <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-space-accent" size={18} />
              <input
                type="date"
                value={data.date}
                onChange={(e) => onChange('date', e.target.value)}
                className="w-full bg-space-800 border border-space-600 text-white pl-10 pr-2 py-2.5 rounded-lg focus:ring-2 focus:ring-space-accent focus:border-transparent outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-space-accent" size={18} />
              <input
                type="time"
                step="1"
                value={data.time}
                onChange={(e) => onChange('time', e.target.value)}
                className="w-full bg-space-800 border border-space-600 text-white pl-10 pr-2 py-2.5 rounded-lg focus:ring-2 focus:ring-space-accent focus:border-transparent outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
        </div>

        {/* Temperature Option */}
        <div className="pt-2 mt-2 border-t border-space-600/50">
           <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider">Temperature (°C)</label>
              <div className="flex items-center gap-2">
                  <input 
                      type="checkbox" 
                      id={`hist-temp-${title}`}
                      checked={data.useHistoricalTemperature || false}
                      onChange={(e) => onChange('useHistoricalTemperature', e.target.checked)}
                      className="w-3 h-3 rounded border-space-500 bg-space-800 text-space-accent focus:ring-space-accent cursor-pointer"
                  />
                  <label htmlFor={`hist-temp-${title}`} className="text-xs text-gray-400 cursor-pointer select-none hover:text-white transition-colors">Use Historical Avg.</label>
              </div>
           </div>
           <div className="relative">
              <Thermometer className={`absolute left-3 top-3 transition-colors ${data.useHistoricalTemperature ? 'text-gray-500' : 'text-space-accent'}`} size={18} />
              <input
                type="text"
                value={data.useHistoricalTemperature ? '' : data.temperature || ''}
                disabled={data.useHistoricalTemperature}
                onChange={(e) => onChange('temperature', e.target.value)}
                placeholder={data.useHistoricalTemperature ? "Auto-calculating historical average..." : "e.g. 22"}
                className={`w-full bg-space-800 border border-space-600 text-white pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all ${data.useHistoricalTemperature ? 'opacity-50 cursor-not-allowed placeholder-gray-500' : 'focus:ring-2 focus:ring-space-accent focus:border-transparent'}`}
              />
           </div>
        </div>

      </div>
    </div>
  );
};

export default InputForm;