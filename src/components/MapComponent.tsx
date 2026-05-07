import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation as NavigationIcon } from 'lucide-react';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Custom colored markers ---
const createColoredMarker = (color: string) =>
  L.divIcon({
    html: `
      <div style="
        width: 24px; height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      "></div>`,
    className: '',
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const createRiderMarker = () =>
  L.divIcon({
    html: `
      <div style="
        width: 32px; height: 32px;
        background: #FE7743;
        border: 3px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 16px rgba(254,119,67,0.5);
        animation: pulse 2s infinite;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L2 12h3v8h6v-5h2v5h6v-8h3L12 2z"/>
        </svg>
      </div>`,
    className: '',
    iconAnchor: [16, 16],
  });

// ─── Custom Icon Factories ─────────────────────────────────────────────────────
const riderIcon = L.divIcon({
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  html: `
    <div style="position:relative;width:40px;height:40px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        border:2px solid rgba(254,119,67,0.5);
        animation:leaflet-ping 1.8s ease-out infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;background:#FE7743;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:2px solid white;box-shadow:0 4px 12px rgba(254,119,67,0.5);
        font-size:14px;
      ">🏍</div>
    </div>`,
});

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

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MapComponentProps {
  pickupCoords?: [number, number]; // [lat, lng]
  destinationCoords?: [number, number];
  midwayStops?: [number, number][];
  activeRiderCoords?: [number, number]; // LIVE position of the rider
  className?: string;
  onMapClick?: (lat: number, lng: number, type: 'pickup' | 'destination' | number) => void;
  activeInput?: 'pickup' | 'destination' | number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  pickupCoords,
  destinationCoords,
  midwayStops,
  activeRiderCoords,
  className,
  onMapClick,
  activeInput,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const riderMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const midwayMarkersRef = useRef<L.Marker[]>([]);
  const activeRiderMarkerRef = useRef<L.Marker | null>(null);

  // --- Initialize Map ---
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const cachedStr = localStorage.getItem('boda_cached_location');
    const defaultCenter: [number, number] = cachedStr ? JSON.parse(cachedStr) : [-6.7924, 39.2083];

    // Default center: Cached location or Dar es Salaam (Fallback)
    mapRef.current = L.map(mapContainer.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    // --- OSM Tile Layer (Free & Open Source) ---
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Custom zoom control position
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    const updateUserLocationMarker = (lat: number, lng: number) => {
      if (!mapRef.current) return;

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const userIcon = L.divIcon({
          className: '',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
              <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
            </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(mapRef.current)
          .bindPopup('<b>You are here</b>');
      }
    };

    const updateMockRiders = (lat: number, lng: number) => {
      const riderPositions: [number, number][] = [
        [lat + 0.002, lng + 0.002],
        [lat - 0.003, lng - 0.008],
        [lat + 0.008, lng + 0.007],
        [lat - 0.007, lng + 0.003],
      ];

      // Clear existing mock riders
      riderMarkersRef.current.forEach(m => m.remove());
      riderMarkersRef.current = [];

      riderPositions.forEach((pos) => {
        const m = L.marker(pos, { icon: createRiderMarker() }).addTo(mapRef.current!);
        riderMarkersRef.current.push(m);
      });
    };

    // Initially add mock riders for Dar es Salaam
    updateMockRiders(-6.7924, 39.2083);

    const getAndSetLocation = () => {
      if (navigator.geolocation) {
        // First try to get location quickly
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            if (mapRef.current) {
              const { latitude, longitude } = coords;
              localStorage.setItem('boda_cached_location', JSON.stringify([latitude, longitude]));
              console.log("Location found:", latitude, longitude);
              mapRef.current.setView([latitude, longitude], 14);
              updateUserLocationMarker(latitude, longitude);
              updateMockRiders(latitude, longitude);
            }
          },
          (err) => {
            console.warn('Initial geolocation failed, trying again with lower accuracy:', err);
            // Try again with lower accuracy if high accuracy failed (common on some devices)
            navigator.geolocation.getCurrentPosition(
              ({ coords }) => {
                if (mapRef.current) {
                  const { latitude, longitude } = coords;
                  localStorage.setItem('boda_cached_location', JSON.stringify([latitude, longitude]));
                  mapRef.current.setView([latitude, longitude], 14);
                  updateUserLocationMarker(latitude, longitude);
                  updateMockRiders(latitude, longitude);
                }
              },
              (err2) => console.error('Final geolocation attempt failed:', err2),
              { enableHighAccuracy: false, timeout: 5000 }
            );
          },
          { 
            enableHighAccuracy: true, 
            timeout: 8000, 
            maximumAge: 0 
          }
        );

        // Also watch for changes
        navigator.geolocation.watchPosition(
          ({ coords }) => {
            localStorage.setItem('boda_cached_location', JSON.stringify([coords.latitude, coords.longitude]));
            updateUserLocationMarker(coords.latitude, coords.longitude);
          },
          null,
          { enableHighAccuracy: true }
        );
      }
    };

    // --- Geolocation ---
    getAndSetLocation();

    // Store the function for manual triggers if needed (via window or a ref if we had one)
    // For now, we'll just use it here.

    // --- Map Click Handler (for selecting pickup/destination on map) ---
    mapRef.current.on('click', (e) => {
      if (onMapClick && activeInput) {
        onMapClick(e.latlng.lat, e.latlng.lng, activeInput);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // --- Update click handler when activeInput changes ---
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.off('click');
    mapRef.current.on('click', (e) => {
      if (onMapClick && activeInput) {
        onMapClick(e.latlng.lat, e.latlng.lng, activeInput);
      }
    });
  }, [activeInput, onMapClick]);

  // --- Update Pickup Marker ---
  useEffect(() => {
    if (!mapRef.current) return;
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
    }
    if (pickupCoords) {
      pickupMarkerRef.current = L.marker(pickupCoords, { icon: createColoredMarker('#22c55e') })
        .addTo(mapRef.current)
        .bindPopup('<b>Pickup Location</b>')
        .openPopup();
      mapRef.current.flyTo(pickupCoords, 15, { duration: 1 });
    }
    drawRoute();
  }, [pickupCoords]);

  // --- Update Destination Marker ---
  useEffect(() => {
    if (!mapRef.current) return;
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
    }
    if (destinationCoords) {
      destMarkerRef.current = L.marker(destinationCoords, { icon: createColoredMarker('#FE7743') })
        .addTo(mapRef.current)
        .bindPopup('<b>Destination</b>')
        .openPopup();
    }
    drawRoute();
  }, [destinationCoords]);

  // --- Update Active Rider Marker ---
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (activeRiderMarkerRef.current) {
      activeRiderMarkerRef.current.remove();
      activeRiderMarkerRef.current = null;
    }

    if (activeRiderCoords) {
      activeRiderMarkerRef.current = L.marker(activeRiderCoords, { icon: riderIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Your Rider</b>');
      
      // If we only have pickup and rider, fit to them
      if (pickupCoords && !destinationCoords) {
         mapRef.current.fitBounds([activeRiderCoords, pickupCoords], { padding: [100, 100] });
      }
    }
  }, [activeRiderCoords, pickupCoords, destinationCoords]);

  // --- Update Midway Markers ---
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear old midway markers
    midwayMarkersRef.current.forEach(m => m.remove());
    midwayMarkersRef.current = [];

    midwayStops?.forEach((coords, idx) => {
      const m = L.marker(coords, { icon: createColoredMarker('#fbbf24') })
        .addTo(mapRef.current!)
        .bindPopup(`<b>Stop ${idx + 1}</b>`);
      midwayMarkersRef.current.push(m);
    });

    drawRoute();
  }, [midwayStops]);

  // --- Draw Route via OSRM ---
  const drawRoute = async () => {
    // 1. Always remove existing route layer first
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (!mapRef.current || !pickupCoords || !destinationCoords) return;

    try {
      const waypoints = [
        pickupCoords,
        ...(midwayStops || []),
        destinationCoords
      ];

      console.log("Rerouting with waypoints:", waypoints);

      const coordsString = waypoints
        .map(([lat, lng]) => `${lng},${lat}`)
        .join(';');

      // OSRM public API – free and no API key needed
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.routes && json.routes.length > 0) {
        const coords: [number, number][] = json.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] // OSRM returns [lng, lat], Leaflet wants [lat, lng]
        );

        routeLayerRef.current = L.polyline(coords, {
          color: '#FE7743',
          weight: 5,
          opacity: 0.8,
          dashArray: undefined,
        }).addTo(mapRef.current);

        // Fit map to route bounds
        mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
      }
    } catch (err) {
      // Fallback: draw straight line if OSRM fails
      console.warn('OSRM routing failed, drawing fallback line:', err);
      if (pickupCoords && destinationCoords) {
        routeLayerRef.current = L.polyline([pickupCoords, destinationCoords], {
          color: '#FE7743',
          weight: 4,
          opacity: 0.6,
          dashArray: '10, 8',
        }).addTo(mapRef.current!);
        mapRef.current.fitBounds([pickupCoords, destinationCoords], { padding: [60, 60] });
      }
    }
  };

  return (
    <div className={`relative w-full h-full ${className ?? ''}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-[inherit]" style={{ zIndex: 0 }} />

      {/* OSM Attribution style override */}
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
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(254,119,67,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(254,119,67,0); }
        }
        @keyframes leaflet-ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>

      {/* Overlay: Live indicator */}
      <div className="absolute top-4 left-4 z-[400] glass px-3 py-2 rounded-xl border border-white/20 pointer-events-none">
        <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">OSM Live Map</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-bold text-white">4 Riders nearby</p>
        </div>
      </div>

      {activeInput && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] glass px-4 py-2 rounded-full border border-white/20 pointer-events-none animate-bounce">
          <p className="text-xs font-bold text-white whitespace-nowrap">
            📍 Click map to set {activeInput} point
          </p>
        </div>
      )}

      {/* Manual Geolocation Trigger */}
      <button 
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              ({ coords }) => {
                localStorage.setItem('boda_cached_location', JSON.stringify([coords.latitude, coords.longitude]));
                mapRef.current?.flyTo([coords.latitude, coords.longitude], 15);
              },
              (err) => alert("Could not get location: " + err.message),
              { enableHighAccuracy: true }
            );
          }
        }}
        className="absolute bottom-20 right-4 z-[400] w-10 h-10 bg-white dark:bg-slate-900 rounded-full shadow-xl flex items-center justify-center text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:scale-110 active:scale-95 transition-all"
        title="Center on my location"
      >
        <NavigationIcon size={20} />
      </button>
    </div>
  );
};

          export default MapComponent;
