import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../../ui/button';
import { X, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  branchName?: string;
}

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
  setSelectedLocation: (location: {lat: number, lng: number, address?: string}) => void;
}

// Component to handle map click events and marker placement
const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, setSelectedLocation }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPosition: [number, number] = [lat, lng];
      setPosition(newPosition);
      
      // Reverse geocoding using Nominatim (OpenStreetMap)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          setSelectedLocation({ 
            lat, 
            lng, 
            address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}` 
          });
        })
        .catch((error) => {
          console.error('Geocoding error:', error);
          setSelectedLocation({ lat, lng });
        });
    },
  });

  return position === null ? null : (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          const newPosition: [number, number] = [position.lat, position.lng];
          setPosition(newPosition);
          setSelectedLocation({ lat: position.lat, lng: position.lng });
        }
      }}
    />
  );
};

// Component to update map center when needed
const MapUpdater: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 13 }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  branchName
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to New York
  const [mapKey, setMapKey] = useState(0); // Force map re-render when needed

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          const newPosition: [number, number] = [lat, lng];
          
          setPosition(newPosition);
          setMapCenter(newPosition);
          setSelectedLocation({ lat, lng, address: 'Current Location' });
          setMapKey(prev => prev + 1); // Force map update
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please select a location on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Reset position when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      setSelectedLocation(null);
      setMapKey(prev => prev + 1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 h-5/6 max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold dark:text-white">
              Select Location {branchName && `for ${branchName}`}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click on the map to select a location, or drag the marker to adjust
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="flex-1 p-4">
          <div className="h-full relative">
            <MapContainer
              key={mapKey}
              center={mapCenter}
              zoom={10}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              className="border dark:border-gray-600"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker 
                position={position} 
                setPosition={setPosition} 
                setSelectedLocation={setSelectedLocation}
              />
              <MapUpdater center={mapCenter} zoom={position ? 13 : 10} />
            </MapContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetCurrentLocation}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Location
            </Button>
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="px-4 pb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Selected Location:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
              {selectedLocation.address && selectedLocation.address !== 'Current Location' && (
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {selectedLocation.address}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSelector;