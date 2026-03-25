import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type RealMapProps = {
  lat: number;
  lng: number;
  title: string;
};

export default function RealMap({ lat, lng, title }: RealMapProps) {
  const [locationName, setLocationName] = useState<string>("India Infrastructure Location");

  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        if (!response.ok) throw new Error("Geocoding failed");
        const data = await response.json();
        if (data.display_name) {
          setLocationName(data.display_name);
        }
      } catch (error) {
        // Fallback to default name on API failure
        setLocationName("India Infrastructure Location");
      }
    };

    fetchLocationName();
  }, [lat, lng]);

  return (
    <div className="space-y-3">
      {/* Location Info Header */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground flex items-center gap-1">
          📍 Location: <span className="text-muted-foreground">{locationName}</span>
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          🌍 Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>

      {/* Interactive Satellite Map */}
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        style={{ height: "300px", width: "100%", borderRadius: "12px" }}
      >
        {/* Satellite Imagery Base Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
        />

        {/* Labels Overlay - District, State, Place Names */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels © Esri"
        />

        {/* Location Marker */}
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
