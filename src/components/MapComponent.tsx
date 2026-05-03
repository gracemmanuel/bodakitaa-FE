import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Tile Configuration ────────────────────────────────────────────────────────
// CartoDB Dark Matter — free, no API key required, attribution required
const DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
  'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
  // [lat, lng] — Leaflet convention
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  className?: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

// ─── Mock Rider Data (Dar es Salaam area) ─────────────────────────────────────
const MOCK_RIDERS: [number, number][] = [
  [-6.795, 39.208],
  [-6.788, 39.195],
  [-6.802, 39.215],
  [-6.776, 39.221],
];

// ─── OSRM Public Routing API ──────────────────────────────────────────────────
async function fetchRoute(
  from: [number, number],
  to: [number, number]
): Promise<{ coords: [number, number][]; distance: string; duration: string } | null> {
  const [fromLat, fromLng] = from;
  const [toLat, toLng] = to;
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (!data.routes?.[0]) return null;
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );
    return {
      coords,
      distance: (route.distance / 1000).toFixed(1) + ' km',
      duration: Math.ceil(route.duration / 60) + ' min',
    };
  } catch {
    return null;
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────
const MapComponent: React.FC<MapComponentProps> = ({
  pickupCoords,
  destinationCoords,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // ── Initialize map once ──────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Default center: Dar es Salaam, Tanzania
    mapRef.current = L.map(containerRef.current, {
      center: [-6.7924, 39.2026],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    // Dark tile layer (CartoDB, free, no key)
    L.tileLayer(DARK_TILE_URL, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapRef.current);

    // Zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    // Mock rider markers
    MOCK_RIDERS.forEach(coords => {
      L.marker(coords, { icon: riderIcon }).addTo(mapRef.current!);
    });

    // Try to locate user
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          mapRef.current?.flyTo([coords.latitude, coords.longitude], 14, {
            duration: 1.5,
          });
          setIsLocating(false);
        },
        () => setIsLocating(false),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Handle pickup / destination + OSRM routing ───────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous
    pickupMarkerRef.current?.remove();
    destMarkerRef.current?.remove();
    routeLayerRef.current?.remove();
    setRouteInfo(null);

    if (pickupCoords) {
      pickupMarkerRef.current = L.marker(pickupCoords, { icon: pickupIcon })
        .addTo(mapRef.current);
      mapRef.current.flyTo(pickupCoords, 15, { duration: 1.2 });
    }

    if (destinationCoords) {
      destMarkerRef.current = L.marker(destinationCoords, { icon: destIcon })
        .addTo(mapRef.current);
    }

    // Fetch OSRM route when both points are set
    if (pickupCoords && destinationCoords) {
      fetchRoute(pickupCoords, destinationCoords).then(result => {
        if (!result || !mapRef.current) return;

        routeLayerRef.current = L.polyline(result.coords, {
          color: '#FE7743',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
          padding: [60, 60],
        });

        setRouteInfo({ distance: result.distance, duration: result.duration });
      });
    }
  }, [pickupCoords, destinationCoords]);

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden ${className}`}>

      {/* Leaflet ping animation */}
      <style>{`
        @keyframes leaflet-ping {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(15,23,42,0.7) !important;
          backdrop-filter: blur(8px) !important;
          color: rgba(148,163,184,0.7) !important;
          font-size: 9px !important;
          border-radius: 8px 0 0 0 !important;
        }
        .leaflet-control-attribution a { color: rgba(254,119,67,0.8) !important; }
        .leaflet-control-zoom a {
          background: rgba(15,23,42,0.85) !important;
          color: white !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(254,119,67,0.9) !important;
        }
      `}</style>

      {/* Map canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Live indicator overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded-2xl pointer-events-none">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Live Map</p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <p className="text-xs font-bold text-white">{MOCK_RIDERS.length} Riders nearby</p>
        </div>
      </div>

      {/* OSM badge */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-900/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-xl pointer-events-none">
        <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
          🗺 OpenStreetMap
        </p>
      </div>

      {/* Locating spinner */}
      {isLocating && (
        <div className="absolute top-16 left-4 z-[400] bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 pointer-events-none">
          <div className="w-3 h-3 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] text-slate-300 font-semibold">Finding your location…</p>
        </div>
      )}

      {/* Route info panel */}
      {routeInfo && (
        <div className="absolute bottom-4 left-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center justify-around shadow-2xl">
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Distance</p>
            <p className="text-xl font-black text-white">{routeInfo.distance}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">ETA</p>
            <p className="text-xl font-black text-primary-light">{routeInfo.duration}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Route</p>
            <p className="text-[10px] font-bold text-green-400">OSRM ✓</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
