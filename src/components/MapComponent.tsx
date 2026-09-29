import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FuelPumpStation } from '../types';

interface MapComponentProps {
  mode: 'select_location' | 'track_order' | 'view_pumps';
  center?: [number, number];
  zoom?: number;
  pumps?: FuelPumpStation[];
  selectedPumpId?: string;
  onSelectPump?: (pump: FuelPumpStation) => void;
  selectedLocation?: [number, number];
  onSelectLocation?: (lat: number, lng: number) => void;
  driverLocation?: [number, number];
  destinationLocation?: [number, number];
  driverName?: string;
  driverVehicleNumber?: string;
  interactive?: boolean;
  className?: string;
}

// Custom Leaflet SVG Icons to avoid broken default marker png assets
const createCustomIcon = (type: 'pump' | 'user' | 'driver' | 'station', brandColor = '#f59e0b', label = '') => {
  let svgContent = '';

  if (type === 'driver') {
    svgContent = `
      <div style="background-color: #0f172a; color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); border: 2.5px solid #f59e0b; position: relative;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        <span style="position: absolute; -top: 4px; right: -4px; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; border: 2px solid white;"></span>
      </div>
    `;
  } else if (type === 'user') {
    svgContent = `
      <div style="background-color: #ef4444; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); border: 2.5px solid white;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `;
  } else {
    // Pump station icon
    svgContent = `
      <div style="background-color: ${brandColor}; color: white; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 2px solid white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 22h12"></path>
          <path d="M4 9h10"></path>
          <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path>
          <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path>
        </svg>
      </div>
    `;
  }

  return L.divIcon({
    html: svgContent,
    className: 'custom-leaflet-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const getBrandColor = (brand: string) => {
  switch (brand) {
    case 'Nayara': return '#059669'; // Emerald
    case 'Reliance': return '#0284c7'; // Blue
    case 'HP': return '#2563eb'; // HP Blue
    case 'IndianOil': return '#ea580c'; // Saffron Orange
    case 'Shell': return '#dc2626'; // Shell Red/Yellow
    case 'Bharat Petroleum': return '#ca8a04'; // BPCL Yellow
    default: return '#0284c7';
  }
};

export const MapComponent: React.FC<MapComponentProps> = ({
  mode,
  center = [23.0330, 72.5120],
  zoom = 13,
  pumps = [],
  selectedPumpId,
  onSelectPump,
  selectedLocation,
  onSelectLocation,
  driverLocation,
  destinationLocation,
  driverName = 'Bowser Technician',
  driverVehicleNumber = 'GJ-01-FL-9281',
  interactive = true,
  className = 'h-80 w-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive ? 'center' : false,
      doubleClickZoom: interactive
    });

    // Clean OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Handle map click for location selection
    if (mode === 'select_location' && onSelectLocation) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      });
    }

    // Force redraw on mount
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Layers when state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    const boundsPoints: L.LatLngExpression[] = [];

    // Render Pumps in select_location or view_pumps mode
    if (mode === 'select_location' || mode === 'view_pumps') {
      pumps.forEach(pump => {
        const isSelected = pump.id === selectedPumpId;
        const color = getBrandColor(pump.brand);
        const icon = createCustomIcon('station', color);

        const marker = L.marker([pump.lat, pump.lng], { icon }).addTo(markersLayer);
        boundsPoints.push([pump.lat, pump.lng]);

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-900';
        popupContent.innerHTML = `
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${pump.name}</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${pump.address}</div>
          <div style="display: flex; gap: 8px; margin-bottom: 8px; font-size: 12px;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">Petrol: <b>₹${pump.petrolPrice}/L</b></span>
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">Diesel: <b>₹${pump.dieselPrice}/L</b></span>
          </div>
          <div style="font-size: 11px; color: #059669; font-weight: 600; margin-bottom: 8px;">★ ${pump.rating} Rating · ${pump.openHours}</div>
          <button id="btn-select-${pump.id}" style="width: 100%; background: #0f172a; color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; border: none; cursor: pointer;">
            ${isSelected ? '✓ Selected Station' : 'Select This Station'}
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-${pump.id}`);
          if (btn && onSelectPump) {
            btn.onclick = () => {
              onSelectPump(pump);
              marker.closePopup();
            };
          }
        });

        if (isSelected) {
          marker.openPopup();
        }
      });
    }

    // Render User Selected Location
    if (selectedLocation) {
      const userIcon = createCustomIcon('user');
      const userMarker = L.marker(selectedLocation, { icon: userIcon }).addTo(markersLayer);
      userMarker.bindPopup('<b style="font-size:12px;">📍 Delivery Location</b><br><span style="font-size:11px; color:#64748b;">Click anywhere to reposition</span>');
      boundsPoints.push(selectedLocation);
    }

    // Render Live Driver and Destination in Tracking Mode
    if (mode === 'track_order' && driverLocation && destinationLocation) {
      // Driver Marker
      const driverIcon = createCustomIcon('driver');
      const driverMarker = L.marker(driverLocation, { icon: driverIcon }).addTo(markersLayer);
      driverMarker.bindPopup(`
        <div style="font-size: 12px;">
          <b>🚚 Fuel Bowser En-Route</b><br>
          <span style="color:#64748b;">Driver: ${driverName}</span><br>
          <span style="color:#64748b;">Vehicle: ${driverVehicleNumber}</span>
        </div>
      `);

      // Destination Marker
      const destIcon = createCustomIcon('user');
      const destMarker = L.marker(destinationLocation, { icon: destIcon }).addTo(markersLayer);
      destMarker.bindPopup('<b>📍 Your Delivery Point</b>');

      boundsPoints.push(driverLocation);
      boundsPoints.push(destinationLocation);

      // Connecting Route Line
      const routeLine = L.polyline([driverLocation, destinationLocation], {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);
      routePolylineRef.current = routeLine;

      // Fit bounds nicely with padding
      if (boundsPoints.length >= 2) {
        map.fitBounds(L.latLngBounds(boundsPoints), { padding: [50, 50], maxZoom: 15 });
      }
    } else if (boundsPoints.length > 0 && mode !== 'select_location') {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40], maxZoom: 15 });
    }
  }, [mode, pumps, selectedPumpId, selectedLocation, driverLocation, destinationLocation]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />
      {mode === 'select_location' && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[1000] flex items-center justify-between rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-white backdrop-blur-sm shadow-md">
          <span>Click on map to position delivery pin</span>
          <span className="font-mono text-slate-300">
            {selectedLocation ? `${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}` : 'Tap to place'}
          </span>
        </div>
      )}
    </div>
  );
};
