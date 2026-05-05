import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, X, Clock, Shield, 
  Bike, Star, CheckCircle2, CreditCard, ChevronDown,
  Map as MapIcon, Info, ChevronRight, AlertCircle, RefreshCcw, Zap
} from 'lucide-react';
import gsap from 'gsap';

interface BookRideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RideType = 'ride' | 'delivery';

const BookRideModal: React.FC<BookRideModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [vehicleType, setVehicleType] = useState<RideType>('ride');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [estimate, setEstimate] = useState<{ fare: number, distance: number } | null>(null);
  const [createdRide, setCreatedRide] = useState<any>(null);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number, lng: number }>({ lat: -6.7924, lng: 39.2083 });
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number, lng: number }>({ lat: -6.8235, lng: 39.2695 });
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (pickup && destination) {
        try {
          const { graphqlClient } = await import('../api/index');
          const estimateMutation = `
            mutation($pickupLat: Float!, $pickupLng: Float!, $destinationLat: Float!, $destinationLng: Float!, $vehicleType: String!) {
              estimateRide(pickupLat: $pickupLat, pickupLng: $pickupLng, destinationLat: $destinationLat, destinationLng: $destinationLng, vehicleType: $vehicleType) {
                estimate {
                  estimatedDistanceKm
                  estimatedFareTzs
                }
              }
            }
          `;
          const data = await graphqlClient(estimateMutation, {
            pickupLat: pickupCoords.lat,
            pickupLng: pickupCoords.lng,
            destinationLat: destinationCoords.lat,
            destinationLng: destinationCoords.lng,
            vehicleType: vehicleType
          });
          setEstimate({ fare: data.estimateRide.estimate.estimatedFareTzs, distance: data.estimateRide.estimate.estimatedDistanceKm });
        } catch (error) {
          console.error("Estimate error", error);
        }
      } else {
        setEstimate(null);
      }
    };
    const timeoutId = setTimeout(fetchEstimate, 500);
    return () => clearTimeout(timeoutId);
  }, [pickup, destination]);

  useEffect(() => {
    if (isOpen) {
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { scale: 0.9, opacity: 0, y: 20 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.3, onComplete: onClose });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const { graphqlClient } = await import('../api/index');
      const requestMutation = `
        mutation($pickupAddress: String!, $destinationAddress: String!, $pickupLat: Float!, $pickupLng: Float!, $destinationLat: Float!, $destinationLng: Float!, $vehicleType: String!) {
          requestRide(pickupAddress: $pickupAddress, destinationAddress: $destinationAddress, pickupLat: $pickupLat, pickupLng: $pickupLng, destinationLat: $destinationLat, destinationLng: $destinationLng, vehicleType: $vehicleType) {
            ride {
              id
              pickupAddress
              destinationAddress
            }
          }
        }
      `;
      const data = await graphqlClient(requestMutation, {
        pickupAddress: pickup,
        destinationAddress: destination,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        destinationLat: destinationCoords.lat,
        destinationLng: destinationCoords.lng,
        vehicleType: vehicleType
      });
      setCreatedRide({
        id: data.requestRide.ride.id,
        pickup_address: data.requestRide.ride.pickupAddress,
        destination_address: data.requestRide.ride.destinationAddress
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
        window.location.reload(); // Quick refresh to show new ride in list
      }, 2500);
    } catch (error) {
      console.error("Booking error", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    
    const success = async (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      setPickupCoords({ lat: latitude, lng: longitude });
      
      try {
        // Use OSM Nominatim for reverse geocoding (free)
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        setPickup(data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      } catch (err) {
        setPickup(`My Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      } finally {
        setIsLocating(false);
      }
    };

    const error = () => {
      alert("Unable to retrieve your location. Please check permissions.");
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, { 
      enableHighAccuracy: true,
      timeout: 10000 
    });
  };

  if (!isOpen && !isSuccess) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md opacity-0"
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden"
      >
        {isSuccess ? (
          <div className="p-12 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Ride Booked!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              Your ride has been requested. Waiting for a rider to accept.
            </p>
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/5 flex items-center gap-4 text-left">
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white">Ride #{createdRide?.id}</p>
                <p className="text-xs text-slate-500">{createdRide?.pickup_address} → {createdRide?.destination_address}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-0 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light/10 text-primary-light rounded-2xl flex items-center justify-center">
                  <Bike size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Book a Ride</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fast & Secure Booking</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Location Selection */}
              <div className="space-y-4 relative">
                <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-slate-200 dark:bg-slate-800 border-dashed border-l-2" />
                
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors">
                    <MapPin size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Pickup Location" 
                    className="w-full pl-12 pr-28 py-4 bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary-light transition-all text-slate-900 dark:text-white"
                  />
                  <button 
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-light text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    {isLocating ? <RefreshCcw size={14} className="animate-spin" /> : <Navigation size={14} />}
                    {isLocating ? 'Locating...' : 'Current Location'}
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors">
                    <Navigation size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where are you going?" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary-light transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>


              {/* Vehicle Type */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setVehicleType('ride')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${vehicleType === 'ride' ? 'border-primary-light bg-primary-light/5' : 'border-slate-100 dark:border-white/5'}`}
                >
                  <Bike size={24} className={vehicleType === 'ride' ? 'text-primary-light' : 'text-slate-400'} />
                  <span className="text-xs font-black uppercase tracking-widest">Ride</span>
                </button>
                <button 
                  onClick={() => setVehicleType('delivery')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${vehicleType === 'delivery' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-100 dark:border-white/5'}`}
                >
                  <Zap size={24} className={vehicleType === 'delivery' ? 'text-amber-500' : 'text-slate-400'} />
                  <span className="text-xs font-black uppercase tracking-widest">Delivery</span>
                </button>
              </div>

              {/* Payment & Estimates */}
              <div className="bg-slate-50 dark:bg-black/40 rounded-3xl p-5 border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-primary-light" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="bg-transparent text-sm font-black text-primary-light focus:outline-none cursor-pointer text-right appearance-none"
                    >
                      <option value="Cash" className="text-slate-900 bg-white">Cash Only</option>
                    </select>
                    <ChevronDown size={14} className="text-primary-light pointer-events-none" />
                  </div>
                </div>
                
                <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />

                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase mb-1">
                      <Clock size={12} /> Estimated Distance
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{estimate ? `${estimate.distance.toFixed(1)} km` : '--'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Estimated Fare</div>
                    <p className="text-2xl font-black text-primary-light">
                      {estimate ? `TZS ${estimate.fare.toLocaleString()}` : '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400">
                <Shield size={20} />
                <p className="text-xs font-medium">Your ride is insured and tracked for your safety.</p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConfirm}
                disabled={isConfirming || !pickup || !destination}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                  isConfirming || !pickup || !destination
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-primary-light text-white shadow-[0_15px_30px_-10px_rgba(254,119,67,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(254,119,67,0.6)] hover:-translate-y-1'
                }`}
              >
                {isConfirming ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching for Riders...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookRideModal;
