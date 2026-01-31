import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import { updateLocation, fetchFleet } from '../services/api';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import Navbar from './Navbar';

// Professional Custom Marker
const truckIcon = new L.DivIcon({
    html: `<div class="relative">
            <div class="absolute -top-2 -left-2 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>`,
    className: 'custom-truck-icon',
    iconSize: [20, 20],
});

const socket = io('http://localhost:3000');

const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 15, { duration: 1.5 });
    }, [center, map]);
    return null;
};

function MapDashboard() {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState({});
    const [isTracking, setIsTracking] = useState(false);
    const [mapCenter, setMapCenter] = useState([22.9235, 96.5070]);
    const [loading, setLoading] = useState(true);

    const syncFleet = useCallback(async () => {
        if (user?.role !== 'owner') return;
        try {
            const { data } = await fetchFleet();
            const fleetData = {};
            data.forEach(item => {
                if (item.driverId) {
                    fleetData[item.driverId._id] = {
                        name: item.driverId.name,
                        coords: [item.location.coordinates[1], item.location.coordinates[0]],
                        lastUpdate: item.updatedAt,
                        status: item.status || 'active'
                    };
                }
            });
            setDrivers(fleetData);
        } catch (err) {
            console.error("Fleet sync error:", err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        syncFleet();
    }, [syncFleet]);

    useEffect(() => {
        socket.on("location-received", (data) => {
            setDrivers(prev => ({
                ...prev,
                [data.driverId]: { 
                    ...prev[data.driverId], 
                    coords: [data.coordinates.latitude, data.coordinates.longitude],
                    lastUpdate: new Date()
                }
            }));
        });
        return () => socket.off("location-received");
    }, []);

    useEffect(() => {
        let watchId;
        if (isTracking) {
            watchId = navigator.geolocation.watchPosition(
                async (pos) => {
                    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    try {
                        await updateLocation(coords);
                        setMapCenter([coords.latitude, coords.longitude]);
                    } catch (err) {
                        console.error("Tracking update failed");
                    }
                },
                (err) => console.error("GPS Access Denied:", err),
                { enableHighAccuracy: true, distanceFilter: 10 }
            );
        }
        return () => navigator.geolocation.clearWatch(watchId);
    }, [isTracking]);

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans antialiased">
            {user?.role === 'owner' && (
                <aside className="w-85 bg-white border-r border-slate-200 shadow-2xl z-[1001] flex flex-col">
                    <div className="p-6 bg-white border-b border-slate-100">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fleet Live</h2>
                            <div className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Operations</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-xs font-bold text-slate-400">CONNECTING TO FLEET...</p>
                            </div>
                        ) : Object.keys(drivers).length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <p className="text-slate-400 text-sm font-medium">No drivers active on the grid.</p>
                            </div>
                        ) : (
                            Object.entries(drivers).map(([id, driver]) => (
                                <div 
                                    key={id}
                                    onClick={() => setMapCenter(driver.coords)}
                                    className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-300 hover:shadow-lg cursor-pointer transition-all duration-200 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                <span className="text-lg group-hover:filter group-hover:brightness-0 group-hover:invert">🚚</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 leading-tight group-hover:text-indigo-600">{driver.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">ID: {id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-tighter">Live</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            )}

            <main className="flex-1 relative flex flex-col">
                <Navbar />
                
                {/* Mobile/Driver Floating Control */}
                <div className="absolute bottom-8 right-8 z-[1000] flex flex-col items-end space-y-4">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/50 space-y-3">
                        <div className="flex items-center space-x-3 px-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${isTracking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                                {isTracking ? 'Broadcasting Location' : 'GPS Offline'}
                            </span>
                        </div>
                        <button 
                            onClick={() => setIsTracking(!isTracking)}
                            className={`w-full px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all transform active:scale-95 ${
                                isTracking 
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                        >
                            {isTracking ? "End Duty Session" : "Start Duty Session"}
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    <MapContainer center={mapCenter} zoom={13} className="h-full w-full" zoomControl={false}>
                        <ChangeView center={mapCenter} />
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        
                        {Object.entries(drivers).map(([id, driver]) => (
                            <Marker key={id} position={driver.coords} icon={truckIcon}>
                                <Popup closeButton={false} className="custom-popup">
                                    <div className="p-1">
                                        <p className="font-black text-slate-800 text-sm">{driver.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Last Ping: Just now</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </main>
        </div>
    );
}

export default MapDashboard;