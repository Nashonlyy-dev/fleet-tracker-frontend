import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useAuth } from "../context/AuthContext";
import { fetchFleet } from "../services/api";
import Navbar from "./Navbar";
import AddDriverModal from "./AddDriverModal";
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Custom Marker Icon Logic - Reduces "Map Fatigue"
const createCustomIcon = (status) => {
  const color = status === 'active' ? '#10b981' : '#f59e0b';
  return new L.DivIcon({
    html: `<div style="background-color: ${color};" class="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
    className: 'custom-marker',
    iconSize: [16, 16],
  });
};

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.5 });
  }, [coords, map]);
  return null;
};

const OwnerDashboard = () => {
  const navigate = useNavigate(); 
  const { logout } = useAuth();
  
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoords, setSelectedCoords] = useState([22.9235, 96.507]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFleet = useCallback(async () => {
    try {
      const { data } = await fetchFleet();
      setDrivers(data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout(); 
        navigate('/login', { replace: true }); 
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadFleet();
    const interval = setInterval(loadFleet, 10000);
    return () => clearInterval(interval);
  }, [loadFleet]);

  // Efficiency: Filter drivers without re-rendering the whole map unnecessarily
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => 
      d.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drivers, searchTerm]);

  // Psychology: Quick glance stats for "Peace of Mind"
  const stats = useMemo(() => ({
    total: drivers.length,
    active: drivers.filter(d => d.status === 'active').length,
    idle: drivers.filter(d => d.status !== 'active').length
  }), [drivers]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans antialiased text-slate-900">
      <Navbar />

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar: Designed for "List Scanning" */}
        <aside className="w-85 bg-white border-r border-slate-200 z-20 flex flex-col shadow-2xl">
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">Fleet Control</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-md"
                title="Add New Driver"
              >
                <span className="text-2xl leading-none">+</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
                <p className="text-lg font-black text-slate-700">{stats.total}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100">
                <p className="text-[10px] uppercase font-bold text-emerald-600">Live</p>
                <p className="text-lg font-black text-emerald-700">{stats.active}</p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg text-center border border-amber-100">
                <p className="text-[10px] uppercase font-bold text-amber-600">Idle</p>
                <p className="text-lg font-black text-amber-700">{stats.idle}</p>
              </div>
            </div>

            {/* Search: Essential for large fleets */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Search driver or plate..."
                className="w-full bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Driver List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-2">
                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-medium">Syncing fleet...</p>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No drivers found</p>
              </div>
            ) : (
              filteredDrivers.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedCoords([item.location.coordinates[1], item.location.coordinates[0]])}
                  className="group p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all duration-200 relative overflow-hidden"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                      <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {item.driverId?.name || "New Recruit"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">
                      {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 ml-5">ID: {item._id.slice(-6).toUpperCase()}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Map: High Contrast for visibility */}
        <main className="flex-1 relative">
          <MapContainer 
            center={selectedCoords} 
            zoom={13} 
            className="h-full w-full z-10"
            zoomControl={false} // Clean UI
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Cleaner map style
              attribution='&copy; OpenStreetMap contributors'
            />
            <RecenterMap coords={selectedCoords} />

            {filteredDrivers.map((item) => {
              const hasCoords = item.location?.coordinates?.length === 2;
              if (!hasCoords) return null;

              return (
                <Marker
                  key={item._id}
                  position={[item.location.coordinates[1], item.location.coordinates[0]]}
                  icon={createCustomIcon(item.status || 'active')}
                >
                  <Popup closeButton={false} className="custom-popup">
                    <div className="p-1">
                      <p className="font-black text-slate-800 text-sm">{item.driverId?.name}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">● Online Now</p>
                      <button className="mt-2 w-full py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded hover:bg-indigo-100 transition-colors">
                        VIEW PROFILE
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Subtle Map Overlay for "Live" status */}
          <div className="absolute top-6 right-6 z-20 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/50">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">System Live</span>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <AddDriverModal onClose={() => setShowModal(false)} refresh={loadFleet} />
      )}
    </div>
  );
};

export default OwnerDashboard;