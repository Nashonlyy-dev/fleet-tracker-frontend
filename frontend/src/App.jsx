import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

let port = import.meta.env.PORT || 3000;

// 1. Connect to your Backend (ensure the port matches your server)
const socket = io("http://localhost:3000");


const App = () => {

    const [drivers, setdriver] = useState({})

    useEffect(() => {
      socket.on("location-received", (data)=>{
         console.log("new data revived", data);
         
         setdriver((prev) =>({
            ...prev,
            [data.driverId]: data
         }))
      })
    
      return () => {
        socket.off("location recived");
      }
    },)
    
    
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer 
        center={[18.5204, 73.8567]} // Default center (e.g., Pune, India)
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
      >
        {/* 6. The "Tiles" (The actual map images) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* 7. Loop through the drivers object and create a marker for each */}
        {Object.values(drivers).map((driver) => (
          <Marker 
            key={driver.driverId} 
            position={[driver.coordinates.latitude, driver.coordinates.longitude]}
          >
            <Popup>
              Driver: {driver.driverId}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;