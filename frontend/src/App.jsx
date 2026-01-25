import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';


// --- Leaflet Icon Fix (Required for Vite) ---
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;





// --- Socket Connection ---
const socket = io('http://localhost:3000');

// --- Helper Component: Auto-Centers Map ---
const ChangeView = ({ center }) => {
    const map = useMap();
    if (center) {
        map.flyTo(center, 16, { duration: 1.5 });
    }
    return null;
};

const App = () => {
    const [drivers, setDrivers] = useState({});
    const [mapCenter, setMapCenter] = useState([22.9235, 96.5070]); // Default: Mogok
    const [isTracking, setIsTracking] = useState(false);

    // 1. Listen for updates from other drivers (Socket)
    useEffect(() => {
        socket.on("location-received", (data) => {
            console.log("Update from backend:", data);
            setDrivers((prev) => ({
                ...prev,
                [data.driverId]: data
            }));
            setMapCenter([data.coordinates.latitude, data.coordinates.longitude]);
        });
        return () => socket.off("location-received");
    }, []);

    // 2. Function to Send Location to API every 5 seconds
    useEffect(() => {
        let interval;

        if (isTracking) {
            interval = setInterval(() => {
                // Use real GPS or fallback to Mogok coordinates for testing
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        
                        const payload = {
                            driverId: "Mogok_Driver_01",
                            coordinates: { latitude, longitude }
                        };

                        try {
                            await fetch('http://localhost:3000/api/v1/locations/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });
                            console.log("Sent update to API:", payload);
                        } catch (err) {
                            console.error("API Error:", err);
                        }
                    },
                    (err) => console.error("GPS Error:", err),
                    { enableHighAccuracy: true }
                );
            }, 5000); // 5 Seconds
        }

        return () => clearInterval(interval);
    }, [isTracking]);

    return (
        <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
            
            {/* Tracking Control UI */}
            <div style={{
                position: "absolute", top: "10px", left: "50px", zIndex: 1000,
                background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
            }}>
                <h4 style={{ margin: "0 0 10px 0" }}>Driver Controls</h4>
                <button 
                    onClick={() => setIsTracking(!isTracking)}
                    style={{
                        padding: "8px 15px",
                        backgroundColor: isTracking ? "#ff4d4d" : "#4CAF50",
                        color: "white", border: "none", borderRadius: "4px", cursor: "pointer"
                    }}
                >
                    {isTracking ? "🛑 Stop Tracking" : "🛰️ Start Tracking (Every 5s)"}
                </button>
                <p style={{ fontSize: "11px", marginTop: "5px" }}>
                    Status: {isTracking ? "🟢 Sending Data" : "🔴 Offline"}
                </p>
            </div>

            <MapContainer 
                center={mapCenter} 
                zoom={15} 
                style={{ height: "100%", width: "100%" }}
            >
                <ChangeView center={mapCenter} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {Object.values(drivers).map((driver) => (
                    <Marker 
                        key={driver.driverId} 
                        position={[driver.coordinates.latitude, driver.coordinates.longitude]}
                    >
                        <Popup>
                            <b>Driver:</b> {driver.driverId} <br />
                            <b>Last Update:</b> {new Date().toLocaleTimeString()}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default App;