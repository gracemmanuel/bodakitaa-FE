import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// --- Placeholder Token ---
// IMPORTANT: Replace with your actual Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ3JhY2VtbWFudWVsIiwiYSI6ImNsdzF4bmYxeTAxeTMya28xa3Z4am1oem0ifQ.YourTokenHere'; 

interface MapComponentProps {
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ pickupCoords, destinationCoords, className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(39.2026); // Default to Dar es Salaam
  const [lat, setLat] = useState(-6.7924);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (map.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });
    
    map.current.addControl(geolocate);

    // Auto-trigger geolocation on load
    map.current.on('load', () => {
      geolocate.trigger();
      
      // Try to get current position for initial center
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            map.current?.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              essential: true
            });
            setLng(longitude);
            setLat(latitude);
          },
          (error) => {
            console.error("Error getting location: ", error);
          }
        );
      }

      // Mock Nearby Riders
      const riders = [
        { id: 1, lng: 39.208, lat: -6.795 },
        { id: 2, lng: 39.195, lat: -6.788 },
        { id: 3, lng: 39.215, lat: -6.802 },
      ];

      riders.forEach(rider => {
        const el = document.createElement('div');
        el.className = 'rider-marker';
        el.innerHTML = `<div class="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg)"><path d="M21 3L3 10.5L11.25 12.75L13.5 21L21 3Z" /></svg>
        </div>`;

        new mapboxgl.Marker(el)
          .setLngLat([rider.lng, rider.lat])
          .addTo(map.current!);
      });
    });
  }, []);

  // Update map when pickup or destination changes
  useEffect(() => {
    if (!map.current) return;

    if (pickupCoords) {
      new mapboxgl.Marker({ color: '#FE7743' })
        .setLngLat(pickupCoords)
        .addTo(map.current);
      
      map.current.flyTo({ center: pickupCoords, zoom: 15 });
    }

    if (destinationCoords) {
      new mapboxgl.Marker({ color: '#273F4F' })
        .setLngLat(destinationCoords)
        .addTo(map.current);
    }
  }, [pickupCoords, destinationCoords]);

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden ${className}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Overlay Info */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl z-10 pointer-events-none">
        <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-70 mb-1">Live Map</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-bold text-white">3 Riders nearby</p>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
