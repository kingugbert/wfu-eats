'use client';

import { useEffect, useRef, useState } from 'react';

const WFU_CENTER = { lat: 36.1335, lng: -80.2762 };
const FIVE_MILES_METERS = 8047;

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.attraction', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.place_of_worship', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
];

// Custom overlay class for text labels below markers
function createLabelOverlayClass() {
  class LabelOverlay extends window.google.maps.OverlayView {
    constructor(position, text, isSelected) {
      super();
      this.position = position;
      this.text = text;
      this.isSelected = isSelected;
      this.div = null;
    }

    onAdd() {
      this.div = document.createElement('div');
      this.div.style.position = 'absolute';
      this.div.style.whiteSpace = 'nowrap';
      this.div.style.color = this.isSelected ? '#C8A14E' : '#d59563';
      this.div.style.fontSize = '11px';
      this.div.style.fontWeight = 'bold';
      this.div.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      this.div.style.textShadow = '0 0 4px #000, 0 0 4px #000, 1px 1px 2px #000';
      this.div.style.pointerEvents = 'none';
      this.div.style.transform = 'translate(-50%, 0)';
      this.div.textContent = this.text;

      const panes = this.getPanes();
      panes.overlayLayer.appendChild(this.div);
    }

    draw() {
      const projection = this.getProjection();
      const pos = projection.fromLatLngToDivPixel(this.position);
      if (pos) {
        this.div.style.left = pos.x + 'px';
        this.div.style.top = (pos.y + 16) + 'px'; // 16px below the marker center
      }
    }

    onRemove() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }
  }

  return LabelOverlay;
}

export default function RestaurantMap({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const labelsRef = useRef([]);
  const infoWindowRef = useRef(null);
  const labelClassRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Wait for Google Maps to load
  useEffect(() => {
    const checkGoogle = () => {
      if (window.google && window.google.maps) {
        setMapReady(true);
      } else {
        setTimeout(checkGoogle, 200);
      }
    };
    checkGoogle();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstanceRef.current) return;

    // Create the label overlay class once Google Maps is loaded
    labelClassRef.current = createLabelOverlayClass();

    const map = new window.google.maps.Map(mapRef.current, {
      center: WFU_CENTER,
      zoom: 13,
      styles: MAP_STYLES,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    mapInstanceRef.current = map;

    // WFU campus marker
    new window.google.maps.Marker({
      position: WFU_CENTER,
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#C8A14E',
        fillOpacity: 1,
        strokeColor: '#000000',
        strokeWeight: 2
      },
      label: {
        text: 'WF',
        color: '#000000',
        fontSize: '9px',
        fontWeight: 'bold'
      },
      title: 'Wake Forest University',
      zIndex: 1000
    });

    // 5-mile radius circle
    new window.google.maps.Circle({
      center: WFU_CENTER,
      radius: FIVE_MILES_METERS,
      map,
      fillColor: '#C8A14E',
      fillOpacity: 0.05,
      strokeColor: '#C8A14E',
      strokeOpacity: 0.3,
      strokeWeight: 1
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, [mapReady]);

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapInstanceRef.current || !restaurants) return;

    // Clear existing markers and labels
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    labelsRef.current.forEach(l => l.setMap(null));
    labelsRef.current = [];

    const LabelOverlay = labelClassRef.current;

    restaurants.forEach(restaurant => {
      const isSelected = selectedRestaurant?.id === restaurant.id;
      const position = { lat: parseFloat(restaurant.latitude), lng: parseFloat(restaurant.longitude) };

      // Circle marker
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 7 : 5,
          fillColor: isSelected ? '#C8A14E' : '#ffffff',
          fillOpacity: 1,
          strokeColor: isSelected ? '#000000' : '#C8A14E',
          strokeWeight: 3
        },
        title: restaurant.name,
        zIndex: isSelected ? 999 : 100
      });

      // Text label overlay below the marker
      if (LabelOverlay) {
        const label = new LabelOverlay(
          new window.google.maps.LatLng(position.lat, position.lng),
          restaurant.name,
          isSelected
        );
        label.setMap(mapInstanceRef.current);
        labelsRef.current.push(label);
      }

      marker.addListener('click', () => {
        onSelectRestaurant(restaurant);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const photoHtml = restaurant.googlePhotoRef
          ? `<img src="${apiUrl}/api/google/photo/${restaurant.googlePhotoRef}?maxWidth=200" style="width:100%;height:100px;object-fit:cover;border-radius:4px;margin-bottom:8px;" onerror="this.style.display='none'" />`
          : '';

        const ratingHtml = restaurant.googleRating
          ? `<div style="color:#C8A14E;font-size:12px;margin-bottom:4px;">${'★'.repeat(Math.round(restaurant.googleRating))}${'☆'.repeat(5 - Math.round(restaurant.googleRating))} ${restaurant.googleRating}</div>`
          : '';

        const priceHtml = restaurant.priceRange
          ? `<span style="color:#9ca3af;margin-left:8px;">${'$'.repeat(restaurant.priceRange)}</span>`
          : '';

        const content = `
          <div style="min-width:180px;max-width:250px;color:#fff;font-family:system-ui;">
            ${photoHtml}
            <div style="font-weight:bold;font-size:14px;margin-bottom:4px;color:#C8A14E;">${restaurant.name}</div>
            ${ratingHtml}
            <div style="font-size:12px;color:#9ca3af;">
              ${restaurant.cuisine || ''}${priceHtml}
            </div>
            <div style="font-size:11px;color:#9ca3af;margin-top:4px;">${restaurant.distanceMiles} mi from campus</div>
            <a href="/restaurants/${restaurant.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:#C8A14E;text-decoration:none;">View details &rarr;</a>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [mapReady, restaurants, selectedRestaurant, onSelectRestaurant]);

  // Pan to selected restaurant
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRestaurant) return;
    mapInstanceRef.current.panTo({
      lat: parseFloat(selectedRestaurant.latitude),
      lng: parseFloat(selectedRestaurant.longitude)
    });
    mapInstanceRef.current.setZoom(15);
  }, [selectedRestaurant]);

  if (!mapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-wfu-gray-800">
        <div className="text-wfu-gray-400">Loading map...</div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
