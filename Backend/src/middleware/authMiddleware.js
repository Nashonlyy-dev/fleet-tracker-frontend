import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. PROTECT MIDDLEWARE: Checks if the user is logged in
export const protect = async (req, res, next) => {
    let token;

    // Check if the Authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (split "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from the database and attach to the request object
            // We exclude the password for security
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Move to the next function/controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// 2. IS-OWNER MIDDLEWARE: Checks if the user has the 'owner' role
export const isOwner = (req, res, next) => {
    // Check if req.user exists (set by protect) and check their role
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Only Owners can access this.' });
    }
};