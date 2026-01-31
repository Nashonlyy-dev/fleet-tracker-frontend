import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './Components/Login';
import Register from './Components/Register';
import MapDashboard from './Components/MapDashboard'; 
import OwnerDashboard from './Components/OwnerDashboard'; 

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading...</div>;
    
    // 1. If not logged in, go to login
    if (!user) return <Navigate to="/login" replace />;
    
    // 2. If role is not allowed, redirect to their specific home base
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === 'owner' ? "/owner-dashboard" : "/"} replace />;
    }
    
    return children;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Driver Route (Home) */}
                <Route path="/" element={
                    <ProtectedRoute allowedRoles={['driver']}>
                        <MapDashboard />
                    </ProtectedRoute>
                } />

                {/* Owner Route */}
                <Route path="/owner-dashboard" element={
                    <ProtectedRoute allowedRoles={['owner']}>
                        <OwnerDashboard />
                    </ProtectedRoute>
                } />

                {/* Admin Route (If you have one) */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <div className="p-10 text-2xl font-bold">Admin Panel Coming Soon</div>
                    </ProtectedRoute>
                } />

                {/* Catch-all: Redirects to login if unknown */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;