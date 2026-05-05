import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Navigation, Clock, Shield, Bike, Star, 
  CheckCircle2, CreditCard, ArrowRight, Zap, Award, AlertCircle, RefreshCcw, Plus, X
} from 'lucide-react';
import CombinedNav from '../components/CombinedNav';
import MapComponent from '../components/MapComponent';
import { graphqlClient } from '../api';

// --- Types ---
type VehicleType = 'economy' | 'deluxe' | 'express';

interface RideEstimate {
  fare: number;
  distance: number;
  time: string;
}

interface Coords {
  lat: number;
  lng: number;
}

// --- Nominatim reverse geocoding (free, no API key) ---
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

// --- OSRM distance/duration estimate (free, no API key) ---
const getOSRMEstimate = async (
  pLat: number, pLng: number,
  dLat: number, dLng: number
): Promise<{ distanceKm: number; durationMin: number } | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=false`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.routes?.length > 0) {
      return {
        distanceKm: json.routes[0].distance / 1000,
        durationMin: Math.ceil(json.routes[0].duration / 60),
      };
    }
    return null;
  } catch {
    return null;
  }
};

const FARE_RATE: Record<VehicleType, number> = { economy: 700, deluxe: 1200, express: 1800 };

const vehicleOptions: { id: VehicleType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: 'ride' as any, label: 'Ride', desc: 'Standard Boda Journey', icon: Bike, color: 'text-primary-light' },
  { id: 'delivery' as any, label: 'Delivery', desc: 'Fast Goods Delivery', icon: Zap, color: 'text-amber-500' },
];

const RequestRidePage: React.FC = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [destCoords, setDestCoords] = useState<Coords | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('economy');
  const [estimate, setEstimate] = useState<RideEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination' | number>('pickup');
  const [isLocating, setIsLocating] = useState(false);
  const [midwayStops, setMidwayStops] = useState<{ id: string; address: string; coords: Coords | null }[]>([]);


  // Calculate estimate whenever both coords or vehicle type change
  useEffect(() => {
    if (!pickupCoords || !destCoords) {
      setEstimate(null);
      return;
    }
    const calc = async () => {
      setIsEstimating(true);
      
      const waypoints = [
        pickupCoords,
        ...midwayStops.filter(s => s.coords).map(s => s.coords as Coords),
        destCoords
      ];

      const coordsString = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
      
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=false`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.routes?.length > 0) {
          const dist = json.routes[0].distance / 1000;
          const dur = Math.ceil(json.routes[0].duration / 60);
          const rate = vehicleType === ('delivery' as any) ? 1000 : 700;
          const fare = Math.max(Math.round(dist * rate), 1500);
          
          setEstimate({
            fare,
            distance: dist,
            time: `${dur} min`,
          });
        }
      } catch (err) {
        console.error("OSRM error", err);
      }
      setIsEstimating(false);
    };
    calc();
  }, [pickupCoords, destCoords, midwayStops, vehicleType]);

  // Handle map click -> reverse geocode -> fill input
  const handleMapClick = useCallback(async (lat: number, lng: number, type: 'pickup' | 'destination' | number) => {
    const address = await reverseGeocode(lat, lng);
    if (type === 'pickup') {
      setPickup(address);
      setPickupCoords({ lat, lng });
      setActiveInput(midwayStops.length > 0 ? 0 : 'destination');
    } else if (type === 'destination') {
      setDestination(address);
      setDestCoords({ lat, lng });
    } else if (typeof type === 'number') {
      const newStops = [...midwayStops];
      newStops[type] = { ...newStops[type], address, coords: { lat, lng } };
      setMidwayStops(newStops);
      setActiveInput(type + 1 < midwayStops.length ? type + 1 : 'destination');
    }
  }, [midwayStops]);

  const addMidwayStop = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setMidwayStops([...midwayStops, { id, address: '', coords: null }]);
    setActiveInput(midwayStops.length);
  };

  const removeMidwayStop = (id: string) => {
    setMidwayStops(midwayStops.filter(s => s.id !== id));
  };

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    
    const success = async (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      setPickupCoords({ lat: latitude, lng: longitude });
      const address = await reverseGeocode(latitude, longitude);
      setPickup(address);
      setIsLocating(false);
      setActiveInput('destination');
    };

    const error = () => {
      alert("Unable to retrieve your location. Please check permissions.");
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, { 
      enableHighAccuracy: true,
      timeout: 10000 
    });
  }, []);

  // Auto-locate on mount
  useEffect(() => {
    handleUseCurrentLocation();
  }, [handleUseCurrentLocation]);

  const handleRequestRide = async () => {
    if (!pickup || !destination) return;
    setIsRequesting(true);
    setError(null);
    try {
      const requestMutation = `
        mutation($pickupAddress: String!, $destinationAddress: String!, $pickupLat: Float!, $pickupLng: Float!, $destinationLat: Float!, $destinationLng: Float!, $vehicleType: String!, $midwayStops: String) {
          requestRide(pickupAddress: $pickupAddress, destinationAddress: $destinationAddress, pickupLat: $pickupLat, pickupLng: $pickupLng, destinationLat: $destinationLat, destinationLng: $destinationLng, vehicleType: $vehicleType, midwayStops: $midwayStops) {
            ride {
              id
              status
            }
          }
        }
      `;
      
      const formattedStops = midwayStops
        .filter(s => s.coords)
        .map(s => ({ address: s.address, lat: s.coords!.lat, lng: s.coords!.lng }));

      await graphqlClient(requestMutation, {
        pickupAddress: pickup,
        destinationAddress: destination,
        pickupLat: pickupCoords?.lat ?? -6.7924,
        pickupLng: pickupCoords?.lng ?? 39.2083,
        destinationLat: destCoords?.lat ?? -6.8235,
        destinationLng: destCoords?.lng ?? 39.2695,
        vehicleType,
        midwayStops: JSON.stringify(formattedStops)
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPickup(''); setDestination('');
        setPickupCoords(null); setDestCoords(null);
        setEstimate(null);
        setActiveInput('pickup');
      }, 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to request ride. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const mapPickup = pickupCoords ? [pickupCoords.lat, pickupCoords.lng] as [number, number] : undefined;
  const mapDest = destCoords ? [destCoords.lat, destCoords.lng] as [number, number] : undefined;

  return (
    <CombinedNav role="client">
      <div className="h-[calc(100vh-5.5rem)] flex flex-col lg:flex-row gap-5">

        {/* ── Left Panel: Booking Form ── */}
        <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-7 shadow-xl overflow-y-auto custom-scrollbar flex flex-col gap-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Request Ride</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Tap the map or type to set locations.</p>
            </div>

            {/* Location Inputs */}
            <div className="space-y-3 relative">
              <div className="absolute left-[21px] top-10 h-[calc(100%-2.5rem)] w-0.5 border-l-2 border-dashed border-slate-200 dark:border-white/10 pointer-events-none" />

              {/* Pickup */}
              <div
                className={`relative rounded-2xl border-2 transition-all ${activeInput === 'pickup' ? 'border-green-500 shadow-lg shadow-green-500/10' : 'border-slate-100 dark:border-white/5'}`}
                onClick={() => setActiveInput('pickup')}
              >
                <MapPin size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${activeInput === 'pickup' ? 'text-green-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  onFocus={() => setActiveInput('pickup')}
                  placeholder="Pickup location"
                  className="w-full pl-11 pr-28 py-4 bg-slate-50 dark:bg-black/40 rounded-2xl text-sm font-bold focus:outline-none text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary-light uppercase tracking-tighter hover:underline bg-primary-light/10 px-2 py-1.5 rounded-lg flex items-center gap-1"
                >
                  {isLocating ? <RefreshCcw size={10} className="animate-spin" /> : <Navigation size={10} />}
                  {isLocating ? 'Locating...' : 'Current'}
                </button>
              </div>

              {/* Midway Stops */}
              {midwayStops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className={`relative rounded-2xl border-2 transition-all ${activeInput === idx ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-slate-100 dark:border-white/5'}`}
                  onClick={() => setActiveInput(idx)}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-600">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={stop.address}
                    onChange={(e) => {
                      const ns = [...midwayStops];
                      ns[idx].address = e.target.value;
                      setMidwayStops(ns);
                    }}
                    onFocus={() => setActiveInput(idx)}
                    placeholder={`Midway Stop ${idx + 1}`}
                    className="w-full pl-11 pr-10 py-4 bg-slate-50 dark:bg-black/40 rounded-2xl text-sm font-bold focus:outline-none text-slate-900 dark:text-white"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeMidwayStop(stop.id); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {/* Destination */}
              <div
                className={`relative rounded-2xl border-2 transition-all ${activeInput === 'destination' ? 'border-primary-light shadow-lg shadow-primary-light/10' : 'border-slate-100 dark:border-white/5'}`}
                onClick={() => setActiveInput('destination')}
              >
                <Navigation size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${activeInput === 'destination' ? 'text-primary-light' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setActiveInput('destination')}
                  placeholder="Final Destination"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-black/40 rounded-2xl text-sm font-bold focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <button 
                onClick={addMidwayStop}
                className="flex items-center gap-2 text-xs font-black text-primary-light uppercase tracking-widest pl-5 hover:gap-3 transition-all"
              >
                <Plus size={14} />
                Add Midway Stop
              </button>
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Ride Type</h3>
              <div className="space-y-2">
                {vehicleOptions.map((v) => {
                  const fareForType = estimate
                    ? Math.max(Math.round(estimate.distance * FARE_RATE[v.id]), 1500)
                    : null;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setVehicleType(v.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        vehicleType === v.id
                          ? 'border-primary-light bg-primary-light/5 shadow-lg shadow-primary-light/5'
                          : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${vehicleType === v.id ? 'bg-primary-light text-white' : `bg-slate-100 dark:bg-white/5 ${v.color}`}`}>
                        <v.icon size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 dark:text-white text-sm">{v.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{v.desc}</p>
                      </div>
                      <div className="text-right">
                        {isEstimating ? (
                          <div className="w-16 h-4 bg-slate-100 dark:bg-white/10 rounded animate-pulse" />
                        ) : fareForType ? (
                          <>
                            <p className={`font-black text-sm ${vehicleType === v.id ? 'text-primary-light' : 'text-slate-700 dark:text-slate-300'}`}>
                              TZS {fareForType.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">{estimate?.time}</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-slate-300 font-bold">Set route</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimate Summary */}
            {estimate && (
              <div className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex justify-around animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Distance</p>
                  <p className="font-black text-slate-900 dark:text-white">{estimate.distance.toFixed(1)} km</p>
                </div>
                <div className="w-px bg-slate-200 dark:bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                  <p className="font-black text-slate-900 dark:text-white">{estimate.time}</p>
                </div>
                <div className="w-px bg-slate-200 dark:bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Fare</p>
                  <p className="font-black text-primary-light">TZS {estimate.fare.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="mt-auto space-y-4">
              {/* Payment */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Cash Payment</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Default Method</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleRequestRide}
                disabled={isRequesting || !pickup || !destination}
                className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${
                  isRequesting || !pickup || !destination
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-light text-white shadow-[0_15px_40px_-10px_rgba(254,119,67,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(254,119,67,0.6)] hover:-translate-y-1'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                {isRequesting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Calling Boda...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={24} className="animate-bounce" />
                    <span>Boda is on the way!</span>
                  </>
                ) : (
                  <>
                    <span>Request {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Safety */}
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400">
                <Shield size={18} />
                <p className="text-[10px] font-bold uppercase tracking-wider">All rides are insured & live-tracked</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Map ── */}
        <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative min-h-[350px]">
          <MapComponent
            pickupCoords={mapPickup}
            destinationCoords={mapDest}
            midwayStops={midwayStops.filter(s => s.coords).map(s => [s.coords!.lat, s.coords!.lng] as [number, number])}
            onMapClick={handleMapClick}
            activeInput={activeInput}
          />

          {/* Floating summary card when estimate ready */}
          {estimate && (
            <div className="absolute top-5 right-5 z-[500] glass px-5 py-4 rounded-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Distance</p>
                  <p className="text-xl font-black text-white">{estimate.distance.toFixed(1)} km</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">ETA</p>
                  <p className="text-xl font-black text-primary-light">{estimate.time}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CombinedNav>
  );
};

export default RequestRidePage;
