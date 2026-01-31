import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
});

// This interceptor ensures the token is pulled fresh from storage 
// EVERY time a request is made.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const fetchFleet = () => API.get('/owner/fleet');
export const registerDriver = (data) => API.post('/owner/add-driver', data);
export const updateLocation = (coords) => API.post('/location/update', coords);

export default API;