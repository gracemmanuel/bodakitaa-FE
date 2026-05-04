import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Fix default marker icons (common Leaflet + Vite issue) ---
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

interface MapComponentProps {
  pickupCoords?: [number, number]; // [lat, lng]
  destinationCoords?: [number, number];
  className?: string;
  onMapClick?: (lat: number, lng: number, type: 'pickup' | 'destination') => void;
  activeInput?: 'pickup' | 'destination';
}

const MapComponent: React.FC<MapComponentProps> = ({
  pickupCoords,
  destinationCoords,
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

  // --- Initialize Map ---
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    // Default center: Dar es Salaam
    mapRef.current = L.map(mapContainer.current, {
      center: [-6.7924, 39.2083],
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

    // --- Mock nearby riders ---
    const riderPositions: [number, number][] = [
      [-6.790, 39.210],
      [-6.795, 39.200],
      [-6.800, 39.215],
      [-6.785, 39.205],
    ];

    riderPositions.forEach((pos) => {
      const m = L.marker(pos, { icon: createRiderMarker() }).addTo(mapRef.current!);
      riderMarkersRef.current.push(m);
    });

    // --- Geolocation ---
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          mapRef.current?.flyTo([coords.latitude, coords.longitude], 14, { duration: 1.5 });
        },
        (err) => console.warn('Geolocation error:', err)
      );
    }

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

  // --- Draw Route via OSRM ---
  const drawRoute = async () => {
    if (!mapRef.current) return;
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    if (!pickupCoords || !destinationCoords) return;

    try {
      const [pLat, pLng] = pickupCoords;
      const [dLat, dLng] = destinationCoords;

      // OSRM public API – free and no API key needed
      const url = `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson`;
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
    </div>
  );
};

export default MapComponent;
