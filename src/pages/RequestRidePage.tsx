import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Navigation, Clock, Shield, Bike, Star, 
  CheckCircle2, CreditCard, ArrowRight, Zap, Award, AlertCircle
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
  { id: 'economy', label: 'Economy', desc: 'Fast & Affordable', icon: Bike, color: 'text-blue-500' },
  { id: 'deluxe', label: 'Deluxe', desc: 'Premium New Bikes', icon: Zap, color: 'text-amber-500' },
  { id: 'express', label: 'Express', desc: 'High-Speed Delivery', icon: Award, color: 'text-primary-light' },
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
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination'>('pickup');

  // Calculate estimate whenever both coords or vehicle type change
  useEffect(() => {
    if (!pickupCoords || !destCoords) {
      setEstimate(null);
      return;
    }
    const calc = async () => {
      setIsEstimating(true);
      const osrm = await getOSRMEstimate(pickupCoords.lat, pickupCoords.lng, destCoords.lat, destCoords.lng);
      if (osrm) {
        const fare = Math.round(osrm.distanceKm * FARE_RATE[vehicleType]);
        setEstimate({
          fare: Math.max(fare, 1500),
          distance: osrm.distanceKm,
          time: `${osrm.durationMin} min`,
        });
      } else {
        // Fallback haversine estimate
        const R = 6371;
        const dLat = ((destCoords.lat - pickupCoords.lat) * Math.PI) / 180;
        const dLng = ((destCoords.lng - pickupCoords.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((pickupCoords.lat * Math.PI) / 180) *
            Math.cos((destCoords.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setEstimate({
          fare: Math.max(Math.round(dist * FARE_RATE[vehicleType]), 1500),
          distance: dist,
          time: `${Math.ceil(dist * 3)} min`,
        });
      }
      setIsEstimating(false);
    };
    calc();
  }, [pickupCoords, destCoords, vehicleType]);

  // Handle map click -> reverse geocode -> fill input
  const handleMapClick = useCallback(async (lat: number, lng: number, type: 'pickup' | 'destination') => {
    const address = await reverseGeocode(lat, lng);
    if (type === 'pickup') {
      setPickup(address);
      setPickupCoords({ lat, lng });
      setActiveInput('destination');
    } else {
      setDestination(address);
      setDestCoords({ lat, lng });
    }
  }, []);

  const handleRequestRide = async () => {
    if (!pickup || !destination) return;
    setIsRequesting(true);
    setError(null);
    try {
      const requestMutation = `
        mutation($pickupAddress: String!, $destinationAddress: String!, $pickupLat: Float!, $pickupLng: Float!, $destinationLat: Float!, $destinationLng: Float!, $vehicleType: String!) {
          requestRide(pickupAddress: $pickupAddress, destinationAddress: $destinationAddress, pickupLat: $pickupLat, pickupLng: $pickupLng, destinationLat: $destinationLat, destinationLng: $destinationLng, vehicleType: $vehicleType) {
            ride {
              id
              status
            }
          }
        }
      `;
      await graphqlClient(requestMutation, {
        pickupAddress: pickup,
        destinationAddress: destination,
        pickupLat: pickupCoords?.lat ?? -6.7924,
        pickupLng: pickupCoords?.lng ?? 39.2083,
        destinationLat: destCoords?.lat ?? -6.8235,
        destinationLng: destCoords?.lng ?? 39.2695,
        vehicleType,
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
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-black/40 rounded-2xl text-sm font-bold focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

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
                  placeholder="Destination"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-black/40 rounded-2xl text-sm font-bold focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
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
