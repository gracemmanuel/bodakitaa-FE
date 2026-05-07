import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  MapPin, Phone, Star, Clock, ChevronRight, CheckCircle2,
  Navigation, X, Loader2, AlertCircle, RefreshCcw, User, Bike
} from 'lucide-react';
import CombinedNav from '../components/CombinedNav';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  GET_PENDING_RIDE_REQUESTS,
  GET_ACTIVE_RIDE_FOR_RIDER,
  ACCEPT_RIDE, START_RIDE, COMPLETE_RIDE, UPDATE_RIDER_LOCATION
} from '../api/queries';

// ─── Haversine distance ───────────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// ─── Draw OSRM route on map ───────────────────────────────────────────────────
async function drawRoute(
  map: L.Map,
  from: [number, number],
  to: [number, number],
  color: string,
  layerRef: React.MutableRefObject<L.Polyline | null>
) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      if (layerRef.current) { map.removeLayer(layerRef.current); }
      const coords: [number, number][] = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
      layerRef.current = L.polyline(coords, { color, weight: 5, opacity: 0.85 }).addTo(map);
      map.fitBounds(layerRef.current.getBounds(), { padding: [60, 60] });
    }
  } catch (e) { /* silent */ }
}

// ─── Request Card ─────────────────────────────────────────────────────────────
const RequestCard: React.FC<{
  ride: any; riderPos: [number, number]; isSelected: boolean;
  onSelect: () => void; onAccept: () => void; accepting: boolean;
}> = ({ ride, riderPos, isSelected, onSelect, onAccept, accepting }) => {
  const distToPickup = haversine(riderPos[0], riderPos[1], parseFloat(ride.pickupLat), parseFloat(ride.pickupLng));
  const rideDist = haversine(parseFloat(ride.pickupLat), parseFloat(ride.pickupLng), parseFloat(ride.destinationLat), parseFloat(ride.destinationLng));
  const fare = parseFloat(ride.totalFare || ride.baseFare || 0);

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${isSelected
        ? 'border-primary-light shadow-xl shadow-primary-light/20 bg-white dark:bg-white/10'
        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary-light/50'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-slate-500" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{ride.client?.fullName || 'Client'}</p>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star size={10} className="fill-current" /> {parseFloat(ride.client?.rating || 5).toFixed(1)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-green-500 text-base">TZS {fare.toLocaleString()}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ride.rideType === 'delivery' ? 'bg-blue-500/20 text-blue-500' : 'bg-primary-light/20 text-primary-light'}`}>
              {ride.rideType === 'delivery' ? 'Delivery' : 'Ride'}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0 mt-0.5 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>
            <p className="text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">{ride.pickupAddress}</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-primary-light flex-shrink-0 mt-0.5 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>
            <p className="text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">{ride.destinationAddress}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><Navigation size={11} className="text-blue-500" />{fmtDist(distToPickup)} away</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Bike size={11} className="text-primary-light" />{fmtDist(rideDist)} ride</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={11} />{new Date(ride.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {isSelected && (
        <div className="px-4 pb-4 flex gap-2">
          {ride.client?.phone && (
            <a href={`tel:${ride.client.phone}`} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
              <Phone size={14} /> Call
            </a>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(); }}
            disabled={accepting}
            className="flex-1 py-2.5 rounded-xl bg-primary-light text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-light/90 transition-colors disabled:opacity-60"
          >
            {accepting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Accept Ride
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Active Ride Panel ────────────────────────────────────────────────────────
const ActiveRidePanel: React.FC<{
  ride: any;
  riderPos: [number, number];
  onStart: () => void;
  onComplete: () => void;
  startingRide: boolean;
  completingRide: boolean;
}> = ({ ride, riderPos, onStart, onComplete, startingRide, completingRide }) => {
  const distToPickup = haversine(riderPos[0], riderPos[1], parseFloat(ride.pickupLat), parseFloat(ride.pickupLng));
  const isInProgress = ride.status === 'in_progress';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isInProgress ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        {isInProgress ? 'Journey In Progress' : 'Ride Accepted — Head to Pickup'}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.client?.fullName}`} className="w-12 h-12 rounded-xl bg-slate-700" alt="client" />
          <div className="flex-1">
            <p className="font-bold">{ride.client?.fullName}</p>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star size={11} className="fill-current" /> {parseFloat(ride.client?.rating || 5).toFixed(1)}
            </div>
          </div>
          {ride.client?.phone && (
            <a href={`tel:${ride.client.phone}`} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Phone size={16} />
            </a>
          )}
        </div>

        <div className="space-y-2 text-sm bg-white/5 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0" />
            <p className="text-slate-300 line-clamp-2">{ride.pickupAddress}</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-light mt-1 flex-shrink-0" />
            <p className="text-slate-300 line-clamp-2">{ride.destinationAddress}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1"><Navigation size={12} /> {isInProgress ? 'En route' : `${fmtDist(distToPickup)} to pickup`}</span>
          <span className="font-black text-green-400 text-base">TZS {parseFloat(ride.totalFare || 0).toLocaleString()}</span>
        </div>

        {!isInProgress ? (
          <button
            onClick={onStart}
            disabled={startingRide}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
          >
            {startingRide ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Confirm Pickup — Start Journey
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={completingRide}
            className="w-full py-3 bg-primary-light hover:bg-primary-light/90 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-light/30"
          >
            {completingRide ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Complete Ride — Arrived!
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const RiderRequestsPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);

  const [riderPos, setRiderPos] = useState<[number, number] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Geolocation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const cached = localStorage.getItem('boda_cached_location');
    if (cached) {
      try { setRiderPos(JSON.parse(cached)); } catch { /* */ }
    }
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude];
        setRiderPos(pos);
        localStorage.setItem('boda_cached_location', JSON.stringify(pos));
      }, undefined, { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // ── Map init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    const center = riderPos || [-6.7924, 39.2083];
    mapRef.current = L.map(mapContainer.current, { center, zoom: 14, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);
  }, []);

  // ── Rider position marker ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !riderPos) return;
    const icon = L.divIcon({
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: `
        <div style="position:relative;width:40px;height:40px;">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            border:2px solid rgba(247,119,67,0.5);
            animation:leaflet-ping 1.8s ease-out infinite;
          "></div>
          <div style="
            position:absolute;inset:4px;background:#FE7743;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            border:2px solid white;box-shadow:0 4px 12px rgba(247,119,67,0.5);
            font-size:14px;
          ">🏍</div>
        </div>`,
    });
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(riderPos);
    } else {
      riderMarkerRef.current = L.marker(riderPos, { icon }).addTo(mapRef.current).bindPopup('Your position');
      mapRef.current.setView(riderPos, 14);
    }
  }, [riderPos]);

  // ── Fetch pending requests (poll every 10s) ───────────────────────────────
  const { data: pendingData, loading: pendingLoading, refetch, error: queryError } = useQuery(GET_PENDING_RIDE_REQUESTS, {
    variables: { 
      riderLat: riderPos?.[0] ?? -6.7924, 
      riderLng: riderPos?.[1] ?? 39.2083 
    },
    pollInterval: 5000, // Reduced to 5s for better responsiveness during testing
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (queryError) {
      console.error("Pending Rides Query Error:", queryError);
    }
  }, [queryError]);

  // ── Fetch active ride on mount & poll for status changes (e.g. cancellation) ──
  const { data: activeData, refetch: refetchActive } = useQuery(GET_ACTIVE_RIDE_FOR_RIDER, { 
    fetchPolicy: 'network-only',
    pollInterval: 5000 
  });
  useEffect(() => {
    if (activeData?.myAcceptedRide) {
      setActiveRide(activeData.myAcceptedRide);
    } else {
      setActiveRide(null);
    }
  }, [activeData]);

  const pendingRides: any[] = pendingData?.pendingRideRequests ?? [];
  const selectedRide = pendingRides.find(r => r.id === selectedId) ?? null;

  // ── Draw route when selection changes ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !riderPos) return;
    // Clear old markers
    if (pickupMarkerRef.current) { mapRef.current.removeLayer(pickupMarkerRef.current); pickupMarkerRef.current = null; }
    if (destMarkerRef.current) { mapRef.current.removeLayer(destMarkerRef.current); destMarkerRef.current = null; }

    if (selectedRide) {
      const pickup: [number, number] = [parseFloat(selectedRide.pickupLat), parseFloat(selectedRide.pickupLng)];
      const dest: [number, number] = [parseFloat(selectedRide.destinationLat), parseFloat(selectedRide.destinationLng)];

      const pickupIcon = L.divIcon({
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:32px;height:32px;background:#22c55e;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              border:3px solid white;box-shadow:0 4px 16px rgba(34,197,94,0.6);
              font-size:14px;
            ">📍</div>
            <div style="width:2px;height:8px;background:#22c55e;margin-top:1px;"></div>
          </div>`,
      });

      const destIcon = L.divIcon({
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:32px;height:32px;background:#FE7743;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              border:3px solid white;box-shadow:0 4px 16px rgba(254,119,67,0.6);
              font-size:14px;
            ">🏁</div>
            <div style="width:2px;height:8px;background:#FE7743;margin-top:1px;"></div>
          </div>`,
      });
      pickupMarkerRef.current = L.marker(pickup, { icon: pickupIcon }).addTo(mapRef.current!).bindPopup('Pickup');
      destMarkerRef.current = L.marker(dest, { icon: destIcon }).addTo(mapRef.current!).bindPopup('Destination');

      drawRoute(mapRef.current, riderPos, pickup, '#3b82f6', routeLayerRef);
    } else if (activeRide) {
      const pickup: [number, number] = [parseFloat(activeRide.pickupLat), parseFloat(activeRide.pickupLng)];
      const dest: [number, number] = [parseFloat(activeRide.destinationLat), parseFloat(activeRide.destinationLng)];
      const pickupIcon = L.divIcon({
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:32px;height:32px;background:#22c55e;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              border:3px solid white;box-shadow:0 4px 16px rgba(34,197,94,0.6);
              font-size:14px;
            ">📍</div>
            <div style="width:2px;height:8px;background:#22c55e;margin-top:1px;"></div>
          </div>`,
      });

      const destIcon = L.divIcon({
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:32px;height:32px;background:#FE7743;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              border:3px solid white;box-shadow:0 4px 16px rgba(254,119,67,0.6);
              font-size:14px;
            ">🏁</div>
            <div style="width:2px;height:8px;background:#FE7743;margin-top:1px;"></div>
          </div>`,
      });
      pickupMarkerRef.current = L.marker(pickup, { icon: pickupIcon }).addTo(mapRef.current!).bindPopup('Pickup');
      destMarkerRef.current = L.marker(dest, { icon: destIcon }).addTo(mapRef.current!).bindPopup('Destination');

      if (activeRide.status === 'accepted') {
        drawRoute(mapRef.current, riderPos, pickup, '#3b82f6', routeLayerRef); // route to pickup
      } else {
        drawRoute(mapRef.current, pickup, dest, '#22c55e', routeLayerRef); // actual client route
      }
    } else {
      if (routeLayerRef.current) { mapRef.current.removeLayer(routeLayerRef.current); routeLayerRef.current = null; }
    }
  }, [selectedRide, activeRide, riderPos]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [acceptRide, { loading: accepting }] = useMutation(ACCEPT_RIDE);
  const [startRide, { loading: startingRide }] = useMutation(START_RIDE);
  const [completeRide, { loading: completingRide }] = useMutation(COMPLETE_RIDE);
  const [updateRiderLocation] = useMutation(UPDATE_RIDER_LOCATION);

  // ── Broadcast rider location every 8s while ride is active ───────────────
  useEffect(() => {
    if (!activeRide || !riderPos) return;
    const rideId = parseInt(activeRide.id);
    // Send immediately on change
    updateRiderLocation({ variables: { rideId, lat: riderPos[0], lng: riderPos[1] } }).catch(() => {});
    const interval = setInterval(() => {
      if (riderPos) {
        updateRiderLocation({ variables: { rideId, lat: riderPos[0], lng: riderPos[1] } }).catch(() => {});
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [activeRide?.id, riderPos, updateRiderLocation]);

  const handleAccept = useCallback(async () => {
    if (!selectedRide) return;
    try {
      const { data } = await acceptRide({ variables: { rideId: parseInt(selectedRide.id) } });
      if (data?.acceptRide?.success) {
        setActiveRide(data.acceptRide.ride);
        setSelectedId(null);
        showToast('Ride accepted! Head to the pickup location.');
        refetch();
        refetchActive();
      } else {
        showToast(data?.acceptRide?.message || 'Could not accept ride.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Network error.', 'error');
    }
  }, [selectedRide, acceptRide, refetch, refetchActive]);

  const handleStart = useCallback(async () => {
    if (!activeRide) return;
    try {
      const { data } = await startRide({ variables: { rideId: parseInt(activeRide.id) } });
      if (data?.startRide?.success) {
        setActiveRide((prev: any) => ({ ...prev, status: 'in_progress' }));
        showToast('Journey started! Follow the route to the destination.');
      } else {
        showToast(data?.startRide?.message || 'Error.', 'error');
      }
    } catch (e: any) { showToast(e.message, 'error'); }
  }, [activeRide, startRide]);

  const handleComplete = useCallback(async () => {
    if (!activeRide) return;
    try {
      const { data } = await completeRide({ variables: { rideId: parseInt(activeRide.id) } });
      if (data?.completeRide?.success) {
        showToast(`Ride completed! Fare: TZS ${parseFloat(activeRide.totalFare || 0).toLocaleString()}`);
        setActiveRide(null);
        // Clear map overlays
        if (pickupMarkerRef.current && mapRef.current) { mapRef.current.removeLayer(pickupMarkerRef.current); pickupMarkerRef.current = null; }
        if (destMarkerRef.current && mapRef.current) { mapRef.current.removeLayer(destMarkerRef.current); destMarkerRef.current = null; }
        if (routeLayerRef.current && mapRef.current) { mapRef.current.removeLayer(routeLayerRef.current); routeLayerRef.current = null; }
        refetch();
      } else {
        showToast(data?.completeRide?.message || 'Error.', 'error');
      }
    } catch (e: any) { showToast(e.message, 'error'); }
  }, [activeRide, completeRide, refetch]);

  return (
    <CombinedNav role="rider">
      <style>{`
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution { 
          background: rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(8px);
          border-radius: 8px !important;
          color: rgba(255,255,255,0.6) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #FE7743 !important; }
        
        @keyframes leaflet-ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Requests</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {activeRide ? 'You have an active ride in progress.' : `${pendingRides.length} pending requests near you`}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <RefreshCcw size={14} className={pendingLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <div ref={mapContainer} className="w-full h-[420px] xl:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10" />
          </div>

          {/* Right Panel */}
          <div className="xl:col-span-1 flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {/* Active ride */}
            {activeRide && (
              <ActiveRidePanel
                ride={activeRide}
                riderPos={riderPos ?? [-6.7924, 39.2083]}
                onStart={handleStart}
                onComplete={handleComplete}
                startingRide={startingRide}
                completingRide={completingRide}
              />
            )}

            {/* Pending list */}
            {!activeRide && (
              <>
                {pendingLoading && pendingRides.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                    <Loader2 size={28} className="animate-spin text-primary-light" />
                    <p className="text-sm font-semibold">Scanning nearby requests…</p>
                  </div>
                ) : pendingRides.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-400 p-6 text-center">
                    <div className="relative">
                      <MapPin size={48} className="opacity-20" />
                      {!riderPos && <AlertCircle size={20} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-600 dark:text-slate-300">No pending requests nearby</p>
                      <p className="text-xs mt-1 leading-relaxed">
                        {!riderPos 
                          ? "Location access is disabled. We're showing results for Dar es Salaam. Please enable GPS for better accuracy." 
                          : "Pull to refresh or wait — new requests will appear here automatically."}
                      </p>
                    </div>
                    {!riderPos && (
                      <button 
                        onClick={() => window.location.reload()}
                        className="text-[10px] font-black uppercase tracking-widest text-primary-light bg-primary-light/10 px-3 py-1.5 rounded-lg hover:bg-primary-light hover:text-white transition-all"
                      >
                        Try enabling GPS
                      </button>
                    )}
                  </div>
                ) : (
                  pendingRides.map((ride: any) => (
                    <RequestCard
                      key={ride.id}
                      ride={ride}
                      riderPos={riderPos ?? [-6.7924, 39.2083]}
                      isSelected={selectedId === ride.id}
                      onSelect={() => setSelectedId(prev => prev === ride.id ? null : ride.id)}
                      onAccept={handleAccept}
                      accepting={accepting}
                    />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default RiderRequestsPage;
