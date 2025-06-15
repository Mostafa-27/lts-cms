import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPreviewProps {
  mapLocation: string;
  branchName: string;
  height?: number;
}

const MapPreview: React.FC<MapPreviewProps> = ({ mapLocation, branchName, height = 200 }) => {
  // Extract coordinates from various URL formats
  const extractCoordinates = (url: string): [number, number] | null => {
    try {
      // Try to extract from uMap URL
      const uMapMatch = url.match(/marker=([^&]+)/);
      if (uMapMatch) {
        const coords = uMapMatch[1].split(',');
        if (coords.length >= 2) {
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng];
          }
        }
      }

      // Try to extract from OpenStreetMap embed URL
      const osmMatch = url.match(/marker=([^&]+)/);
      if (osmMatch) {
        const coords = osmMatch[1].split(',');
        if (coords.length >= 2) {
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng];
          }
        }
      }

      // Try to extract from Google Maps embed URL
      const googleMatch = url.match(/q=([^&]+)/);
      if (googleMatch) {
        const coords = googleMatch[1].split(',');
        if (coords.length >= 2) {
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng];
          }
        }
      }

      // Try to extract coordinates from bbox parameter
      const bboxMatch = url.match(/bbox=([^&]+)/);
      if (bboxMatch) {
        const coords = bboxMatch[1].split(',');
        if (coords.length >= 4) {
          const lng1 = parseFloat(coords[0]);
          const lat1 = parseFloat(coords[1]);
          const lng2 = parseFloat(coords[2]);
          const lat2 = parseFloat(coords[3]);
          if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
            // Calculate center point
            const centerLat = (lat1 + lat2) / 2;
            const centerLng = (lng1 + lng2) / 2;
            return [centerLat, centerLng];
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting coordinates:', error);
      return null;
    }
  };

  const coordinates = extractCoordinates(mapLocation);

  // If we can't extract coordinates, fall back to iframe
  if (!coordinates) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <iframe
          src={mapLocation}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map for ${branchName}`}
        />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <MapContainer
        center={coordinates}
        zoom={15}
        style={{ height: `${height}px`, width: '100%' ,zIndex: 1 }}
        scrollWheelZoom={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />        <Marker position={coordinates}>
          <Popup>
            <div className="text-center">
              <strong>{branchName}</strong>
              <br />
              <small>
                {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
              </small>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPreview;
