'use client';
import { useEffect, useRef, useState } from 'react';
import { Star, Heart, Navigation, Clock } from 'lucide-react';

const WFU_CENTER = [36.1335, -80.2762];

export default function RestaurantMap({ restaurants = [], onSelectRestaurant, selectedId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: WFU_CENTER,
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Dark-themed tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // WFU campus marker
      const campusIcon = L.divIcon({
        html: `<div style="
          width: 40px; height: 40px; background: #C8A14E; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: bold; color: black;
          box-shadow: 0 0 20px rgba(200,161,78,0.5); border: 3px solid #111;
        ">WF</div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker(WFU_CENTER, { icon: campusIcon })
        .addTo(map)
        .bindPopup('<strong class="text-wfu-gold">Wake Forest University</strong><br>Campus Center');

      // 5-mile radius circle
      L.circle(WFU_CENTER, {
        radius: 8047, // 5 miles in meters
        color: '#C8A14E',
        fillColor: '#C8A14E',
        fillOpacity: 0.04,
        weight: 1,
        dashArray: '8, 8',
        opacity: 0.3,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Clear old markers
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      restaurants.forEach((r) => {
        const isSelected = r.id === selectedId;
        const icon = L.divIcon({
          html: `<div style="
            width: ${isSelected ? 36 : 30}px; height: ${isSelected ? 36 : 30}px;
            background: ${isSelected ? '#C8A14E' : '#2A2A2A'};
            border: 2px solid ${isSelected ? '#FFF' : '#C8A14E'};
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
            box-shadow: ${isSelected ? '0 0 16px rgba(200,161,78,0.6)' : '0 2px 8px rgba(0,0,0,0.5)'};
          ">
            <span style="font-size: 14px;">🍽️</span>
          </div>`,
          className: '',
          iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
          iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
        });

        const marker = L.marker([r.latitude, r.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px; font-family: -apple-system, sans-serif;">
              <strong style="color: #C8A14E; font-size: 14px;">${r.name}</strong>
              <div style="color: #B0B0B0; font-size: 12px; margin-top: 4px;">${r.cuisine_type} · ${r.price_range}</div>
              <div style="color: #8A8A8A; font-size: 11px; margin-top: 4px;">${r.address}</div>
              <div style="color: #C8A14E; font-size: 12px; margin-top: 6px;">
                ${'★'.repeat(Math.round(r.avg_rating || 0))}${'☆'.repeat(5 - Math.round(r.avg_rating || 0))}
                <span style="color: #8A8A8A; margin-left: 4px;">${Number(r.distance_calc || 0).toFixed(1)} mi</span>
              </div>
            </div>
          `, { className: 'wfu-popup' })
          .on('click', () => onSelectRestaurant?.(r));

        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [restaurants, selectedId, mapReady, onSelectRestaurant]);

  // Pan to selected restaurant
  useEffect(() => {
    if (!mapReady || !selectedId || !mapInstanceRef.current) return;
    const r = restaurants.find(r => r.id === selectedId);
    if (r) {
      mapInstanceRef.current.setView([r.latitude, r.longitude], 15, { animate: true });
    }
  }, [selectedId, mapReady, restaurants]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-wfu-gray-700">
      <div ref={mapRef} className="w-full h-full" />
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-wfu-gray-700
                      rounded-lg px-3 py-2 text-xs text-wfu-gray-300 z-[1000]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-wfu-gold rounded-full" />
          <span>WFU Campus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-wfu-gray-700 border border-wfu-gold rounded-full" />
          <span>Restaurant</span>
        </div>
      </div>
    </div>
  );
}
