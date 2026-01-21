import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// 1. FIX: Import Leaflet CSS and local images for the marker
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// 2. FIX: Manually set the default icon paths (required for Vite/React)
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 3. Connect to Backend
const socket = io("http://localhost:3000");

// 4. HELPER COMPONENT: This zooms the map to the driver automatically
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13); // Smoothly glides the map to the new location
        }
    }, [position, map]);
    return null;
};

const App = () => {
    const [drivers, setDrivers] = useState({});
    const [lastPos, setLastPos] = useState(null); // Used for auto-centering

    useEffect(() => {
        socket.on("location-received", (data) => {
            console.log("New location received:", data);
            
            // Extract coordinates for the map
            const newPos = [data.coordinates.latitude, data.coordinates.longitude];
            
            setDrivers((prev) => ({
                ...prev,
                [data.driverId]: data
            }));

            setLastPos(newPos); // Update the camera target
        });

        return () => {
            socket.off("location-received");
        };
    }, []);

    return (
        <div style={{ height: "100vh", width: "100vw" }}>
            <MapContainer 
                center={[12.9716, 77.5946]} // Default to Bangalore to match your test
                zoom={12} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {/* This line moves the map camera automatically */}
                {lastPos && <RecenterMap position={lastPos} />}

                {Object.values(drivers).map((driver) => (
                    <Marker 
                        key={driver.driverId} 
                        position={[driver.coordinates.latitude, driver.coordinates.longitude]}
                    >
                        <Popup>
                            <strong>Driver:</strong> {driver.driverId} <br />
                            <strong>Time:</strong> {new Date().toLocaleTimeString()}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default App;